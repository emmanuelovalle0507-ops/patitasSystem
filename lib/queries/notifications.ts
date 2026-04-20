import { db } from "@/lib/db";

export async function listNotifications(userId: string, opts: { cursor?: string | null; take?: number } = {}) {
  const take = opts.take ?? 20;
  const items = await db.notification.findMany({
    where: { userId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: take + 1,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
  });
  const hasMore = items.length > take;
  const page = hasMore ? items.slice(0, take) : items;
  return { items: page, nextCursor: hasMore ? page[page.length - 1].id : null };
}

export async function countUnread(userId: string) {
  return db.notification.count({ where: { userId, readAt: null } });
}

/**
 * Marca como leídas únicamente las notificaciones enviadas en esta página.
 * Evita `updateMany` masivo cuando el usuario abre la pantalla con 10k
 * notificaciones no leídas acumuladas.
 */
export async function markRead(userId: string, ids: string[]) {
  if (!ids.length) return;
  await db.notification.updateMany({
    where: { userId, id: { in: ids }, readAt: null },
    data: { readAt: new Date() },
  });
}
