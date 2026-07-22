import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:4173/caseflow/",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Builds fresh (generates mock data + typechecks + bundles) and serves the
  // real production output, same as what actually gets deployed to Pages.
  webServer: {
    command: "npm run build && npm run preview",
    url: "http://localhost:4173/caseflow/",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
