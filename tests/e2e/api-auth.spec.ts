import { test, expect } from "@playwright/test";

/**
 * Todos los endpoints que mutan estado DEBEN rechazar peticiones sin auth
 * con 401. Este test es la red de seguridad contra regresiones donde alguien
 * olvida llamar a getCurrentUser().
 */
const protectedEndpoints: Array<{ method: "GET" | "POST" | "DELETE"; url: string; body?: any }> = [
  { method: "POST", url: "/api/ai/chat", body: { messages: [{ role: "user", content: "hola" }] } },
  { method: "POST", url: "/api/ai/moderate", body: { imageUrl: "https://example.com/x.jpg" } },
  { method: "GET", url: "/api/ai/threads" },
  { method: "DELETE", url: "/api/ai/threads", body: { id: "cxxxxxxxxxxxxxxxxxxxxxxxx" } },
  { method: "GET", url: "/api/ai/threads/cxxxxxxxxxxxxxxxxxxxxxxxx" },
  { method: "POST", url: "/api/push/subscribe", body: { endpoint: "https://x", keys: { p256dh: "a", auth: "b" } } },
  { method: "DELETE", url: "/api/push/subscribe", body: { endpoint: "https://x" } },
  { method: "POST", url: "/api/images/delete", body: { publicId: "users/x/y.jpg" } },
  { method: "GET", url: "/api/poster/pdf?postId=whatever" },
];

for (const ep of protectedEndpoints) {
  test(`${ep.method} ${ep.url} rechaza sin auth (401)`, async ({ request }) => {
    const opts: any = {};
    if (ep.body) opts.data = ep.body;
    const res = await request.fetch(ep.url, { method: ep.method, ...opts });
    expect(res.status()).toBe(401);
  });
}
