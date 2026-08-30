# Smoke tests

A lightweight, read-only check that the core pages of a real deploy actually
load without crashing — the same thing you'd do by clicking around after a
release, just automated. Nothing here creates, edits, or deletes any data,
so it's safe to run against production at any time, including right after
a deploy.

What it checks: Dashboard, Accounts list, an account detail page, Pipeline,
Quotes list + new-quote form, SOWs list + new-SOW form, Search, and that a
quote/SOW's PDF export actually returns a PDF.

## One-time setup

**1. Create a dedicated test login.** Don't use your real account — this
test signs in with whatever credentials you give it. In the app itself, go
to `/login`, switch to "Sign up", and create something like
`smoke-test@yourdomain.com` with a throwaway password. Confirm it via the
verification email, same as any other account.

**2. Set the three env vars this needs.** Create a file named
`.env.smoke.local` in the `accounthub-app` folder (it's already covered by
the `.env*` line in `.gitignore`, so it will never get committed):

```
SMOKE_BASE_URL=https://account-hub-nu.vercel.app
SMOKE_EMAIL=smoke-test@yourdomain.com
SMOKE_PASSWORD=<the password you set above>
```

Playwright doesn't auto-load `.env` files, so either `source` that file's
values into your shell before running, or just export the three vars
directly:

```
export SMOKE_BASE_URL=https://account-hub-nu.vercel.app
export SMOKE_EMAIL=smoke-test@yourdomain.com
export SMOKE_PASSWORD=your-password-here
```

**3. Install the browser Playwright drives** (one-time, only needed the
first time on a given machine):

```
npx playwright install chromium
```

## Running it

```
npm run test:smoke
```

Takes well under a minute. A pass looks like every test green; a fail
names exactly which page broke, and — since screenshots and traces are
kept on failure — you can open the trace with
`npx playwright show-trace test-results/<failed-test-folder>/trace.zip`
to see exactly what the page looked like when it failed.

Two tests (the account-detail check and both PDF-export checks) skip
themselves gracefully if there's no account/quote/SOW to test against yet
— that's expected on a brand-new/empty database, not a failure.

## Asking Claude to run it

In a session with access to this repo and network access to your deployed
site, you can just ask "check the latest deploy" or "run the smoke tests"
and it'll run this and report back pass/fail — no need to remember the
command yourself.
