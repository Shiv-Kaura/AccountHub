"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { promoteAccountOnSigned } from "@/lib/account-lifecycle";

export async function createSow(formData: FormData) {
  const projectTitle = String(formData.get("projectTitle") || "").trim();
  if (!projectTitle) return;

  const accountId = String(formData.get("accountId") || "") || null;
  const workDetails = String(formData.get("workDetailsText") || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sows")
    .insert({
      account_id: accountId,
      customer: String(formData.get("customer") || ""),
      address: String(formData.get("address") || ""),
      project_title: projectTitle,
      work_summary: String(formData.get("workSummary") || ""),
      work_details: workDetails,
      meeting_notes: String(formData.get("meetingNotes") || ""),
      solutions_diagram: formData.get("solutionsDiagram") === "on",
      contact_name: String(formData.get("contactName") || ""),
      contact_email_phone: String(formData.get("contactEmailPhone") || ""),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/sows");
  redirect(`/sows/${data.id}`);
}

export async function updateSow(id: string, formData: FormData) {
  const projectTitle = String(formData.get("projectTitle") || "").trim();
  if (!projectTitle) return;

  const accountId = String(formData.get("accountId") || "") || null;
  const workDetails = String(formData.get("workDetailsText") || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const supabase = await createClient();
  const { error } = await supabase
    .from("sows")
    .update({
      account_id: accountId,
      customer: String(formData.get("customer") || ""),
      address: String(formData.get("address") || ""),
      project_title: projectTitle,
      work_summary: String(formData.get("workSummary") || ""),
      work_details: workDetails,
      meeting_notes: String(formData.get("meetingNotes") || ""),
      solutions_diagram: formData.get("solutionsDiagram") === "on",
      contact_name: String(formData.get("contactName") || ""),
      contact_email_phone: String(formData.get("contactEmailPhone") || ""),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/sows");
  revalidatePath(`/sows/${id}`);
  revalidatePath("/pipeline");
  redirect(`/sows/${id}`);
}

export async function updateSowStage(id: string, stage: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sows")
    .update({ stage, stage_changed_at: new Date().toISOString() })
    .eq("id", id)
    .select("account_id")
    .single();
  if (error) throw new Error(error.message);

  await promoteAccountOnSigned(data?.account_id, stage);

  revalidatePath(`/sows/${id}`);
  revalidatePath("/accounts");
  revalidatePath("/pipeline");
}

export async function markSowLost(id: string, lost: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("sows").update({ lost }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/sows/${id}`);
  revalidatePath("/pipeline");
}

export async function deleteSow(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("sows").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/sows");
  redirect("/sows");
}
