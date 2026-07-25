import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  timeout: 90_000,
  expect: { timeout: 8_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3211",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], launchOptions: { args: ["--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"] } } }],
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3211",
    url: "http://127.0.0.1:3211",
    reuseExistingServer: true,
    timeout: 120_000,
    env: { NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3211" },
  },
});
