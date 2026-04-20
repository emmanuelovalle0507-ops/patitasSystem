import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { moderatePetImage } from "@/lib/moderation";
import { applyRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = applyRateLimit(req, "aiModerate", user.id);
  if (limited) return limited;

  const { imageUrl } = await req.json().catch(() => ({ imageUrl: null }));
  if (!imageUrl || typeof imageUrl !== "string") {
    return NextResponse.json({ error: "imageUrl requerido" }, { status: 400 });
  }
  try {
    const result = await moderatePetImage(imageUrl);
    return NextResponse.json(result);
  } catch (err) {
    logger.error({ err, userId: user.id }, "ai/moderate failed");
    return NextResponse.json({ error: "Moderación no disponible" }, { status: 503 });
  }
}
