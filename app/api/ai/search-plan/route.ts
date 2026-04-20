/**
 * Genera un plan de búsqueda personalizado para una mascota perdida.
 *  - POST /api/ai/search-plan  { postId, force? }
 *  - Solo el autor del post puede pedirlo.
 *  - Cacheado en Post.searchPlan; `force: true` regenera.
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { openai, AI_MODEL, SEARCH_PLAN_SYSTEM, buildSearchPlanUserPrompt } from "@/lib/ai";
import { applyRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await requireUser();
  const rl = applyRateLimit(req, "aiChat", user.id);
  if (rl) return rl;

  const { postId, force } = (await req.json().catch(() => ({}))) as {
    postId?: string;
    force?: boolean;
  };
  if (!postId) {
    return NextResponse.json({ error: "postId requerido" }, { status: 400 });
  }

  const post = await db.post.findUnique({
    where: { id: postId },
    include: { pet: true },
  });
  if (!post) return NextResponse.json({ error: "Post no encontrado" }, { status: 404 });
  if (post.authorId !== user.id) {
    return NextResponse.json({ error: "Solo el autor puede generar el plan" }, { status: 403 });
  }
  if (post.kind !== "LOST" || !post.pet) {
    return NextResponse.json({ error: "Solo aplica a reportes de mascotas perdidas" }, { status: 400 });
  }

  if (post.searchPlan && !force) {
    return NextResponse.json({
      plan: post.searchPlan,
      generatedAt: post.searchPlanAt?.toISOString() ?? null,
      cached: true,
    });
  }

  const hoursSinceLost = post.lostAt
    ? Math.max(0, (Date.now() - new Date(post.lostAt).getTime()) / 3_600_000)
    : 24;

  const userPrompt = buildSearchPlanUserPrompt({
    petName: post.pet.name,
    petKind: post.pet.kind,
    breed: post.pet.breed,
    color: post.pet.color,
    ageYears: post.pet.ageYears,
    areaLabel: post.areaLabel,
    description: post.description,
    hoursSinceLost,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      temperature: 0.6,
      max_tokens: 1100,
      messages: [
        { role: "system", content: SEARCH_PLAN_SYSTEM },
        { role: "user", content: userPrompt },
      ],
    });
    const plan = completion.choices[0]?.message?.content?.trim();
    if (!plan) throw new Error("respuesta vacía de OpenAI");

    const now = new Date();
    await db.post.update({
      where: { id: post.id },
      data: { searchPlan: plan, searchPlanAt: now },
    });
    return NextResponse.json({ plan, generatedAt: now.toISOString(), cached: false });
  } catch (err) {
    logger.error({ err, postId }, "search-plan generation failed");
    return NextResponse.json({ error: "No pudimos generar el plan. Intenta de nuevo." }, { status: 500 });
  }
}
