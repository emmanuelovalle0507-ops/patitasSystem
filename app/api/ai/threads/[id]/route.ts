import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/** Detalle de un hilo con todos sus mensajes (autorización por ownership). */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const thread = await db.aiThread.findUnique({
    where: { id: params.id },
    include: {
      messages: { orderBy: { createdAt: "asc" }, select: { id: true, role: true, content: true, createdAt: true } },
    },
  });
  if (!thread || thread.userId !== user.id) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json(thread);
}
