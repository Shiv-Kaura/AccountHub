"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

export async function deleteSow(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("sows").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/sows");
  redirect("/sows");
}
