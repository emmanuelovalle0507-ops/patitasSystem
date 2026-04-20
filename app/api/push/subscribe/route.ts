import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { applyRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = applyRateLimit(req, "push", user.id);
  if (limited) return limited;

  const sub = await req.json().catch(() => null);
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return NextResponse.json({ error: "Suscripción inválida" }, { status: 400 });
  }
  try {
    await db.pushSubscription.upsert({
      where: { endpoint: sub.endpoint },
      update: { p256dh: sub.keys.p256dh, auth: sub.keys.auth, userId: user.id },
      create: { userId: user.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error({ err, userId: user.id }, "push subscribe failed");
    return NextResponse.json({ error: "No se pudo guardar la suscripción" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = applyRateLimit(req, "push", user.id);
  if (limited) return limited;

  const { endpoint } = await req.json().catch(() => ({ endpoint: null }));
  if (!endpoint) return NextResponse.json({ error: "endpoint requerido" }, { status: 400 });
  await db.pushSubscription.deleteMany({ where: { endpoint, userId: user.id } });
  return NextResponse.json({ ok: true });
}
