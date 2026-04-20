import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

const PORT = Number(process.env.PORT || 3000);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${PORT}`;
const STORAGE_STATE = path.resolve(__dirname, "tests/e2e/.auth/user.json");

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "line" : "list",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  globalSetup: require.resolve("./tests/e2e/global-setup"),
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "public",
      testIgnore: /\.auth\.spec\.ts$/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "authenticated",
      testMatch: /\.auth\.spec\.ts$/,
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
    },
  ],
  webServer: process.env.PLAYWRIGHT_NO_SERVER
    ? undefined
    : {
        command: "npm run dev",
        url: BASE_URL,
        timeout: 120_000,
        reuseExistingServer: !process.env.CI,
        stdout: "ignore",
        stderr: "pipe",
      },
});
