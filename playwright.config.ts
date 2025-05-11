import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

export const AUTH_FILE = "e2e/.auth/user.json";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },
  projects: [
    {
      name: "auth",
      testMatch: /e2e\/login\.spec\.ts/,
    },
    {
      name: "chromium",
      dependencies: ["auth"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_FILE,
      },
      testMatch: /e2e\/.*\.spec\.ts/,
      testIgnore: /login\.spec\.ts/,
    },
  ],
  webServer: {
    command: "npm run e2e:dev",
    port: 3000,
    reuseExistingServer: true,
    timeout: 30000,
  },
});
