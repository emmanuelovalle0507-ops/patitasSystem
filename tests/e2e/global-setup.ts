import { config as loadEnv } from "dotenv";
import path from "node:path";
import fs from "node:fs/promises";
import { ensureTestUser, getProjectRef } from "./fixtures/test-user";

/**
 * Playwright globalSetup:
 *   1. Carga .env.
 *   2. Asegura el usuario de test (Supabase Auth + Prisma).
 *   3. Hace sign-in y guarda la sesión en storageState para que los tests
 *      autenticados lo reutilicen sin pasar por la UI cada vez.
 *
 * Si faltan credenciales (CI sin secretos), imprime un warning y termina
 * sin error — los tests "auth-required" hacen skip en ese caso.
 */
export default async function globalSetup() {
  loadEnv({ path: path.resolve(process.cwd(), ".env") });

  const storageStatePath = path.resolve(process.cwd(), "tests/e2e/.auth/user.json");
  await fs.mkdir(path.dirname(storageStatePath), { recursive: true });

  const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!hasSupabase) {
    console.warn("[e2e] Supabase credentials ausentes — skip auth setup. Tests autenticados harán skip.");
    await fs.writeFile(storageStatePath, JSON.stringify({ cookies: [], origins: [] }));
    return;
  }

  try {
    const { session } = await ensureTestUser();
    const projectRef = getProjectRef();

    // @supabase/ssr guarda la sesión en la cookie `sb-<projectRef>-auth-token`
    // en formato base64-url (prefijo `base64-` desde supabase-js v2.47+).
    const sessionJson = JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      expires_in: session.expires_in,
      token_type: session.token_type,
      user: session.user,
    });
    const cookieValue = "base64-" + Buffer.from(sessionJson, "utf8").toString("base64");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const domain = new URL(appUrl).hostname;

    const storageState = {
      cookies: [
        {
          name: `sb-${projectRef}-auth-token`,
          value: cookieValue,
          domain,
          path: "/",
          expires: -1,
          httpOnly: false,
          secure: false,
          sameSite: "Lax" as const,
        },
      ],
      origins: [],
    };
    await fs.writeFile(storageStatePath, JSON.stringify(storageState, null, 2));
    console.log(`[e2e] Test user listo (${session.user.email})`);
  } catch (err) {
    console.error("[e2e] ensureTestUser falló:", err);
    await fs.writeFile(storageStatePath, JSON.stringify({ cookies: [], origins: [] }));
  }
}
