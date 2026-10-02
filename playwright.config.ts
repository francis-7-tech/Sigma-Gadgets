import { defineConfig } from "@playwright/test";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const port = 3100;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "tests/e2e",
  workers: 1,
  fullyParallel: false,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", testMatch: "checkout.spec.ts", use: { browserName: "chromium", viewport: { width: 1280, height: 900 } } },
    {
      name: "phone",
      testMatch: "mobile.spec.ts",
      use: { browserName: "chromium", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
    },
  ],
  webServer: {
    command: `npm run build && npx next start --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 300_000,
    env: {
      EMAIL_DRY_RUN: "true",
      AUTH_TRUST_HOST: "true",
      APP_URL: baseURL,
    },
  },
});
