import { test, expect } from "@playwright/test";

/**
 * Tests autenticados. Reutilizan la sesión guardada por global-setup.ts.
 * Convención: *.auth.spec.ts viven en el proyecto "authenticated".
 */

test.describe("navegación autenticada", () => {
  test("/dashboard carga (no redirige)", async ({ page }) => {
    const res = await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("/feed carga (no redirige)", async ({ page }) => {
    const res = await page.goto("/feed", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/feed/);
  });

  test("/notifications carga", async ({ page }) => {
    const res = await page.goto("/notifications", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/notifications/);
  });

  test("/settings carga", async ({ page }) => {
    const res = await page.goto("/settings", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/settings/);
  });
});

test.describe("endpoints autenticados", () => {
  test("GET /api/ai/threads devuelve lista (posiblemente vacía)", async ({ request }) => {
    const res = await request.get("/api/ai/threads");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
  });

  test("POST /api/ai/chat con messages inválido devuelve 400", async ({ request }) => {
    const res = await request.post("/api/ai/chat", { data: { messages: "no-array" } });
    expect(res.status()).toBe(400);
  });

  test("POST /api/ai/chat con messages vacío devuelve 400", async ({ request }) => {
    const res = await request.post("/api/ai/chat", { data: { messages: [] } });
    expect(res.status()).toBe(400);
  });

  test("POST /api/ai/chat con > 50 mensajes devuelve 400", async ({ request }) => {
    const messages = Array.from({ length: 51 }, (_, i) => ({ role: "user", content: `m${i}` }));
    const res = await request.post("/api/ai/chat", { data: { messages } });
    expect(res.status()).toBe(400);
  });

  test("POST /api/ai/moderate sin imageUrl devuelve 400", async ({ request }) => {
    const res = await request.post("/api/ai/moderate", { data: {} });
    expect(res.status()).toBe(400);
  });

  test("POST /api/push/subscribe con payload inválido devuelve 400", async ({ request }) => {
    const res = await request.post("/api/push/subscribe", { data: { foo: "bar" } });
    expect(res.status()).toBe(400);
  });

  test("DELETE /api/push/subscribe sin endpoint devuelve 400", async ({ request }) => {
    const res = await request.fetch("/api/push/subscribe", { method: "DELETE", data: {} });
    expect(res.status()).toBe(400);
  });

  test("POST /api/images/delete con publicId ajeno devuelve 403", async ({ request }) => {
    // El usuario solo puede borrar imágenes de su folder `users/<id>/`
    const res = await request.post("/api/images/delete", { data: { publicId: "users/another-user/foo.jpg" } });
    expect(res.status()).toBe(403);
  });

  test("GET /api/poster/pdf con postId ajeno devuelve 403", async ({ request }) => {
    const res = await request.get("/api/poster/pdf?postId=cxxxxxxxxxxxxxxxxxxxxxxxx");
    // Con post inexistente el authz check también devuelve 403 (no autorizado)
    expect([403, 404]).toContain(res.status());
  });
});

test.describe("rate limiting real vía HTTP", () => {
  test("burst a /api/ai/moderate dispara 429", async ({ request }) => {
    // preset aiModerate = 30/min por usuario. Lanzamos 40 en paralelo con
    // payload inválido (rate limit va ANTES de validación → consume bucket).
    test.setTimeout(60_000);
    const promises = Array.from({ length: 40 }, () =>
      request.post("/api/ai/moderate", { data: {} }).then((r) => r.status())
    );
    const statuses = await Promise.all(promises);
    expect(statuses).toContain(429);
    // Y también debe haber al menos algunos 400 (antes de agotar el bucket)
    // o 401/403 no — si aparecen 500 es bug.
    expect(statuses.every((s) => s === 400 || s === 429 || s === 503)).toBe(true);
  });
});

test.describe("flujo de comentarios paginado", () => {
  test("/api/comments/[postId] devuelve shape correcto", async ({ request }) => {
    const res = await request.get("/api/comments/cxxxxxxxxxxxxxxxxxxxxxxxx?take=5");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ items: [], nextCursor: null });
  });
});
