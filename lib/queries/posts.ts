import { db } from "@/lib/db";
import type { Prisma, PostKind } from "@prisma/client";

/**
 * Payloads tipados que reflejan exactamente lo que trae cada query.
 * Exportarlos permite que páginas/componentes se tipen sin `as any`.
 */

export const feedPostSelect = {
  id: true, kind: true, status: true, title: true, description: true,
  areaLabel: true, lat: true, lng: true, createdAt: true, authorId: true,
  images: { take: 1, select: { id: true, url: true, width: true, height: true } },
  author: { select: { id: true, name: true, avatarUrl: true } },
  _count: { select: { likes: true, comments: true } },
} satisfies Prisma.PostSelect;

export type FeedPost = Prisma.PostGetPayload<{ select: typeof feedPostSelect }>;

export type FeedParams = {
  kind: PostKind;
  cursor?: string | null;
  take?: number;
};

/** Feed paginado por cursor (post.id + createdAt). */
export async function listFeedPosts({ kind, cursor, take = 20 }: FeedParams) {
  const posts = await db.post.findMany({
    where: { kind },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: feedPostSelect,
  });
  const hasMore = posts.length > take;
  const items = hasMore ? posts.slice(0, take) : posts;
  return {
    items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  };
}

export const postDetailInclude = {
  images: true,
  pet: true,
  author: {
    select: {
      id: true, name: true, avatarUrl: true, email: true,
      phone: true, whatsapp: true,
      showPhone: true, showWhatsapp: true, showEmail: true,
    },
  },
  _count: { select: { likes: true, comments: true } },
} satisfies Prisma.PostInclude;

export type PostDetail = Prisma.PostGetPayload<{ include: typeof postDetailInclude }>;

export async function getPostById(id: string) {
  return db.post.findUnique({ where: { id }, include: postDetailInclude });
}

export async function countUserPosts(userId: string) {
  return db.post.count({ where: { authorId: userId } });
}
