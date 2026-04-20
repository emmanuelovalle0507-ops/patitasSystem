import webpush from "web-push";
import { db } from "./db";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || "mailto:admin@patitas.mx";

if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
};

export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!publicKey || !privateKey) {
    console.warn("[push] VAPID keys no configuradas; omitiendo envío");
    return { sent: 0, failed: 0 };
  }

  const subs = await db.pushSubscription.findMany({ where: { userId } });
  let sent = 0;
  let failed = 0;

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload)
        );
        sent++;
      } catch (err: any) {
        failed++;
        // 404/410: suscripción caducó, borrar
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await db.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
        } else {
          console.error("[push] error:", err?.message || err);
        }
      }
    })
  );
  return { sent, failed };
}
