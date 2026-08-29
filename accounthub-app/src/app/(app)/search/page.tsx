import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Account, Contact, Quote, Sow } from "@/lib/types";

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
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Search</h1>
        <p className="mt-2 text-sm text-neutral-400">Type something in the sidebar search box.</p>
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
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-neutral-900">Search results for &ldquo;{query}&rdquo;</h1>

      {noResults && <p className="mt-4 text-sm text-neutral-400">Nothing matched.</p>}

      {accountList.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-400">Accounts</h2>
          <div className="mt-2 flex flex-col gap-2">
            {accountList.map((a) => (
              <Link
                key={a.id}
                href={`/accounts/${a.id}`}
                className="rounded-md border border-neutral-100 px-3 py-2 text-sm hover:border-neutral-200"
              >
                {a.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {contactList.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-400">Contacts</h2>
          <div className="mt-2 flex flex-col gap-2">
            {contactList.map((c) => (
              <Link
                key={c.id}
                href={`/accounts/${c.account_id}`}
                className="rounded-md border border-neutral-100 px-3 py-2 text-sm hover:border-neutral-200"
              >
                <div className="font-medium text-neutral-800">{c.name}</div>
                <div className="text-xs text-neutral-400">{[c.email, c.phone].filter(Boolean).join(" · ")}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {quoteList.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-400">Quotes</h2>
          <div className="mt-2 flex flex-col gap-2">
            {quoteList.map((qt) => (
              <Link
                key={qt.id}
                href={`/quotes/${qt.id}`}
                className="rounded-md border border-neutral-100 px-3 py-2 text-sm hover:border-neutral-200"
              >
                <div className="font-medium text-neutral-800">{qt.name}</div>
                <div className="text-xs text-neutral-400">{qt.customer}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {sowList.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-400">SOWs</h2>
          <div className="mt-2 flex flex-col gap-2">
            {sowList.map((s) => (
              <Link
                key={s.id}
                href={`/sows/${s.id}`}
                className="rounded-md border border-neutral-100 px-3 py-2 text-sm hover:border-neutral-200"
              >
                <div className="font-medium text-neutral-800">{s.project_title}</div>
                <div className="text-xs text-neutral-400">{s.customer}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
