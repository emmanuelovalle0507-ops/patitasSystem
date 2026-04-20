"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PostStatus } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  LostPostSchema,
  CommunityPostSchema,
  CommentSchema,
  canTransitionStatus,
  type LostPostInput,
  type CommunityPostInput,
} from "@/lib/validators";
import { moderateText } from "@/lib/moderation";
import { sendPushToUser } from "@/lib/push";
import { absoluteUrl } from "@/lib/utils";
import { authorize } from "@/lib/authz";
import { logger } from "@/lib/logger";

/** Crea un post de mascota perdida y dispara notificaciones geo. */
export async function createLostPost(input: LostPostInput) {
  const user = await requireUser();
  const parsed = LostPostSchema.parse({
    ...input,
    lostAt: typeof input.lostAt === "string" ? input.lostAt : input.lostAt.toISOString(),
  });

  const textMod = await moderateText(parsed.description);
  if (!textMod.passed) throw new Error(textMod.reason || "Descripción rechazada");

  const pet = await db.pet.create({
    data: {
      name: parsed.petName,
      kind: parsed.kind,
      breed: parsed.breed,
      color: parsed.color,
      ageYears: parsed.ageYears,
      ownerId: user.id,
    },
  });

  const contactUpdate: Record<string, any> = {};
  if (parsed.contactPhone !== undefined) { contactUpdate.phone = parsed.contactPhone || null; }
  if (parsed.contactWhatsapp !== undefined) { contactUpdate.whatsapp = parsed.contactWhatsapp || null; }
  if (parsed.showPhone !== undefined) contactUpdate.showPhone = parsed.showPhone;
  if (parsed.showWhatsapp !== undefined) contactUpdate.showWhatsapp = parsed.showWhatsapp;
  if (parsed.showEmail !== undefined) contactUpdate.showEmail = parsed.showEmail;
  if (Object.keys(contactUpdate).length > 0) {
    await db.user.update({ where: { id: user.id }, data: contactUpdate });
  }

  const post = await db.post.create({
    data: {
      kind: "LOST",
      status: "LOST",
      authorId: user.id,
      petId: pet.id,
      title: `Se busca ${parsed.petName}`,
      description: parsed.description,
      lat: parsed.lat,
      lng: parsed.lng,
      areaLabel: parsed.areaLabel ?? null,
      lostAt: new Date(parsed.lostAt as any),
      images: {
        create: parsed.imageUrls.map((i) => ({
          url: i.url,
          publicId: i.publicId,
          width: i.width,
          height: i.height,
          moderation: { status: "passed" },
        })),
      },
    },
  });

  try {
    const users = await db.$queryRaw<Array<{ user_id: string }>>`
      SELECT * FROM users_in_radius_of_post(${post.id})
    `;
    if (users.length) {
      await db.notification.createMany({
        data: users.map((u) => ({
          userId: u.user_id,
          postId: post.id,
          type: "NEW_LOST_NEARBY" as const,
          title: "🐾 Mascota perdida cerca de ti",
          body: `${parsed.petName} se perdió en ${parsed.areaLabel ?? "tu zona"}. ¡Ayuda a encontrarlo!`,
        })),
      });
      await Promise.all(
        users.map((u) =>
          sendPushToUser(u.user_id, {
            title: "🐾 Mascota perdida cerca de ti",
            body: `${parsed.petName} se perdió en ${parsed.areaLabel ?? "tu zona"}.`,
            url: absoluteUrl(`/posts/${post.id}`),
            tag: `lost-${post.id}`,
          })
        )
      );
    }
  } catch (err) {
    logger.warn({ err, postId: post.id }, "geo notifications skipped (PostGIS?)");
  }

  revalidatePath("/dashboard");
  revalidatePath("/feed");
  redirect(`/posts/${post.id}`);
}

export async function createCommunityPost(input: CommunityPostInput) {
  const user = await requireUser();
  const parsed = CommunityPostSchema.parse(input);
  const textMod = await moderateText(parsed.description);
  if (!textMod.passed) throw new Error(textMod.reason || "Contenido rechazado");

  const post = await db.post.create({
    data: {
      kind: "COMMUNITY",
      status: "ACTIVE",
      authorId: user.id,
      title: parsed.title,
      description: parsed.description,
      images: {
        create: parsed.imageUrls.map((i) => ({
          url: i.url,
          publicId: i.publicId,
          width: i.width,
          height: i.height,
          moderation: { status: "passed" },
        })),
      },
    },
  });
  revalidatePath("/feed");
  return { ok: true as const, id: post.id };
}

export async function updatePostStatus(postId: string, status: PostStatus) {
  const user = await requireUser();
  const post = await db.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, status: true, kind: true, title: true },
  });
  if (!post) throw new Error("Post no encontrado");

  authorize(user, "post:changeStatus", { type: "post", value: post });

  if (!canTransitionStatus(post.kind, post.status, status)) {
    throw new Error(`Transición no permitida: ${post.status} → ${status}`);
  }

  await db.post.update({ where: { id: postId }, data: { status } });

  db.notification.create({
    data: {
      userId: post.authorId,
      postId,
      type: "STATUS_CHANGE",
      title: "Estado actualizado",
      body: `"${post.title}" ahora está ${status}`,
    },
  }).catch((err) => logger.warn({ err, postId }, "status notification failed"));

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function toggleLike(postId: string) {
  const user = await requireUser();
  const existing = await db.like.findUnique({ where: { postId_userId: { postId, userId: user.id } } });
  if (existing) {
    await db.like.delete({ where: { id: existing.id } });
  } else {
    await db.like.create({ data: { postId, userId: user.id } });
  }
  revalidatePath(`/posts/${postId}`);
  revalidatePath("/feed");
  return { liked: !existing };
}

export async function addComment(postId: string, body: string) {
  const user = await requireUser();
  const parsed = CommentSchema.parse({ postId, body });
  const mod = await moderateText(parsed.body);
  if (!mod.passed) throw new Error(mod.reason || "Comentario rechazado");
  const c = await db.comment.create({
    data: { postId: parsed.postId, authorId: user.id, body: parsed.body },
  });
  const post = await db.post.findUnique({ where: { id: postId }, select: { authorId: true, title: true } });
  if (post && post.authorId !== user.id) {
    await db.notification.create({
      data: {
        userId: post.authorId,
        postId,
        type: "COMMENT",
        title: "Nuevo comentario",
        body: `${user.name} comentó en "${post.title}"`,
      },
    });
  }
  revalidatePath(`/posts/${postId}`);
  return { ok: true, id: c.id };
}

/**
 * Borra un comentario. Solo el autor del comentario o un moderador pueden hacerlo.
 */
export async function deleteComment(commentId: string) {
  const user = await requireUser();
  const comment = await db.comment.findUnique({
    where: { id: commentId },
    select: { id: true, authorId: true, postId: true },
  });
  if (!comment) throw new Error("Comentario no encontrado");

  authorize(user, "comment:delete", { type: "comment", value: comment });

  await db.comment.delete({ where: { id: commentId } });
  revalidatePath(`/posts/${comment.postId}`);
  return { ok: true as const };
}

/**
 * Borrado de post: autor o moderador/admin.
 */
export async function deletePost(postId: string) {
  const user = await requireUser();
  const post = await db.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });
  if (!post) throw new Error("Post no encontrado");

  authorize(user, "post:delete", { type: "post", value: post });

  await db.post.delete({ where: { id: postId } });
  revalidatePath("/feed");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
