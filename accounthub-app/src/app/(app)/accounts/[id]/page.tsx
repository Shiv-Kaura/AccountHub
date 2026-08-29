import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { STAGES } from "@/lib/types";
import type { Account, Site, Contact, AccountNote, Doc, Item } from "@/lib/types";
import { uploadDoc } from "../actions";
import { DocLink } from "./doc-link";
import { AccountHeader } from "./account-edit";
import { SiteRow } from "./site-row";
import { ContactRow } from "./contact-row";
import { NoteRow } from "./note-row";
import { ItemRow } from "./item-row";
import { AddSiteForm } from "./add-site-form";
import { AddContactForm } from "./add-contact-form";
import { AddNoteForm } from "./add-note-form";
import { AddItemForm } from "./add-item-form";
import { GlassBanner } from "../../glass-banner";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: account }, { data: sites }, { data: contacts }, { data: notes }, { data: docs }, { data: items }] =
    await Promise.all([
      supabase.from("accounts").select("*").eq("id", id).single(),
      supabase.from("sites").select("*").eq("account_id", id).order("name"),
      supabase.from("contacts").select("*").eq("account_id", id).order("name"),
      supabase.from("account_notes").select("*").eq("account_id", id).order("note_date", { ascending: false }),
      supabase.from("docs").select("*").eq("account_id", id).order("uploaded_at", { ascending: false }),
      supabase
        .from("items")
        .select("*")
        .eq("account_id", id)
        .order("priority", { ascending: false })
        .order("due_date", { ascending: true, nullsFirst: false }),
    ]);

  if (!account) notFound();

  const a = account as Account;
  const siteList = (sites ?? []) as Site[];
  const contactList = (contacts ?? []) as Contact[];
  const noteList = (notes ?? []) as AccountNote[];
  const docList = (docs ?? []) as Doc[];
  const itemList = (items ?? []) as Item[];

  const uploadDocWithId = uploadDoc.bind(null, id);

  return (
    <div className="relative min-h-screen">
      <GlassBanner crumb="Facility Groups" title={a.name} showSearch={false} />

      <div className="p-8">
        <Link href="/accounts" className="text-sm text-[#5a5d64] hover:text-[#c7c9d0]">
          &larr; All accounts / groups
        </Link>

        <AccountHeader account={a} />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Priority items */}
        <section className="rounded-[14px] border border-white/[0.06] bg-[#1c1c1e] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] lg:col-span-2">
          <h2 className="font-medium text-[#f2f2f4]">Priority items</h2>
          <div className="mt-3 flex flex-col gap-2">
            {itemList.map((it) => (
              <ItemRow key={it.id} accountId={id} item={it} />
            ))}
            {itemList.length === 0 && (
              <p className="text-sm text-[#5a5d64]">Nothing tracked yet — this account is quiet.</p>
            )}
          </div>
          <AddItemForm accountId={id} />
        </section>

        {/* Sites */}
        <section className="rounded-[14px] border border-white/[0.06] bg-[#1c1c1e] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <h2 className="font-medium text-[#f2f2f4]">Facilities / sites</h2>
          <div className="mt-3 flex flex-col gap-2">
            {siteList.map((s) => (
              <SiteRow key={s.id} accountId={id} site={s} />
            ))}
            {siteList.length === 0 && (
              <p className="text-sm text-[#5a5d64]">No facilities yet.</p>
            )}
          </div>
          <AddSiteForm accountId={id} />
        </section>

        {/* Contacts */}
        <section className="rounded-[14px] border border-white/[0.06] bg-[#1c1c1e] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <h2 className="font-medium text-[#f2f2f4]">Contacts</h2>
          <div className="mt-3 flex flex-col gap-2">
            {contactList.map((c) => (
              <ContactRow key={c.id} accountId={id} contact={c} />
            ))}
            {contactList.length === 0 && (
              <p className="text-sm text-[#5a5d64]">No contacts yet.</p>
            )}
          </div>
          <AddContactForm accountId={id} />
        </section>

        {/* Notes */}
        <section className="rounded-[14px] border border-white/[0.06] bg-[#1c1c1e] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <h2 className="font-medium text-[#f2f2f4]">Activity notes</h2>
          <AddNoteForm accountId={id} />
          <div className="mt-3 flex flex-col gap-2">
            {noteList.map((n) => (
              <NoteRow key={n.id} accountId={id} note={n} />
            ))}
            {noteList.length === 0 && <p className="text-sm text-[#5a5d64]">No notes yet.</p>}
          </div>
        </section>

        {/* Docs */}
        <section className="rounded-[14px] border border-white/[0.06] bg-[#1c1c1e] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <h2 className="font-medium text-[#f2f2f4]">Uploaded documents</h2>
          <div className="mt-3 flex flex-col gap-2">
            {docList.map((d) => (
              <DocLink key={d.id} doc={d} />
            ))}
            {docList.length === 0 && <p className="text-sm text-[#5a5d64]">No documents yet.</p>}
          </div>
          <form action={uploadDocWithId} className="mt-4 flex flex-col gap-2">
            <input
              name="title"
              placeholder="Deal / project title"
              required
              className="rounded-md border border-white/[0.10] px-2 py-1.5 text-sm"
            />
            <div className="flex gap-2">
              <select name="kind" className="rounded-md border border-white/[0.10] px-2 py-1.5 text-sm">
                <option value="quote">Quote</option>
                <option value="sow">SOW</option>
              </select>
              <select
                name="facilitySiteId"
                className="flex-1 rounded-md border border-white/[0.10] px-2 py-1.5 text-sm"
              >
                <option value="">No facility (group-level)</option>
                {siteList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <input type="file" name="file" accept="application/pdf,.pdf" required className="text-sm" />
            <label className="flex items-center gap-1.5 text-xs text-[#aeb1b8]">
              <input type="checkbox" name="trackPipeline" defaultChecked />
              Track this on the pipeline
            </label>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#aeb1b8]">
                Pipeline stage (continues this account&apos;s current tile, if any)
              </label>
              <select
                name="pipelineStage"
                defaultValue={a.stage}
                className="rounded-md border border-white/[0.10] px-2 py-1.5 text-sm"
              >
                {STAGES.filter((s) => s !== "Live").map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="self-start rounded-md border border-white/[0.10] px-3 py-1.5 text-sm hover:bg-white/[0.05]"
            >
              Upload
            </button>
          </form>
        </section>
      </div>
      </div>
    </div>
  );
}
