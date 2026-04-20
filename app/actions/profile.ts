"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileUpdateSchema, type ProfileUpdateInput } from "@/lib/validators";

export async function updateProfile(input: ProfileUpdateInput) {
  const user = await requireUser();
  const parsed = ProfileUpdateSchema.parse(input);
  await db.user.update({
    where: { id: user.id },
    data: {
      name: parsed.name,
      phone: parsed.phone,
      whatsapp: parsed.whatsapp,
      avatarUrl: parsed.avatarUrl,
      showPhone: parsed.showPhone,
      showWhatsapp: parsed.showWhatsapp,
      showEmail: parsed.showEmail,
      favoritePets: parsed.favoritePets,
      notifLat: parsed.notifLat ?? null,
      notifLng: parsed.notifLng ?? null,
      notifRadiusKm: parsed.notifRadiusKm,
    },
  });
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function completeOnboarding(favoritePets: string[], notifLat?: number, notifLng?: number) {
  const user = await requireUser();
  await db.user.update({
    where: { id: user.id },
    data: {
      favoritePets: favoritePets as any,
      notifLat: notifLat ?? 19.7167,
      notifLng: notifLng ?? -99.0,
    },
  });
  revalidatePath("/dashboard");
  return { ok: true as const };
}
