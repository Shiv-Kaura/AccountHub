import { NextResponse } from "next/server";
import { createPortalClient } from "@/lib/supabase/portal-client";

// Redirects to a short-lived signed download URL for one file shared with this portal's
// customer. Deliberately scoped two ways, both re-derived from the URL itself (never trusted
// input): the account must match this exact token, AND the file must belong to that account AND
// be one that was actually shared with the customer (not one they sent us, and not any other
// account's file) — so this can't be used to fetch an arbitrary file by guessing an id.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string; fileId: string }> }
) {
  const { token, fileId } = await params;
  const supabase = createPortalClient();

  const { data: account } = await supabase
    .from("accounts")
    .select("id")
    .eq("portal_token", token)
    .single();
  if (!account) return new NextResponse("Not found", { status: 404 });

  const { data: file } = await supabase
    .from("portal_files")
    .select("storage_path")
    .eq("id", fileId)
    .eq("account_id", account.id)
    .eq("direction", "shared_with_customer")
    .single();
  if (!file) return new NextResponse("Not found", { status: 404 });

  const { data: signed, error } = await supabase.storage
    .from("portal-files")
    .createSignedUrl(file.storage_path, 60);
  if (error || !signed) return new NextResponse("Could not generate a download link", { status: 500 });

  return NextResponse.redirect(signed.signedUrl);
}
