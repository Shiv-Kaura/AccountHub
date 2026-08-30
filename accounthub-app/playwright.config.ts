import { defineConfig, devices } from "@playwright/test";

/**
 * Read-only smoke test config. Points at a real, already-deployed instance
 * of the app (production by default) rather than spinning up a local dev
 * server — the point is to verify a real deploy actually works, the same
 * way clicking around after a release would, just automated.
 *
 * Required env vars (put them in `.env.smoke.local` — already covered by
 * the `.env*` line in .gitignore, so it's never committed — or export
 * them in your shell before running):
 *   SMOKE_BASE_URL  e.g. https://account-hub-nu.vercel.app
 *   SMOKE_EMAIL     a DEDICATED test login, not your real one
 *   SMOKE_PASSWORD  that test login's password
 *
 * See tests/README.md for how to create that test login and run this.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  timeout: 30_000,
  use: {
    baseURL: process.env.SMOKE_BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "smoke",
      use: { ...devices["Desktop Chrome"], storageState: "tests/.auth/smoke-user.json" },
      dependencies: ["setup"],
    },
  ],
});
