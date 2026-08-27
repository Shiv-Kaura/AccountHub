# AccountHub

The real-backend rebuild of the AccountHub artifact: Next.js talking to a Postgres database on
Supabase, instead of a single JSON blob living inside one HTML file.

## What's here (phase 01 of the roadmap)

- **Auth** — email/password sign-in via Supabase Auth. Every route except `/login` requires a
  signed-in session (see `src/proxy.ts`).
- **Accounts** — list, create, and a detail page with facilities/sites, contacts, activity notes,
  and document uploads, all reading and writing straight to Postgres.
- **Pipeline** — a stage board across every account's facilities.
- **Documents** — uploaded PDFs go to Supabase Storage (not base64 in a JSON blob), opened via a
  short-lived signed URL. No sandboxed-iframe workaround needed, because this isn't running inside
  an artifact anymore.

Not yet ported from the original artifact: the Quote/SOW generator UI, and stage-board editing
beyond the simple dropdown. Both are straightforward once you want them — say so and we'll pick
that up.

## Setup

1. **Create the database.** In the Supabase SQL editor, run `supabase/schema.sql`, then
   `supabase/seed.sql` (the second one migrates your existing accounts/sites/contacts/notes/quotes/
   SOWs from the old artifact — skip it for a blank start).
2. **Environment variables.** Copy `.env.local.example` to `.env.local` and fill in your project's
   URL and anon key (Supabase dashboard → Project Settings → API).
3. **Install and run:**
   ```
   npm install
   npm run dev
   ```
4. **Create your first login.** Visit `/login`, use "Sign up," and confirm the email Supabase sends
   (or disable email confirmation in Supabase → Authentication → Providers → Email, for local
   testing).

## Deploying

Push this to a GitHub repo, then import it in Vercel — it auto-detects Next.js. Add the two
`NEXT_PUBLIC_SUPABASE_*` env vars in the Vercel project settings before the first deploy.

## Notes on the data model

`supabase/schema.sql` mirrors the shape of the old artifact's JSON almost directly — accounts,
sites, contacts, account_notes, docs, quotes, sows — so the seed migration is close to a straight
copy. Row-level security currently just requires `authenticated`; phase 02 of the roadmap (roles,
account ownership, an audit trail) tightens that further.
