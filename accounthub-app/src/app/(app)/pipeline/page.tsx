import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { STAGES } from "@/lib/types";
import type { Site, Account, Quote, Sow } from "@/lib/types";

type PipelineCard = {
  id: string;
  type: "site" | "quote" | "sow";
  stage: string;
  title: string;
  subtitle: string;
  href: string;
};

const TYPE_LABEL: Record<PipelineCard["type"], string> = {
  site: "Facility",
  quote: "Quote",
  sow: "SOW",
};

const TYPE_BADGE_CLASS: Record<PipelineCard["type"], string> = {
  site: "bg-neutral-100 text-neutral-500",
  quote: "bg-blue-50 text-blue-600",
  sow: "bg-violet-50 text-violet-600",
};

export default async function PipelinePage() {
  const supabase = await createClient();
  const [{ data: sites }, { data: accounts }, { data: quotes }, { data: sows }] = await Promise.all([
    supabase.from("sites").select("*").neq("stage", "Live"),
    supabase.from("accounts").select("id, name"),
    supabase.from("quotes").select("*").neq("stage", "Live"),
    supabase.from("sows").select("*").neq("stage", "Live"),
  ]);

  const accountById = new Map((accounts ?? []).map((a: Pick<Account, "id" | "name">) => [a.id, a]));
  const siteList = (sites ?? []) as Site[];
  const quoteList = (quotes ?? []) as Quote[];
  const sowList = (sows ?? []) as Sow[];

  const cards: PipelineCard[] = [
    ...siteList.map((s) => ({
      id: `site-${s.id}`,
      type: "site" as const,
      stage: s.stage,
      title: s.name,
      subtitle: accountById.get(s.account_id ?? "")?.name ?? "",
      href: `/accounts/${s.account_id}`,
    })),
    ...quoteList.map((q) => ({
      id: `quote-${q.id}`,
      type: "quote" as const,
      stage: q.stage,
      title: q.name,
      subtitle: q.customer,
      href: `/quotes/${q.id}`,
    })),
    ...sowList.map((s) => ({
      id: `sow-${s.id}`,
      type: "sow" as const,
      stage: s.stage,
      title: s.project_title,
      subtitle: s.customer,
      href: `/sows/${s.id}`,
    })),
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-neutral-900">AM Pipeline</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Every facility being onboarded, quote, and SOW, grouped by stage.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-4">
        {STAGES.filter((s) => s !== "Live").map((stage) => {
          const stageCards = cards.filter((c) => c.stage === stage);
          return (
            <div key={stage} className="min-w-0 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {stage}
                </span>
                <span className="text-xs text-neutral-400">{stageCards.length}</span>
              </div>
              <div className="mt-2 flex flex-col gap-2">
                {stageCards.map((c) => (
                  <Link
                    key={c.id}
                    href={c.href}
                    className="block rounded-md border border-neutral-200 bg-white p-3 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${TYPE_BADGE_CLASS[c.type]}`}>
                        {TYPE_LABEL[c.type]}
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-medium text-neutral-800">{c.title}</div>
                    <div className="text-xs text-neutral-400">{c.subtitle}</div>
                  </Link>
                ))}
                {stageCards.length === 0 && (
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
