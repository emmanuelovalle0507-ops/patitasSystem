import { z } from "zod";
import { COVERAGE_BBOX } from "./geo";
import type { PostKind, PostStatus } from "@prisma/client";

export const PET_KINDS = ["DOG", "CAT", "BIRD", "REPTILE", "RODENT", "OTHER"] as const;
export const PetKindSchema = z.enum(PET_KINDS);

/**
 * Transiciones permitidas por PostKind. Evita que un LOST pase a ACTIVE
 * (solo para COMMUNITY) o que un COMMUNITY acabe marcado FOUND.
 */
const ALLOWED_TRANSITIONS: Record<PostKind, Record<PostStatus, PostStatus[]>> = {
  LOST: {
    LOST: ["FOUND", "IN_PROGRESS"],
    IN_PROGRESS: ["FOUND", "LOST"],
    FOUND: ["LOST"], // permitir reactivar si se volvió a perder
    ACTIVE: [],
  },
  COMMUNITY: {
    ACTIVE: [],
    LOST: [],
    IN_PROGRESS: [],
    FOUND: [],
  },
};

export function canTransitionStatus(kind: PostKind, from: PostStatus, to: PostStatus): boolean {
  if (from === to) return false;
  return ALLOWED_TRANSITIONS[kind]?.[from]?.includes(to) ?? false;
}

/** Estados alcanzables desde `from` para un `kind` dado. UI-friendly. */
export function nextStatuses(kind: PostKind, from: PostStatus): PostStatus[] {
  return ALLOWED_TRANSITIONS[kind]?.[from] ?? [];
}

export const ProfileUpdateSchema = z.object({
  name: z.string().min(2).max(60),
  phone: z.string().max(20).optional().nullable(),
  whatsapp: z.string().max(20).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  showPhone: z.boolean(),
  showWhatsapp: z.boolean(),
  showEmail: z.boolean(),
  favoritePets: z.array(PetKindSchema).min(1, "Elige al menos una mascota favorita"),
  notifLat: z.number().min(COVERAGE_BBOX.minLat).max(COVERAGE_BBOX.maxLat).optional().nullable(),
  notifLng: z.number().min(COVERAGE_BBOX.minLng).max(COVERAGE_BBOX.maxLng).optional().nullable(),
  notifRadiusKm: z.number().int().min(1).max(20),
});
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;

export const LostPostSchema = z.object({
  petName: z.string().min(1, "Nombre requerido").max(60),
  kind: PetKindSchema,
  breed: z.string().max(60).optional().nullable(),
  color: z.string().max(60).optional().nullable(),
  ageYears: z.number().min(0).max(40).optional().nullable(),
  description: z.string().min(10, "Describe con al menos 10 caracteres").max(2000),
  lostAt: z.string().datetime().or(z.date()),
  lat: z.number().min(COVERAGE_BBOX.minLat, "Fuera del área de cobertura").max(COVERAGE_BBOX.maxLat, "Fuera del área de cobertura"),
  lng: z.number().min(COVERAGE_BBOX.minLng, "Fuera del área de cobertura").max(COVERAGE_BBOX.maxLng, "Fuera del área de cobertura"),
  areaLabel: z.string().max(120).optional().nullable(),
  imageUrls: z.array(z.object({
    url: z.string().url(),
    publicId: z.string(),
    width: z.number().int().optional(),
    height: z.number().int().optional(),
  })).min(1, "Sube al menos una foto").max(5),
  // Contact info (optional, saved to user profile if provided)
  contactPhone: z.string().max(20).optional().nullable(),
  contactWhatsapp: z.string().max(20).optional().nullable(),
  showPhone: z.boolean().optional(),
  showWhatsapp: z.boolean().optional(),
  showEmail: z.boolean().optional(),
});
export type LostPostInput = z.infer<typeof LostPostSchema>;

export const CommunityPostSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
  imageUrls: z.array(z.object({
    url: z.string().url(),
    publicId: z.string(),
    width: z.number().int().optional(),
    height: z.number().int().optional(),
  })).min(1).max(5),
});
export type CommunityPostInput = z.infer<typeof CommunityPostSchema>;

export const CommentSchema = z.object({
  postId: z.string().cuid(),
  body: z.string().min(1).max(500),
});

export const SightingSchema = z.object({
  postId: z.string().cuid(),
  lat: z.number().min(COVERAGE_BBOX.minLat).max(COVERAGE_BBOX.maxLat),
  lng: z.number().min(COVERAGE_BBOX.minLng).max(COVERAGE_BBOX.maxLng),
  note: z.string().max(500).optional().nullable(),
  photoUrl: z.string().url().optional().nullable(),
});
