"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function moveDealStage(quoteId: string, sowId: string, stage: string) {
  const supabase = await createClient();

  const [{ error: quoteError }, { error: sowError }] = await Promise.all([
    supabase.from("quotes").update({ stage }).eq("id", quoteId),
    supabase.from("sows").update({ stage }).eq("id", sowId),
  ]);

  if (quoteError) throw new Error(quoteError.message);
  if (sowError) throw new Error(sowError.message);

  revalidatePath(`/quotes/${quoteId}`);
  revalidatePath(`/sows/${sowId}`);
  revalidatePath("/pipeline");
}
