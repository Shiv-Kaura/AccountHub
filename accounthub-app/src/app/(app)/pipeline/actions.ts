"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { promoteAccountOnSigned } from "@/lib/account-lifecycle";

export async function moveDealStage(quoteId: string, sowId: string, stage: string) {
  const supabase = await createClient();

  const changedAt = new Date().toISOString();
  const [{ data: quoteRow, error: quoteError }, { error: sowError }] = await Promise.all([
    supabase
      .from("quotes")
      .update({ stage, stage_changed_at: changedAt })
      .eq("id", quoteId)
      .select("account_id")
      .single(),
    supabase.from("sows").update({ stage, stage_changed_at: changedAt }).eq("id", sowId),
  ]);

  if (quoteError) throw new Error(quoteError.message);
  if (sowError) throw new Error(sowError.message);

  await promoteAccountOnSigned(quoteRow?.account_id, stage);

  revalidatePath(`/quotes/${quoteId}`);
  revalidatePath(`/sows/${sowId}`);
  revalidatePath("/accounts");
  revalidatePath("/pipeline");
}

export async function markDealLost(quoteId: string, sowId: string, lost: boolean) {
  const supabase = await createClient();

  const [{ error: quoteError }, { error: sowError }] = await Promise.all([
    supabase.from("quotes").update({ lost }).eq("id", quoteId),
    supabase.from("sows").update({ lost }).eq("id", sowId),
  ]);

  if (quoteError) throw new Error(quoteError.message);
  if (sowError) throw new Error(sowError.message);

  revalidatePath(`/quotes/${quoteId}`);
  revalidatePath(`/sows/${sowId}`);
  revalidatePath("/pipeline");
}
