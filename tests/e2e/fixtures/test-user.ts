import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

/**
 * Credenciales del usuario de test. Pueden sobreescribirse con env vars si
 * el entorno de CI requiere algo distinto.
 */
export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || "e2e-test@patitas.test",
  password: process.env.TEST_USER_PASSWORD || "e2e-test-password-seguro-123!",
  name: "E2E Test User",
} as const;

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Env var requerida: ${name}. Cárgala desde .env antes de correr tests.`);
  return v;
}

/**
 * Asegura que el usuario de test exista en Supabase Auth y en la DB Prisma
 * con onboarding completo (favoritePets set). Idempotente.
 *
 * Devuelve los tokens de sesión listos para inyectarse en Playwright como
 * storageState.
 */
export async function ensureTestUser() {
  const url = required("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRole = required("SUPABASE_SERVICE_ROLE_KEY");
  const anon = required("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  const admin = createClient(url, serviceRole, { auth: { persistSession: false } });

  // 1. Buscar o crear en Supabase Auth
  let authUserId: string | null = null;
  const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const match = existing?.users?.find((u) => u.email === TEST_USER.email);
  if (match) {
    authUserId = match.id;
    // Forzamos la password por si cambió en otro entorno
    await admin.auth.admin.updateUserById(match.id, {
      password: TEST_USER.password,
      email_confirm: true,
    });
  } else {
    const { data: created, error } = await admin.auth.admin.createUser({
      email: TEST_USER.email,
      password: TEST_USER.password,
      email_confirm: true,
      user_metadata: { full_name: TEST_USER.name },
    });
    if (error || !created.user) throw new Error(`No se pudo crear test user: ${error?.message}`);
    authUserId = created.user.id;
  }

  // 2. Upsert en Prisma con onboarding completo (evita redirect a /onboarding)
  const db = new PrismaClient();
  try {
    await db.user.upsert({
      where: { supabaseId: authUserId! },
      update: {
        name: TEST_USER.name,
        favoritePets: ["DOG", "CAT"],
        notifLat: 19.7167,
        notifLng: -99.0,
      },
      create: {
        supabaseId: authUserId!,
        email: TEST_USER.email,
        name: TEST_USER.name,
        favoritePets: ["DOG", "CAT"],
        notifLat: 19.7167,
        notifLng: -99.0,
      },
    });
  } finally {
    await db.$disconnect();
  }

  // 3. Sign in con password grant para obtener access/refresh tokens
  const client = createClient(url, anon, { auth: { persistSession: false } });
  const { data: signIn, error: signInErr } = await client.auth.signInWithPassword({
    email: TEST_USER.email,
    password: TEST_USER.password,
  });
  if (signInErr || !signIn.session) {
    throw new Error(`Login de test user falló: ${signInErr?.message}`);
  }

  return {
    authUserId: authUserId!,
    session: signIn.session,
  };
}

/** Extrae el project ref del URL de Supabase (ej: https://abc123.supabase.co → abc123). */
export function getProjectRef(): string {
  const url = required("NEXT_PUBLIC_SUPABASE_URL");
  const m = url.match(/https?:\/\/([^.]+)\./);
  if (!m) throw new Error(`No pude extraer project ref de ${url}`);
  return m[1];
}

/**
 * Limpia datos creados por el test user (posts, pets, comments, etc.)
 * dejando el user intacto. Útil en afterAll si los tests acumulan basura.
 */
export async function cleanupTestUserData(authUserId: string) {
  const db = new PrismaClient();
  try {
    const u = await db.user.findUnique({ where: { supabaseId: authUserId }, select: { id: true } });
    if (!u) return;
    await db.post.deleteMany({ where: { authorId: u.id } });
    await db.pet.deleteMany({ where: { ownerId: u.id } });
    await db.aiThread.deleteMany({ where: { userId: u.id } });
    await db.notification.deleteMany({ where: { userId: u.id } });
  } finally {
    await db.$disconnect();
  }
}
