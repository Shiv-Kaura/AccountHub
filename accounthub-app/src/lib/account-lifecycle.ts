import { createClient } from "@/lib/supabase/server";

/**
 * Once a prospect's facility/quote/SOW reaches "Signed" on the pipeline, the deal is closed —
 * the account graduates from a sales prospect to a real facility group automatically. No-op for
 * any other stage, and no-op if the account is already "managed" (existing customers running a
 * new facility through the pipeline shouldn't be touched). This is deliberately one-directional:
 * moving a stage backward later does not revert the account to "prospect" — by the time it's
 * Signed it's treated as a real customer relationship, and that can always be changed by hand on
 * the account's Edit form if it was flipped by mistake.
 */
export async function promoteAccountOnSigned(accountId: string | null | undefined, stage: string) {
  if (!accountId || stage !== "Signed") return;

  const supabase = await createClient();
  const { data: account } = await supabase
    .from("accounts")
    .select("segment")
    .eq("id", accountId)
    .single();

  if (account?.segment === "prospect") {
    await supabase.from("accounts").update({ segment: "managed" }).eq("id", accountId);
  }
}
