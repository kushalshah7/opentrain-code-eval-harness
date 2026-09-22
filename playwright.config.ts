import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 20_000,
  use: {
    baseURL: "http://127.0.0.1:5173",
    headless: true,
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:5173",
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
