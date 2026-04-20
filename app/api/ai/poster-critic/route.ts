/**
 * Revisa un borrador de cartel antes de imprimirlo y devuelve issues/strengths.
 *  - POST /api/ai/poster-critic  { postId, draft }
 *  - Solo el autor del post puede pedirlo.
 *  - La IA retorna JSON (response_format: json_object).
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  openai,
  AI_MODEL,
  POSTER_CRITIC_SYSTEM,
  buildPosterCriticUserPrompt,
  type PosterCritique,
} from "@/lib/ai";
import { applyRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { z } from "zod";

export const runtime = "nodejs";

const DraftSchema = z.object({
  headline: z.string().max(60).default("SE BUSCA"),
  petName: z.string().max(60),
  reward: z.string().max(80).nullable().optional(),
  urgent: z.boolean().default(false),
  description: z.string().max(1500).default(""),
  areaLabel: z.string().max(200).nullable().optional(),
  hasImage: z.boolean().default(false),
  breed: z.string().max(80).nullable().optional(),
  colorText: z.string().max(80).nullable().optional(),
  sizeText: z.string().max(40).nullable().optional(),
  gender: z.string().max(20).nullable().optional(),
  ageText: z.string().max(40).nullable().optional(),
  collar: z.string().max(120).nullable().optional(),
  marks: z.string().max(200).nullable().optional(),
  contactPhone: z.string().max(40).nullable().optional(),
  contactWhatsapp: z.string().max(40).nullable().optional(),
  contactEmail: z.string().max(120).nullable().optional(),
  hasQR: z.boolean().default(false),
  template: z.string().max(30).default("classic"),
});

const BodySchema = z.object({
  postId: z.string(),
  draft: DraftSchema,
});

export async function POST(req: Request) {
  const user = await requireUser();
  const rl = applyRateLimit(req, "aiChat", user.id);
  if (rl) return rl;

  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }
  const { postId, draft } = parsed.data;

  const post = await db.post.findUnique({
    where: { id: postId },
    include: { pet: true },
  });
  if (!post) return NextResponse.json({ error: "Post no encontrado" }, { status: 404 });
  if (post.authorId !== user.id) {
    return NextResponse.json({ error: "Solo el autor puede pedir la revisión" }, { status: 403 });
  }

  const hoursSinceLost = post.lostAt
    ? Math.max(0, (Date.now() - new Date(post.lostAt).getTime()) / 3_600_000)
    : 24;

  const userPrompt = buildPosterCriticUserPrompt({
    headline: draft.headline,
    petName: draft.petName,
    petKind: post.pet?.kind ?? "OTHER",
    reward: draft.reward || null,
    urgent: draft.urgent,
    hoursSinceLost,
    description: draft.description,
    areaLabel: draft.areaLabel || null,
    hasImage: draft.hasImage,
    breed: draft.breed || null,
    colorText: draft.colorText || null,
    sizeText: draft.sizeText || null,
    gender: draft.gender || null,
    ageText: draft.ageText || null,
    collar: draft.collar || null,
    marks: draft.marks || null,
    contactPhone: draft.contactPhone || null,
    contactWhatsapp: draft.contactWhatsapp || null,
    contactEmail: draft.contactEmail || null,
    hasQR: draft.hasQR,
    template: draft.template,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      temperature: 0.3,
      max_tokens: 700,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: POSTER_CRITIC_SYSTEM },
        { role: "user", content: userPrompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) throw new Error("respuesta vacía");
    const critique = JSON.parse(raw) as PosterCritique;

    // Validación defensiva mínima
    if (typeof critique.score !== "number" || !Array.isArray(critique.issues)) {
      throw new Error("formato inválido");
    }

    await db.post.update({
      where: { id: post.id },
      data: { posterCritique: raw },
    }).catch(() => undefined);

    return NextResponse.json(critique);
  } catch (err) {
    logger.error({ err, postId }, "poster-critic failed");
    return NextResponse.json({ error: "No pudimos revisar el cartel. Intenta de nuevo." }, { status: 500 });
  }
}
