import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Account, Contact, Quote, Sow } from "@/lib/types";
import { GlassBanner } from "../glass-banner";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const supabase = await createClient();

  if (!query) {
    return (
      <div className="relative min-h-screen">
        <GlassBanner title="Search" showSearch={false} />
        <div className="p-8">
          <h1 className="text-2xl font-semibold text-[#f7f7f8]">Search</h1>
          <p className="mt-2 text-sm text-[#5a5d64]">Type something in the sidebar search box.</p>
        </div>
      </div>
    );
  }

  const like = `%${query}%`;

  const [{ data: accounts }, { data: contacts }, { data: quotes }, { data: sows }] = await Promise.all([
    supabase.from("accounts").select("id, name, health").ilike("name", like).limit(20),
    supabase.from("contacts").select("*").or(`name.ilike.${like},email.ilike.${like}`).limit(20),
    supabase.from("quotes").select("*").or(`name.ilike.${like},customer.ilike.${like}`).limit(20),
    supabase.from("sows").select("*").or(`project_title.ilike.${like},customer.ilike.${like}`).limit(20),
  ]);

  const accountList = (accounts ?? []) as Pick<Account, "id" | "name" | "health">[];
  const contactList = (contacts ?? []) as Contact[];
  const quoteList = (quotes ?? []) as Quote[];
  const sowList = (sows ?? []) as Sow[];

  const noResults =
    accountList.length === 0 && contactList.length === 0 && quoteList.length === 0 && sowList.length === 0;

  return (
    <div className="relative min-h-screen">
      <GlassBanner title="Search" showSearch={false} />
      <div className="p-8">
      <h1 className="text-2xl font-semibold text-[#f7f7f8]">Search results for &ldquo;{query}&rdquo;</h1>

      {noResults && <p className="mt-4 text-sm text-[#5a5d64]">Nothing matched.</p>}

      {accountList.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-medium uppercase tracking-wide text-[#5a5d64]">Accounts</h2>
          <div className="mt-2 flex flex-col gap-2">
            {accountList.map((a) => (
              <Link
                key={a.id}
                href={`/accounts/${a.id}`}
                className="rounded-md border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm hover:border-white/[0.12]"
              >
                {a.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {contactList.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-medium uppercase tracking-wide text-[#5a5d64]">Contacts</h2>
          <div className="mt-2 flex flex-col gap-2">
            {contactList.map((c) => (
              <Link
                key={c.id}
                href={`/accounts/${c.account_id}`}
                className="rounded-md border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm hover:border-white/[0.12]"
              >
                <div className="font-medium text-[#e5e6ea]">{c.name}</div>
                <div className="text-xs text-[#5a5d64]">{[c.email, c.phone].filter(Boolean).join(" · ")}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {quoteList.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-medium uppercase tracking-wide text-[#5a5d64]">Quotes</h2>
          <div className="mt-2 flex flex-col gap-2">
            {quoteList.map((qt) => (
              <Link
                key={qt.id}
                href={`/quotes/${qt.id}`}
                className="rounded-md border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm hover:border-white/[0.12]"
              >
                <div className="font-medium text-[#e5e6ea]">{qt.name}</div>
                <div className="text-xs text-[#5a5d64]">{qt.customer}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {sowList.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-medium uppercase tracking-wide text-[#5a5d64]">SOWs</h2>
          <div className="mt-2 flex flex-col gap-2">
            {sowList.map((s) => (
              <Link
                key={s.id}
                href={`/sows/${s.id}`}
                className="rounded-md border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm hover:border-white/[0.12]"
              >
                <div className="font-medium text-[#e5e6ea]">{s.project_title}</div>
                <div className="text-xs text-[#5a5d64]">{s.customer}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
      </div>
    </div>
  );
}
