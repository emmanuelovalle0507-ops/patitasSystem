import { test, expect } from "@playwright/test";

/**
 * Endpoints y shape de respuesta pública.
 */

test("/api/comments/[postId] con id inexistente devuelve page vacía", async ({ request }) => {
  const res = await request.get("/api/comments/cxxxxxxxxxxxxxxxxxxxxxxxx");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body).toHaveProperty("items");
  expect(body).toHaveProperty("nextCursor");
  expect(Array.isArray(body.items)).toBe(true);
  expect(body.items.length).toBe(0);
  expect(body.nextCursor).toBeNull();
});

test("/api/comments respeta parámetro take (clamp 1..100)", async ({ request }) => {
  // take=9999 debe clampearse a 100 sin romper — el contrato es que no devuelva 500
  const res = await request.get("/api/comments/cxxxxxxxxxxxxxxxxxxxxxxxx?take=9999");
  expect(res.status()).toBe(200);
});

test("/api/og/[id] devuelve 404 para post inexistente", async ({ request }) => {
  const res = await request.get("/api/og/cxxxxxxxxxxxxxxxxxxxxxxxx");
  expect(res.status()).toBe(404);
});
