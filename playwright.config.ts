import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { open: "never" }]],
  use: {
    baseURL: process.env.TEST_APP_URL ?? "http://localhost:3101",
    ...devices["Desktop Chrome"],
  },
  webServer: process.env.TEST_APP_URL
    ? undefined
    : {
        command:
          "cp -R public .next/standalone/ && cp -R .next/static .next/standalone/.next/ && PORT=3101 node .next/standalone/server.js",
        url: "http://localhost:3101",
        reuseExistingServer: false,
      },
});
