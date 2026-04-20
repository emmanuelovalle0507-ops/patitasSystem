import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export const commentSelect = {
  id: true, body: true, createdAt: true, authorId: true,
  author: { select: { id: true, name: true, avatarUrl: true } },
} satisfies Prisma.CommentSelect;

export type CommentView = Prisma.CommentGetPayload<{ select: typeof commentSelect }>;

/**
 * Comentarios paginados. Orden ascendente (hilos leíbles) con cursor.
 * Si no se pasa cursor, devuelve la primera página.
 */
export async function listComments(postId: string, opts: { cursor?: string | null; take?: number } = {}) {
  const take = opts.take ?? 30;
  const items = await db.comment.findMany({
    where: { postId },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: take + 1,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    select: commentSelect,
  });
  const hasMore = items.length > take;
  const page = hasMore ? items.slice(0, take) : items;
  return { items: page, nextCursor: hasMore ? page[page.length - 1].id : null };
}
