import { test, expect } from "@playwright/test";

/**
 * Middleware debe redirigir TODAS las rutas protegidas a /login con `next`.
 */
const PROTECTED = ["/dashboard", "/feed", "/notifications", "/settings", "/posts/new", "/posters/abc"];

for (const path of PROTECTED) {
  test(`${path} redirige a /login con ?next=${path}`, async ({ page }) => {
    await page.goto(path);
    const url = new URL(page.url());
    expect(url.pathname).toBe("/login");
    expect(url.searchParams.get("next")).toBe(path);
  });
}

test("landing pública NO redirige", async ({ page }) => {
  await page.goto("/");
  const url = new URL(page.url());
  expect(url.pathname).toBe("/");
});
