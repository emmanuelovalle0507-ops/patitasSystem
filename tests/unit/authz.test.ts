import { describe, it, expect } from "vitest";
import { can, authorize } from "@/lib/authz";

const author = { id: "u1", role: "USER" as const };
const other = { id: "u2", role: "USER" as const };
const mod = { id: "m1", role: "MODERATOR" as const };
const admin = { id: "a1", role: "ADMIN" as const };

describe("can()", () => {
  it("autor puede cambiar estado de su post", () => {
    expect(can(author, "post:changeStatus", { type: "post", value: { authorId: "u1" } })).toBe(true);
  });
  it("otro usuario NO puede cambiar estado ajeno", () => {
    expect(can(other, "post:changeStatus", { type: "post", value: { authorId: "u1" } })).toBe(false);
  });
  it("moderador puede borrar post ajeno", () => {
    expect(can(mod, "post:delete", { type: "post", value: { authorId: "u1" } })).toBe(true);
  });
  it("usuario normal no puede ocultar posts", () => {
    expect(can(other, "post:hide")).toBe(false);
  });
  it("moderador puede ocultar posts", () => {
    expect(can(mod, "post:hide")).toBe(true);
  });
  it("solo ADMIN puede banear usuarios", () => {
    expect(can(mod, "user:ban")).toBe(false);
    expect(can(admin, "user:ban")).toBe(true);
  });
  it("sin actor, todo falso", () => {
    expect(can(null, "post:delete", { type: "post", value: { authorId: "x" } })).toBe(false);
  });
});

describe("authorize()", () => {
  it("no lanza si hay permiso", () => {
    expect(() => authorize(author, "post:changeStatus", { type: "post", value: { authorId: "u1" } })).not.toThrow();
  });
  it("lanza si no hay permiso", () => {
    expect(() => authorize(other, "post:delete", { type: "post", value: { authorId: "u1" } })).toThrow(/autorizado/i);
  });
});
