import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { STAGES, type Stage } from "@/lib/types";
import type { Site, Account, Quote, Sow } from "@/lib/types";
import { moveSiteStage } from "../accounts/actions";
import { updateQuoteStage } from "../quotes/actions";
import { updateSowStage } from "../sows/actions";
import { moveDealStage } from "./actions";
import { PipelineArrows } from "./pipeline-arrows";

type PipelineCard = {
  id: string;
  type: "site" | "quote" | "sow" | "deal";
  stage: Stage;
  title: string;
  subtitle: string;
  href: string;
  quoteHref?: string;
  sowHref?: string;
  moveFn: (stage: string) => Promise<void>;
};

const TYPE_LABEL: Record<PipelineCard["type"], string> = {
  site: "Facility",
  quote: "Quote",
  sow: "SOW",
  deal: "Quote + SOW",
};

const TYPE_BADGE_CLASS: Record<PipelineCard["type"], string> = {
  site: "bg-neutral-100 text-neutral-500",
  quote: "bg-blue-50 text-blue-600",
  sow: "bg-violet-50 text-violet-600",
  deal: "bg-[#5b3a99]/10 text-[#3d1f6e]",
};

function dealNamesMatch(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase() && a.trim().length > 0;
}

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

  // Pair up quotes and SOWs that belong to the same account, are in the same
  // stage, and share a name — these move through the pipeline together as
  // one "deal" tile instead of two separate ones.
  const usedSowIds = new Set<string>();
  const dealCards: PipelineCard[] = [];
  const soloQuotes: Quote[] = [];

  for (const q of quoteList) {
    const match = q.account_id
      ? sowList.find(
          (s) =>
            !usedSowIds.has(s.id) &&
            s.account_id === q.account_id &&
            s.stage === q.stage &&
            dealNamesMatch(q.name, s.project_title)
        )
      : undefined;

    if (match) {
      usedSowIds.add(match.id);
      dealCards.push({
        id: `deal-${q.id}-${match.id}`,
        type: "deal",
        stage: q.stage,
        title: q.name,
        subtitle: q.customer || match.customer || accountById.get(q.account_id ?? "")?.name || "",
        href: `/quotes/${q.id}`,
        quoteHref: `/quotes/${q.id}`,
        sowHref: `/sows/${match.id}`,
        moveFn: moveDealStage.bind(null, q.id, match.id),
      });
    } else {
      soloQuotes.push(q);
    }
  }

  const soloSows = sowList.filter((s) => !usedSowIds.has(s.id));

  const cards: PipelineCard[] = [
    ...siteList.map((s) => ({
      id: `site-${s.id}`,
      type: "site" as const,
      stage: s.stage,
      title: s.name,
      subtitle: accountById.get(s.account_id ?? "")?.name ?? "",
      href: `/accounts/${s.account_id}`,
      moveFn: moveSiteStage.bind(null, s.account_id, s.id),
    })),
    ...dealCards,
    ...soloQuotes.map((q) => ({
      id: `quote-${q.id}`,
      type: "quote" as const,
      stage: q.stage,
      title: q.name,
      subtitle: q.customer,
      href: `/quotes/${q.id}`,
      moveFn: updateQuoteStage.bind(null, q.id),
    })),
    ...soloSows.map((s) => ({
      id: `sow-${s.id}`,
      type: "sow" as const,
      stage: s.stage,
      title: s.project_title,
      subtitle: s.customer,
      href: `/sows/${s.id}`,
      moveFn: updateSowStage.bind(null, s.id),
    })),
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-neutral-900">AM Pipeline</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Every facility being onboarded, quote, and SOW, grouped by stage. A quote and SOW for the same
        deal are shown as one tile and move together.
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
                  <div
                    key={c.id}
                    className="rounded-md border border-neutral-200 bg-white p-3 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${TYPE_BADGE_CLASS[c.type]}`}
                      >
                        {TYPE_LABEL[c.type]}
                      </span>
                    </div>
                    {c.type === "deal" ? (
                      <>
                        <div className="mt-1 text-sm font-medium text-neutral-800">{c.title}</div>
                        <div className="text-xs text-neutral-400">{c.subtitle}</div>
                        <div className="mt-1 flex gap-3 text-xs">
                          <Link href={c.quoteHref!} className="text-blue-600 hover:underline">
                            Open quote
                          </Link>
                          <Link href={c.sowHref!} className="text-violet-600 hover:underline">
                            Open SOW
                          </Link>
                        </div>
                      </>
                    ) : (
                      <Link href={c.href} className="block">
                        <div className="mt-1 text-sm font-medium text-neutral-800">{c.title}</div>
                        <div className="text-xs text-neutral-400">{c.subtitle}</div>
                      </Link>
                    )}
                    <PipelineArrows stage={c.stage} onMove={c.moveFn} />
                  </div>
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
