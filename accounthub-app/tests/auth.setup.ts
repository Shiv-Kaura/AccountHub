import { test as setup, expect } from "@playwright/test";

/**
 * Logs in once with the dedicated smoke-test account and saves the
 * resulting session so every smoke test reuses it instead of hitting
 * Supabase Auth's rate limits with a fresh login per page checked.
 */
const authFile = "tests/.auth/smoke-user.json";

setup("authenticate", async ({ page }) => {
  const email = process.env.SMOKE_EMAIL;
  const password = process.env.SMOKE_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "SMOKE_EMAIL / SMOKE_PASSWORD are not set. Create a dedicated test login in Supabase " +
        "(don't reuse your real one) and set both env vars before running the smoke tests — " +
        "see tests/README.md."
    );
  }

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();

  // A successful sign-in redirects off /login into the app.
  await expect(page).not.toHaveURL(/\/login$/, { timeout: 20_000 });

  await page.context().storageState({ path: authFile });
});
