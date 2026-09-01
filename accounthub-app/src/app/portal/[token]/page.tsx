import { notFound } from "next/navigation";
import { createPortalClient } from "@/lib/supabase/portal-client";
import type { PortalFile } from "@/lib/types";
import { uploadPortalFileByCustomer } from "./actions";

export default async function CustomerPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createPortalClient();

  const { data: account } = await supabase
    .from("accounts")
    .select("id, name")
    .eq("portal_token", token)
    .single();
  if (!account) notFound();

  const { data: files } = await supabase
    .from("portal_files")
    .select("*")
    .eq("account_id", account.id)
    .order("uploaded_at", { ascending: false });

  const fileList = (files ?? []) as PortalFile[];
  const sharedFiles = fileList.filter((f) => f.direction === "shared_with_customer");
  const myUploads = fileList.filter((f) => f.direction === "uploaded_by_customer");

  const uploadWithToken = uploadPortalFileByCustomer.bind(null, token);

  return (
    <div className="min-h-screen bg-[#121212] text-[#eceef0]">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="text-sm font-medium text-[#4fc3ff]">Synthesis Health</div>
        <h1 className="mt-1 text-2xl font-semibold text-[#f2f2f4]">{account.name}</h1>
        <p className="mt-2 text-sm text-[#8c8f96]">
          A private space just for you — files we&apos;ve shared, and a place to send things back
          to us.
        </p>

        <section className="mt-8 rounded-[14px] border border-white/[0.06] bg-[#1c1c1e] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <h2 className="font-medium text-[#f2f2f4]">Files for you</h2>
          <div className="mt-3 flex flex-col gap-2">
            {sharedFiles.map((f) => (
              <a
                key={f.id}
                href={`/portal/${token}/files/${f.id}`}
                className="flex items-center justify-between rounded-md border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm hover:bg-white/[0.05]"
              >
                <div>
                  <div className="font-medium text-[#e5e6ea]">{f.note || f.file_name}</div>
                  {f.note && <div className="text-xs text-[#5a5d64]">{f.file_name}</div>}
                </div>
                <span className="text-xs text-[#4fc3ff]">Download</span>
              </a>
            ))}
            {sharedFiles.length === 0 && (
              <p className="text-sm text-[#5a5d64]">Nothing shared yet — check back soon.</p>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-[14px] border border-white/[0.06] bg-[#1c1c1e] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <h2 className="font-medium text-[#f2f2f4]">Send us a file</h2>
          <p className="mt-1 text-xs text-[#8c8f96]">
            For example, a completed intake form.
          </p>
          <form action={uploadWithToken} className="mt-3 flex flex-col gap-2">
            <input type="file" name="file" required className="text-sm" />
            <button
              type="submit"
              className="self-start rounded-md bg-[#0496ff] px-3 py-1.5 text-sm font-medium text-white hover:brightness-110 active:brightness-90 active:scale-[0.98] transition"
            >
              Send
            </button>
          </form>

          {myUploads.length > 0 && (
            <div className="mt-4 border-t border-white/[0.06] pt-4">
              <h3 className="text-xs font-medium text-[#8c8f96]">You&apos;ve already sent us:</h3>
              <div className="mt-2 flex flex-col gap-1">
                {myUploads.map((f) => (
                  <div key={f.id} className="text-sm text-[#c7c9d0]">
                    {f.file_name}{" "}
                    <span className="text-xs text-[#5a5d64]">
                      · {new Date(f.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
