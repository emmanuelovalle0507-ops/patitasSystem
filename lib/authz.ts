/**
 * Autorización basada en roles + ownership.
 * Centralizado para poder auditar/testear las decisiones de acceso.
 */
import type { Role, User, Post, Comment } from "@prisma/client";

export type Actor = Pick<User, "id" | "role">;

export type Action =
  | "post:update"
  | "post:delete"
  | "post:hide"
  | "post:changeStatus"
  | "comment:delete"
  | "comment:hide"
  | "user:ban"
  | "moderation:review";

type Resource =
  | { type: "post"; value: Pick<Post, "authorId"> }
  | { type: "comment"; value: Pick<Comment, "authorId"> }
  | { type: "none" };

function isMod(role: Role): boolean {
  return role === "MODERATOR" || role === "ADMIN";
}

export function can(actor: Actor | null, action: Action, resource: Resource = { type: "none" }): boolean {
  if (!actor) return false;

  switch (action) {
    case "post:update":
    case "post:changeStatus":
      return resource.type === "post" && actor.id === resource.value.authorId;

    case "post:delete":
      if (resource.type !== "post") return false;
      return actor.id === resource.value.authorId || isMod(actor.role);

    case "post:hide":
      return isMod(actor.role);

    case "comment:delete":
      if (resource.type !== "comment") return false;
      return actor.id === resource.value.authorId || isMod(actor.role);

    case "comment:hide":
      return isMod(actor.role);

    case "user:ban":
      return actor.role === "ADMIN";

    case "moderation:review":
      return isMod(actor.role);
  }
}

/** Variante que lanza si no hay permiso. Útil en server actions. */
export function authorize(actor: Actor | null, action: Action, resource?: Resource): void {
  if (!can(actor, action, resource)) {
    throw new Error("No autorizado");
  }
}
