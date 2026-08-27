import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { healthDotClass } from "@/lib/ui";
import type { Account, Site, Contact, AccountNote, Doc } from "@/lib/types";
import { addSite, addContact, addNote, uploadDoc } from "../actions";
import { DocLink } from "./doc-link";
import { StageSelect } from "./stage-select";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: account }, { data: sites }, { data: contacts }, { data: notes }, { data: docs }] =
    await Promise.all([
      supabase.from("accounts").select("*").eq("id", id).single(),
      supabase.from("sites").select("*").eq("account_id", id).order("name"),
      supabase.from("contacts").select("*").eq("account_id", id).order("name"),
      supabase.from("account_notes").select("*").eq("account_id", id).order("note_date", { ascending: false }),
      supabase.from("docs").select("*").eq("account_id", id).order("uploaded_at", { ascending: false }),
    ]);

  if (!account) notFound();

  const a = account as Account;
  const siteList = (sites ?? []) as Site[];
  const contactList = (contacts ?? []) as Contact[];
  const noteList = (notes ?? []) as AccountNote[];
  const docList = (docs ?? []) as Doc[];

  const addSiteWithId = addSite.bind(null, id);
  const addContactWithId = addContact.bind(null, id);
  const addNoteWithId = addNote.bind(null, id);
  const uploadDocWithId = uploadDoc.bind(null, id);

  return (
    <div className="p-8">
      <Link href="/accounts" className="text-sm text-neutral-400 hover:text-neutral-700">
        &larr; All accounts / groups
      </Link>

      <div className="mt-2 flex items-center gap-3">
        <span className={`h-3 w-3 rounded-full ${healthDotClass(a.health)}`} />
        <h1 className="text-2xl font-semibold text-neutral-900">{a.name}</h1>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
          {a.segment === "managed" ? "Managed" : "Deal"}
        </span>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Sites */}
        <section className="rounded-lg border border-neutral-200 p-5">
          <h2 className="font-medium text-neutral-900">Facilities / sites</h2>
          <div className="mt-3 flex flex-col gap-2">
            {siteList.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-md border border-neutral-100 px-3 py-2"
              >
                <div>
                  <div className="text-sm font-medium text-neutral-800">{s.name}</div>
                  <div className="text-xs text-neutral-400">{s.location}</div>
                </div>
                <StageSelect accountId={id} siteId={s.id} stage={s.stage} />
              </div>
            ))}
            {siteList.length === 0 && (
              <p className="text-sm text-neutral-400">No facilities yet.</p>
            )}
          </div>
          <form action={addSiteWithId} className="mt-4 flex gap-2">
            <input
              name="name"
              placeholder="Facility name"
              required
              className="flex-1 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            />
            <input
              name="location"
              placeholder="City, State"
              className="w-32 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            />
            <button
              type="submit"
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
            >
              + Add
            </button>
          </form>
        </section>

        {/* Contacts */}
        <section className="rounded-lg border border-neutral-200 p-5">
          <h2 className="font-medium text-neutral-900">Contacts</h2>
          <div className="mt-3 flex flex-col gap-2">
            {contactList.map((c) => (
              <div key={c.id} className="rounded-md border border-neutral-100 px-3 py-2 text-sm">
                <div className="font-medium text-neutral-800">
                  {c.name}
                  {c.role && <span className="ml-2 text-xs text-neutral-400">{c.role}</span>}
                </div>
                <div className="text-xs text-neutral-400">
                  {[c.email, c.phone].filter(Boolean).join(" · ")}
                </div>
              </div>
            ))}
            {contactList.length === 0 && (
              <p className="text-sm text-neutral-400">No contacts yet.</p>
            )}
          </div>
          <form action={addContactWithId} className="mt-4 grid grid-cols-2 gap-2">
            <input
              name="name"
              placeholder="Full name"
              required
              className="col-span-2 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            />
            <input
              name="email"
              placeholder="Email"
              className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            />
            <input
              name="phone"
              placeholder="Phone"
              className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            />
            <button
              type="submit"
              className="col-span-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
            >
              + Add contact
            </button>
          </form>
        </section>

        {/* Notes */}
        <section className="rounded-lg border border-neutral-200 p-5">
          <h2 className="font-medium text-neutral-900">Activity notes</h2>
          <form action={addNoteWithId} className="mt-3 flex gap-2">
            <textarea
              name="body"
              placeholder="What happened, what's next…"
              required
              className="flex-1 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            />
            <button
              type="submit"
              className="self-start rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
            >
              Add
            </button>
          </form>
          <div className="mt-3 flex flex-col gap-2">
            {noteList.map((n) => (
              <div key={n.id} className="rounded-md border border-neutral-100 px-3 py-2 text-sm">
                <div className="text-xs text-neutral-400">{n.note_date}</div>
                <div className="text-neutral-700">{n.body}</div>
              </div>
            ))}
            {noteList.length === 0 && <p className="text-sm text-neutral-400">No notes yet.</p>}
          </div>
        </section>

        {/* Docs */}
        <section className="rounded-lg border border-neutral-200 p-5">
          <h2 className="font-medium text-neutral-900">Uploaded documents</h2>
          <div className="mt-3 flex flex-col gap-2">
            {docList.map((d) => (
              <DocLink key={d.id} doc={d} />
            ))}
            {docList.length === 0 && <p className="text-sm text-neutral-400">No documents yet.</p>}
          </div>
          <form action={uploadDocWithId} className="mt-4 flex flex-col gap-2">
            <input
              name="title"
              placeholder="Deal / project title"
              required
              className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            />
            <div className="flex gap-2">
              <select name="kind" className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm">
                <option value="quote">Quote</option>
                <option value="sow">SOW</option>
              </select>
              <select
                name="facilitySiteId"
                className="flex-1 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
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
            <button
              type="submit"
              className="self-start rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
            >
              Upload
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
