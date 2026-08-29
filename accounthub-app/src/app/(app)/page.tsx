import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { healthDotClass, isOverdue } from "@/lib/ui";
import type { Account, Item, AccountNote, Quote, Sow, Doc, Contact, Site } from "@/lib/types";

type ActivityEntry = {
  at: string;
  href: string;
  label: string;
  detail: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { data: accounts },
    { data: items },
    { data: recentNotes },
    { data: recentQuotes },
    { data: recentSows },
    { data: recentDocs },
    { data: recentContacts },
    { data: recentSites },
    { count: openSitesCount },
    { count: openQuotesCount },
    { count: openSowsCount },
  ] = await Promise.all([
    supabase.from("accounts").select("id, name, health").order("name"),
    supabase.from("items").select("*").neq("status", "resolved").order("due_date", { ascending: true, nullsFirst: false }),
    supabase.from("account_notes").select("*").order("created_at", { ascending: false }).limit(6),
    supabase.from("quotes").select("*").order("created_at", { ascending: false }).limit(6),
    supabase.from("sows").select("*").order("created_at", { ascending: false }).limit(6),
    supabase.from("docs").select("*").order("uploaded_at", { ascending: false }).limit(6),
    supabase.from("contacts").select("*").order("created_at", { ascending: false }).limit(6),
    supabase.from("sites").select("*").order("created_at", { ascending: false }).limit(6),
    supabase.from("sites").select("id", { count: "exact", head: true }).neq("stage", "Live").eq("lost", false),
    supabase.from("quotes").select("id", { count: "exact", head: true }).neq("stage", "Live").eq("lost", false).eq("track_pipeline", true),
    supabase.from("sows").select("id", { count: "exact", head: true }).neq("stage", "Live").eq("lost", false).eq("track_pipeline", true),
  ]);

  const accountList = (accounts ?? []) as Pick<Account, "id" | "name" | "health">[];
  const accountById = new Map(accountList.map((a) => [a.id, a]));
  const itemList = (items ?? []) as Item[];
  const flagged = accountList.filter((a) => a.health === "red" || a.health === "yellow");
  const overdueItems = itemList.filter((it) => isOverdue(it.due_date));

  const activity: ActivityEntry[] = [
    ...((recentNotes ?? []) as (AccountNote & { created_at: string })[]).map((n) => ({
      at: n.created_at,
      href: `/accounts/${n.account_id}`,
      label: `Note on ${accountById.get(n.account_id)?.name ?? "an account"}`,
      detail: n.body,
    })),
    ...((recentQuotes ?? []) as Quote[]).map((q) => ({
      at: (q as unknown as { created_at: string }).created_at,
      href: `/quotes/${q.id}`,
      label: "Quote created",
      detail: q.name || q.customer,
    })),
    ...((recentSows ?? []) as Sow[]).map((s) => ({
      at: (s as unknown as { created_at: string }).created_at,
      href: `/sows/${s.id}`,
      label: "SOW created",
      detail: s.project_title || s.customer,
    })),
    ...((recentDocs ?? []) as Doc[]).map((d) => ({
      at: d.uploaded_at,
      href: `/accounts/${d.account_id}`,
      label: `Document uploaded — ${accountById.get(d.account_id)?.name ?? ""}`,
      detail: d.title,
    })),
    ...((recentContacts ?? []) as (Contact & { created_at: string })[]).map((c) => ({
      at: c.created_at,
      href: `/accounts/${c.account_id}`,
      label: `Contact added — ${accountById.get(c.account_id)?.name ?? ""}`,
      detail: c.name,
    })),
    ...((recentSites ?? []) as (Site & { created_at: string })[]).map((s) => ({
      at: s.created_at,
      href: `/accounts/${s.account_id}`,
      label: `Facility added — ${accountById.get(s.account_id)?.name ?? ""}`,
      detail: s.name,
    })),
  ]
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 10);

  const stats = [
    { label: "Accounts", value: accountList.length, href: "/accounts" },
    { label: "Facilities in pipeline", value: openSitesCount ?? 0, href: "/pipeline" },
    { label: "Open quotes", value: openQuotesCount ?? 0, href: "/quotes" },
    { label: "Open SOWs", value: openSowsCount ?? 0, href: "/sows" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">What needs your attention today.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-lg border border-neutral-200 p-4 hover:border-[#5b3a99]/40 hover:shadow-sm"
          >
            <div className="text-2xl font-semibold text-[#3d1f6e]">{s.value}</div>
            <div className="mt-1 text-xs text-neutral-500">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="rounded-lg border border-neutral-200 p-5">
          <h2 className="font-medium text-neutral-900">Needs attention</h2>

          {flagged.length > 0 && (
            <div className="mt-3">
              <div className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Accounts flagged
              </div>
              <div className="mt-2 flex flex-col gap-2">
                {flagged.map((a) => (
                  <Link
                    key={a.id}
                    href={`/accounts/${a.id}`}
                    className="flex items-center gap-2 rounded-md border border-neutral-100 px-3 py-2 text-sm hover:border-neutral-200"
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${healthDotClass(a.health)}`} />
                    {a.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {overdueItems.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Overdue priority items
              </div>
              <div className="mt-2 flex flex-col gap-2">
                {overdueItems.map((it) => (
                  <Link
                    key={it.id}
                    href={`/accounts/${it.account_id}`}
                    className="rounded-md border border-neutral-100 px-3 py-2 text-sm hover:border-neutral-200"
                  >
                    <div className="font-medium text-neutral-800">{it.title}</div>
                    <div className="text-xs text-red-600">
                      due {it.due_date} · {accountById.get(it.account_id)?.name ?? ""}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {flagged.length === 0 && overdueItems.length === 0 && (
            <p className="mt-3 text-sm text-neutral-400">Nothing flagged — everything&apos;s on track.</p>
          )}
        </section>

        <section className="rounded-lg border border-neutral-200 p-5">
          <h2 className="font-medium text-neutral-900">Recent activity</h2>
          <div className="mt-3 flex flex-col gap-2">
            {activity.map((a, i) => (
              <Link
                key={i}
                href={a.href}
                className="rounded-md border border-neutral-100 px-3 py-2 text-sm hover:border-neutral-200"
              >
                <div className="font-medium text-neutral-800">{a.label}</div>
                <div className="truncate text-xs text-neutral-500">{a.detail}</div>
              </Link>
            ))}
            {activity.length === 0 && (
              <p className="text-sm text-neutral-400">Nothing yet — activity will show up here.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
