import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * A privileged Supabase client used ONLY by the customer-facing portal
 * (src/app/portal/**), which is intentionally unauthenticated — there is no
 * login for customers by design; the portal link itself (an account's
 * portal_token) is the only credential.
 *
 * This bypasses Postgres row-level security entirely via the service-role
 * key, so it can see every account and every portal_files row regardless of
 * who's asking. That means every function that uses this client MUST look
 * up the account by portal_token first and then scope every further query to
 * that exact account_id — never trust an accountId that came from the
 * customer-facing request on its own, since nothing else is checking it.
 *
 * Never import this into anything under src/app/(app) (the signed-in staff
 * app already has its own session-scoped client, src/lib/supabase/server.ts)
 * and never expose SUPABASE_SERVICE_ROLE_KEY to the browser — it is not
 * prefixed with NEXT_PUBLIC_ on purpose.
 */
export function createPortalClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Get it from the Supabase dashboard " +
        "(Project Settings → API → service_role key) and add it as an env var — " +
        "see .env.local.example."
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
