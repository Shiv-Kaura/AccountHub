"use server";

import { revalidatePath } from "next/cache";
import { createPortalClient } from "@/lib/supabase/portal-client";

// Customer-side upload. `token` comes straight from the URL the customer is on — it is NOT
// trusted as an accountId on its own; every step below re-derives the account from it via the
// service-role client, so a customer can only ever write into their own account's files, however
// this action is called.
export async function uploadPortalFileByCustomer(token: string, formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return;

  const supabase = createPortalClient();

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("id")
    .eq("portal_token", token)
    .single();
  if (accountError || !account) throw new Error("This portal link is no longer valid.");

  const storagePath = `${account.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error: uploadError } = await supabase.storage
    .from("portal-files")
    .upload(storagePath, file, { contentType: file.type || "application/octet-stream" });
  if (uploadError) throw new Error(uploadError.message);

  const { error } = await supabase.from("portal_files").insert({
    account_id: account.id,
    direction: "uploaded_by_customer",
    file_name: file.name,
    file_size: file.size,
    storage_path: storagePath,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/portal/${token}`);
}
