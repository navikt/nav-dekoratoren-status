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
        command: "PORT=3101 pnpm start",
        url: "http://localhost:3101",
        reuseExistingServer: false,
      },
});
