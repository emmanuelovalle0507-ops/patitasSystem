import { NextResponse } from "next/server";
import { listComments } from "@/lib/queries/comments";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

/**
 * GET /api/comments/[postId]?cursor=...&take=30
 * Lista pública de comentarios paginados. No requiere auth.
 */
export async function GET(req: Request, { params }: { params: { postId: string } }) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const takeRaw = Number(searchParams.get("take") ?? 30);
  const take = Number.isFinite(takeRaw) ? Math.min(100, Math.max(1, takeRaw)) : 30;

  try {
    const page = await listComments(params.postId, { cursor, take });
    return NextResponse.json(page);
  } catch (err) {
    logger.error({ err, postId: params.postId }, "list comments failed");
    return NextResponse.json({ error: "No se pudieron cargar comentarios" }, { status: 500 });
  }
}
