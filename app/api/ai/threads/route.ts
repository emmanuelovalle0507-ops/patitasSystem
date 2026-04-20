import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

/** Lista los hilos de IA del usuario (más recientes primero). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const threads = await db.aiThread.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true, title: true, createdAt: true,
      _count: { select: { messages: true } },
    },
  });
  return NextResponse.json({ items: threads });
}

/** Borra un hilo (y por cascade sus mensajes). */
export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json().catch(() => ({ id: null }));
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

  try {
    const thread = await db.aiThread.findUnique({ where: { id }, select: { userId: true } });
    if (!thread || thread.userId !== user.id) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    await db.aiThread.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error({ err, userId: user.id, id }, "delete thread failed");
    return NextResponse.json({ error: "No se pudo borrar" }, { status: 500 });
  }
}
