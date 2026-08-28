"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PoRow } from "@/lib/rate-card";

export async function createQuote(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const customer = String(formData.get("customer") || "").trim();
  if (!name) return;

  const accountId = String(formData.get("accountId") || "") || null;
  const implementationItems = String(formData.get("implementationItems") || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const rateSelJson = String(formData.get("rateSelJson") || "{}");
  const poRowsJson = String(formData.get("poRowsJson") || "[]");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .insert({
      account_id: accountId,
      name,
      customer,
      exhibit_label: String(formData.get("exhibitLabel") || ""),
      synthesis_contact: String(formData.get("synthesisContact") || ""),
      synthesis_email_phone: String(formData.get("synthesisEmailPhone") || ""),
      customer_contact: String(formData.get("customerContact") || ""),
      customer_email_phone: String(formData.get("customerEmailPhone") || ""),
      implementation_items: implementationItems,
      rate_sel: JSON.parse(rateSelJson),
      po_rows: JSON.parse(poRowsJson) as PoRow[],
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/quotes");
  redirect(`/quotes/${data.id}`);
}

export async function deleteQuote(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("quotes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/quotes");
  redirect("/quotes");
}
