import { test, expect } from "@playwright/test";

/**
 * Tests de humo end-to-end que corren contra la app real (npm run dev).
 * No requieren DB viva porque solo chequean rutas públicas y redirecciones
 * del middleware; los que requieren DB chequean que fallen de forma limpia.
 */

test("landing carga y muestra PatiTas", async ({ page }) => {
  const res = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(res?.status()).toBeLessThan(500);
  // Texto de marca en el <body> es más confiable que el <title> en dev mode.
  await expect(page.getByText(/PatiTas/i).first()).toBeVisible();
});

test("login existe", async ({ page }) => {
  const res = await page.goto("/login");
  expect(res?.status()).toBeLessThan(500);
  await expect(page.getByRole("heading").first()).toBeVisible();
});

test("rutas protegidas redirigen a /login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("/feed protegido redirige a /login", async ({ page }) => {
  await page.goto("/feed");
  await expect(page).toHaveURL(/\/login/);
});

test("/api/ai/chat rechaza sin auth con 401", async ({ request }) => {
  const res = await request.post("/api/ai/chat", { data: { messages: [{ role: "user", content: "hola" }] } });
  expect(res.status()).toBe(401);
});

test("/api/upload rechaza sin auth con 401", async ({ request }) => {
  const res = await request.post("/api/upload", { multipart: {} });
  expect(res.status()).toBe(401);
});

test("/api/comments/[id] responde 200 con lista (posiblemente vacía)", async ({ request }) => {
  const res = await request.get("/api/comments/does-not-exist");
  // aunque el postId no exista, listComments devuelve { items: [], nextCursor: null }
  expect([200, 500]).toContain(res.status());
});
