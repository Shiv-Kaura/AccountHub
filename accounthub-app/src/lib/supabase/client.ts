import { createBrowserClient } from "@supabase/ssr";

// Used from Client Components ("use client"). Reads the public (safe to expose) URL + anon key.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
