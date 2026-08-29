"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createAccount(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const segment = String(formData.get("segment") || "managed");
  if (!name) return;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounts")
    .insert({ name, segment })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/accounts");
  redirect(`/accounts/${data.id}`);
}

export async function addSite(accountId: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const location = String(formData.get("location") || "");
  if (!name) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("sites")
    .insert({ account_id: accountId, name, location });
  if (error) throw new Error(error.message);

  revalidatePath(`/accounts/${accountId}`);
  revalidatePath("/pipeline");
}

export async function updateSite(accountId: string, siteId: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const location = String(formData.get("location") || "");
  if (!name) return;

  const supabase = await createClient();
  const { error } = await supabase.from("sites").update({ name, location }).eq("id", siteId);
  if (error) throw new Error(error.message);

  revalidatePath(`/accounts/${accountId}`);
  revalidatePath("/pipeline");
}

export async function deleteSite(accountId: string, siteId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("sites").delete().eq("id", siteId);
  if (error) throw new Error(error.message);

  revalidatePath(`/accounts/${accountId}`);
  revalidatePath("/pipeline");
}

export async function moveSiteStage(accountId: string, siteId: string, stage: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("sites").update({ stage }).eq("id", siteId);
  if (error) throw new Error(error.message);

  revalidatePath(`/accounts/${accountId}`);
  revalidatePath("/pipeline");
}

export async function addContact(accountId: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "");
  const phone = String(formData.get("phone") || "");
  const role = String(formData.get("role") || "");
  if (!name) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("contacts")
    .insert({ account_id: accountId, name, email, phone, role });
  if (error) throw new Error(error.message);

  revalidatePath(`/accounts/${accountId}`);
}

export async function updateContact(accountId: string, contactId: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "");
  const phone = String(formData.get("phone") || "");
  const role = String(formData.get("role") || "");
  if (!name) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("contacts")
    .update({ name, email, phone, role })
    .eq("id", contactId);
  if (error) throw new Error(error.message);

  revalidatePath(`/accounts/${accountId}`);
}

export async function deleteContact(accountId: string, contactId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("contacts").delete().eq("id", contactId);
  if (error) throw new Error(error.message);

  revalidatePath(`/accounts/${accountId}`);
}

export async function addNote(accountId: string, formData: FormData) {
  const body = String(formData.get("body") || "").trim();
  if (!body) return;

  const supabase = await createClient();
  const { error } = await supabase.from("account_notes").insert({ account_id: accountId, body });
  if (error) throw new Error(error.message);

  revalidatePath(`/accounts/${accountId}`);
}

export async function updateNote(accountId: string, noteId: string, formData: FormData) {
  const body = String(formData.get("body") || "").trim();
  if (!body) return;

  const supabase = await createClient();
  const { error } = await supabase.from("account_notes").update({ body }).eq("id", noteId);
  if (error) throw new Error(error.message);

  revalidatePath(`/accounts/${accountId}`);
}

export async function deleteNote(accountId: string, noteId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("account_notes").delete().eq("id", noteId);
  if (error) throw new Error(error.message);

  revalidatePath(`/accounts/${accountId}`);
}

export async function updateAccount(accountId: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const health = String(formData.get("health") || "green");
  const segment = String(formData.get("segment") || "managed");
  if (!name) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("accounts")
    .update({ name, health, segment })
    .eq("id", accountId);
  if (error) throw new Error(error.message);

  revalidatePath(`/accounts/${accountId}`);
  revalidatePath("/accounts");
}

export async function addItem(accountId: string, formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  const owner = String(formData.get("owner") || "");
  const dueDate = String(formData.get("dueDate") || "") || null;
  const zendesk = String(formData.get("zendesk") || "");
  const priority = formData.get("priority") === "on";

  const supabase = await createClient();
  const { error } = await supabase
    .from("items")
    .insert({ account_id: accountId, title, owner, due_date: dueDate, zendesk, priority });
  if (error) throw new Error(error.message);

  revalidatePath(`/accounts/${accountId}`);
}

export async function updateItem(accountId: string, itemId: string, formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  const status = String(formData.get("status") || "open");
  const owner = String(formData.get("owner") || "");
  const dueDate = String(formData.get("dueDate") || "") || null;
  const zendesk = String(formData.get("zendesk") || "");
  const priority = formData.get("priority") === "on";

  const supabase = await createClient();
  const { error } = await supabase
    .from("items")
    .update({ title, status, owner, due_date: dueDate, zendesk, priority })
    .eq("id", itemId);
  if (error) throw new Error(error.message);

  revalidatePath(`/accounts/${accountId}`);
}

export async function setItemStatus(accountId: string, itemId: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("items").update({ status }).eq("id", itemId);
  if (error) throw new Error(error.message);

  revalidatePath(`/accounts/${accountId}`);
}

export async function deleteItem(accountId: string, itemId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("items").delete().eq("id", itemId);
  if (error) throw new Error(error.message);

  revalidatePath(`/accounts/${accountId}`);
}

export async function uploadDoc(accountId: string, formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const kind = String(formData.get("kind") || "quote");
  const facilitySiteId = String(formData.get("facilitySiteId") || "") || null;
  const file = formData.get("file") as File | null;
  if (!title || !file || file.size === 0) return;

  const supabase = await createClient();

  const storagePath = `${accountId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error: uploadError } = await supabase.storage.from("docs").upload(storagePath, file, {
    contentType: file.type || "application/pdf",
  });
  if (uploadError) throw new Error(uploadError.message);

  const { error } = await supabase.from("docs").insert({
    account_id: accountId,
    kind,
    title,
    facility_site_id: facilitySiteId,
    file_name: file.name,
    file_size: file.size,
    storage_path: storagePath,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/accounts/${accountId}`);
}

export async function getDocUrl(storagePath: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("docs")
    .createSignedUrl(storagePath, 60 * 10);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}
