import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { STAGES } from "@/lib/types";
import type { Site, Account } from "@/lib/types";

export default async function PipelinePage() {
  const supabase = await createClient();
  const [{ data: sites }, { data: accounts }] = await Promise.all([
    supabase.from("sites").select("*").neq("stage", "Live"),
    supabase.from("accounts").select("id, name"),
  ]);

  const accountById = new Map((accounts ?? []).map((a: Pick<Account, "id" | "name">) => [a.id, a]));
  const siteList = (sites ?? []) as Site[];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-neutral-900">AM Pipeline</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Every facility being onboarded, grouped by stage.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-4">
        {STAGES.filter((s) => s !== "Live").map((stage) => {
          const cards = siteList.filter((s) => s.stage === stage);
          return (
            <div key={stage} className="min-w-0 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {stage}
                </span>
                <span className="text-xs text-neutral-400">{cards.length}</span>
              </div>
              <div className="mt-2 flex flex-col gap-2">
                {cards.map((s) => (
                  <Link
                    key={s.id}
                    href={`/accounts/${s.account_id}`}
                    className="block rounded-md border border-neutral-200 bg-white p-3 hover:shadow-sm"
                  >
                    <div className="text-sm font-medium text-neutral-800">{s.name}</div>
                    <div className="text-xs text-neutral-400">
                      {accountById.get(s.account_id)?.name ?? ""}
                    </div>
                  </Link>
                ))}
                {cards.length === 0 && (
                  <p className="px-1 text-xs text-neutral-400">Nothing here.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
