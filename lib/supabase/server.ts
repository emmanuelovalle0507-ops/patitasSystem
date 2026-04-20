import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client para Server Components, Server Actions y Route Handlers.
 * Usa las cookies de la request para mantener la sesión SSR.
 */
export function createSupabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }); } catch { /* readonly in RSC */ }
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: "", ...options }); } catch { /* readonly */ }
        },
      },
    }
  );
}

/** Cliente con service role (solo servidor, para operaciones admin). */
export function createSupabaseAdmin() {
  const { createClient } = require("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
