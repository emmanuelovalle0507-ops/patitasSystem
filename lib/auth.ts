import { redirect } from "next/navigation";
import { db } from "./db";
import { createSupabaseServer } from "./supabase/server";
import type { User } from "@prisma/client";

/**
 * Obtiene el usuario autenticado (Supabase) y su perfil en nuestra DB.
 * Si no existe en DB aún (primer login), lo crea (upsert).
 * Retorna null si no hay sesión.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = createSupabaseServer();
  const { data: { user: sbUser } } = await supabase.auth.getUser();
  if (!sbUser) return null;

  // Upsert: sincroniza usuario de Supabase con User de nuestra DB
  const email = sbUser.email ?? `${sbUser.id}@patitas.local`;
  const name =
    (sbUser.user_metadata?.full_name as string | undefined) ??
    (sbUser.user_metadata?.name as string | undefined) ??
    email.split("@")[0];
  const avatarUrl = (sbUser.user_metadata?.avatar_url as string | undefined) ?? null;

  const user = await db.user.upsert({
    where: { supabaseId: sbUser.id },
    update: {},
    create: {
      supabaseId: sbUser.id,
      email,
      name,
      avatarUrl,
      favoritePets: [],
    },
  });
  return user;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Saber si el usuario terminó el onboarding (eligió mascotas favoritas). */
export function hasCompletedOnboarding(user: User): boolean {
  return user.favoritePets.length > 0;
}
