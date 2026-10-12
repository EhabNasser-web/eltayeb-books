import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  use: {
    baseURL: "http://127.0.0.1:3000",
  },
  webServer: {
    command: "npm run start",
    port: 3000,
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      ALLOW_STYLEGUIDE: "1",
    },
  },
  projects: [
    {
      name: "mobile",
      use: { browserName: "chromium", viewport: { width: 375, height: 812 } },
    },
    { name: "tablet", use: { browserName: "chromium", viewport: { width: 768, height: 1024 } } },
    { name: "desktop", use: { browserName: "chromium", viewport: { width: 1280, height: 900 } } },
  ],
});
