"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { promoteAccountOnSigned } from "@/lib/account-lifecycle";
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

export async function updateQuote(id: string, formData: FormData) {
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
  const { error } = await supabase
    .from("quotes")
    .update({
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
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/quotes");
  revalidatePath(`/quotes/${id}`);
  revalidatePath("/pipeline");
  redirect(`/quotes/${id}`);
}

export async function updateQuoteStage(id: string, stage: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .update({ stage, stage_changed_at: new Date().toISOString() })
    .eq("id", id)
    .select("account_id")
    .single();
  if (error) throw new Error(error.message);

  await promoteAccountOnSigned(data?.account_id, stage);

  revalidatePath(`/quotes/${id}`);
  revalidatePath("/accounts");
  revalidatePath("/pipeline");
}

export async function markQuoteLost(id: string, lost: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("quotes").update({ lost }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/quotes/${id}`);
  revalidatePath("/pipeline");
}

export async function deleteQuote(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("quotes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/quotes");
  redirect("/quotes");
}
