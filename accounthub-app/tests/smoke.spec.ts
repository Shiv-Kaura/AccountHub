import { test, expect, type Page } from "@playwright/test";

/**
 * Read-only smoke test: does every core page load without crashing after
 * a real deploy? No form is ever submitted here and nothing is created,
 * edited, or deleted — this only navigates and reads. Safe to run against
 * production at any time, including right after a release.
 *
 * Run with: npm run test:smoke
 * (requires SMOKE_BASE_URL / SMOKE_EMAIL / SMOKE_PASSWORD — see tests/README.md)
 */

async function expectPageIsHealthy(page: Page) {
  // The app's error boundaries (src/app/(app)/error.tsx, src/app/error.tsx)
  // render this exact heading on a crash instead of Next's default screen.
  await expect(page.getByText("Something went wrong")).toHaveCount(0);
  // A blank page (e.g. a silently-failed data fetch returning nothing) is
  // also worth catching — every real page has a <h1>.
  await expect(page.locator("h1").first()).toBeVisible({ timeout: 10_000 });
}

test("dashboard loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expectPageIsHealthy(page);
});

test("accounts list loads", async ({ page }) => {
  await page.goto("/accounts");
  await expect(page.getByRole("heading", { name: /Facility Groups/i })).toBeVisible();
  await expectPageIsHealthy(page);
});

test("an account detail page loads", async ({ page }) => {
  await page.goto("/accounts");
  const firstAccount = page.locator('a[href^="/accounts/"]').first();
  const count = await firstAccount.count();
  test.skip(count === 0, "No accounts exist yet to check a detail page against.");

  await firstAccount.click();
  await expect(page).toHaveURL(/\/accounts\/.+/);
  await expectPageIsHealthy(page);
});

test("pipeline board loads", async ({ page }) => {
  await page.goto("/pipeline");
  await expect(page.getByRole("heading", { name: "Pipeline" })).toBeVisible();
  await expectPageIsHealthy(page);
});

test("quotes list loads", async ({ page }) => {
  await page.goto("/quotes");
  await expect(page.getByRole("heading", { name: "Quote Generator" })).toBeVisible();
  await expectPageIsHealthy(page);
});

test("new quote form renders", async ({ page }) => {
  await page.goto("/quotes/new");
  await expectPageIsHealthy(page);
});

test("sows list loads", async ({ page }) => {
  await page.goto("/sows");
  await expect(page.getByRole("heading", { name: "SOW Generator" })).toBeVisible();
  await expectPageIsHealthy(page);
});

test("new sow form renders", async ({ page }) => {
  await page.goto("/sows/new");
  await expectPageIsHealthy(page);
});

test("search page loads", async ({ page }) => {
  await page.goto("/search?q=a");
  await expectPageIsHealthy(page);
});

test("a quote export page renders (printable, saved as PDF from the browser)", async ({ page, request }) => {
  await page.goto("/quotes");
  // Exclude the "+ New quote" link — it also starts with "/quotes/" but isn't a real quote.
  const firstQuote = page.locator('a[href^="/quotes/"]:not([href="/quotes/new"])').first();
  const count = await firstQuote.count();
  test.skip(count === 0, "No quotes exist yet to check the export page against.");

  const href = await firstQuote.getAttribute("href");
  const response = await request.get(`${href}/export`, {
    headers: { cookie: (await page.context().cookies()).map((c) => `${c.name}=${c.value}`).join("; ") },
  });
  // The export route renders a print-friendly HTML page — the user turns it into a
  // PDF themselves via the browser's own print/"Save as PDF" dialog, there's no
  // server-generated PDF file to check for here.
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/html");
});

test("a sow export page renders (printable, saved as PDF from the browser)", async ({ page, request }) => {
  await page.goto("/sows");
  // Exclude the "+ New SOW" link — it also starts with "/sows/" but isn't a real SOW.
  const firstSow = page.locator('a[href^="/sows/"]:not([href="/sows/new"])').first();
  const count = await firstSow.count();
  test.skip(count === 0, "No SOWs exist yet to check the export page against.");

  const href = await firstSow.getAttribute("href");
  const response = await request.get(`${href}/export`, {
    headers: { cookie: (await page.context().cookies()).map((c) => `${c.name}=${c.value}`).join("; ") },
  });
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/html");
});
