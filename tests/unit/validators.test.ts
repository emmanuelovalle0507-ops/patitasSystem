import { describe, it, expect } from "vitest";
import { canTransitionStatus, nextStatuses, LostPostSchema } from "@/lib/validators";

describe("canTransitionStatus (LOST)", () => {
  it("permite LOST → FOUND", () => {
    expect(canTransitionStatus("LOST", "LOST", "FOUND")).toBe(true);
  });
  it("permite LOST → IN_PROGRESS", () => {
    expect(canTransitionStatus("LOST", "LOST", "IN_PROGRESS")).toBe(true);
  });
  it("no permite LOST → ACTIVE (solo COMMUNITY)", () => {
    expect(canTransitionStatus("LOST", "LOST", "ACTIVE")).toBe(false);
  });
  it("permite reabrir FOUND → LOST", () => {
    expect(canTransitionStatus("LOST", "FOUND", "LOST")).toBe(true);
  });
  it("no permite la misma transición", () => {
    expect(canTransitionStatus("LOST", "LOST", "LOST")).toBe(false);
  });
});

describe("canTransitionStatus (COMMUNITY)", () => {
  it("no permite ningún cambio", () => {
    expect(canTransitionStatus("COMMUNITY", "ACTIVE", "LOST")).toBe(false);
    expect(canTransitionStatus("COMMUNITY", "ACTIVE", "FOUND")).toBe(false);
  });
});

describe("nextStatuses", () => {
  it("devuelve [FOUND, IN_PROGRESS] para LOST/LOST", () => {
    expect(nextStatuses("LOST", "LOST")).toEqual(["FOUND", "IN_PROGRESS"]);
  });
  it("devuelve [] para COMMUNITY", () => {
    expect(nextStatuses("COMMUNITY", "ACTIVE")).toEqual([]);
  });
});

describe("LostPostSchema", () => {
  const base = {
    petName: "Firulais",
    kind: "DOG" as const,
    description: "Se perdió ayer cerca del parque central",
    lostAt: new Date().toISOString(),
    lat: 19.7167,
    lng: -99.0,
    imageUrls: [{ url: "https://example.com/x.jpg", publicId: "users/a/x.jpg" }],
  };

  it("acepta input mínimo válido", () => {
    expect(() => LostPostSchema.parse(base)).not.toThrow();
  });
  it("rechaza sin imágenes", () => {
    expect(() => LostPostSchema.parse({ ...base, imageUrls: [] })).toThrow();
  });
  it("rechaza coords fuera del BBOX", () => {
    expect(() => LostPostSchema.parse({ ...base, lat: 0, lng: 0 })).toThrow();
  });
  it("rechaza descripción corta", () => {
    expect(() => LostPostSchema.parse({ ...base, description: "hola" })).toThrow();
  });
});
