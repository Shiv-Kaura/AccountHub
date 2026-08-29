import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { STAGES, type Stage } from "@/lib/types";
import type { Site, Account, Quote, Sow } from "@/lib/types";
import { moveSiteStage, markSiteLost, moveAccountStage, markAccountLost } from "../accounts/actions";
import { updateQuoteStage, markQuoteLost } from "../quotes/actions";
import { updateSowStage, markSowLost } from "../sows/actions";
import { moveDealStage, markDealLost } from "./actions";
import { PipelineArrows } from "./pipeline-arrows";
import { LostToggle, LostBadge } from "../lost-toggle";

type PipelineCard = {
  id: string;
  type: "site" | "quote" | "sow" | "deal" | "prospect";
  stage: Stage;
  title: string;
  subtitle: string;
  href: string;
  quoteHref?: string;
  sowHref?: string;
  accountId: string | null;
  lost: boolean;
  moveFn: (stage: string) => Promise<void>;
  lostFn: (lost: boolean) => Promise<void>;
};

type AccountMeta = Pick<Account, "id" | "name" | "segment" | "owner_name" | "stage" | "lost">;

const TYPE_LABEL: Record<PipelineCard["type"], string> = {
  site: "Facility",
  quote: "Quote",
  sow: "SOW",
  deal: "Quote + SOW",
  prospect: "Prospect",
};

const TYPE_BADGE_CLASS: Record<PipelineCard["type"], string> = {
  site: "bg-neutral-100 text-neutral-500",
  quote: "bg-blue-50 text-blue-600",
  sow: "bg-violet-50 text-violet-600",
  deal: "bg-[#5b3a99]/10 text-[#3d1f6e]",
  prospect: "bg-amber-50 text-amber-600",
};

function dealNamesMatch(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase() && a.trim().length > 0;
}

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ segment?: string; owner?: string; lost?: string }>;
}) {
  const sp = await searchParams;
  const segmentFilter = sp.segment && sp.segment !== "all" ? sp.segment : null;
  const ownerFilter = sp.owner && sp.owner !== "all" ? sp.owner : null;
  const showLost = sp.lost === "1";

  const supabase = await createClient();
  const [{ data: sites }, { data: accounts }, { data: quotes }, { data: sows }] = await Promise.all([
    supabase.from("sites").select("*").neq("stage", "Live"),
    supabase.from("accounts").select("id, name, segment, owner_name, stage, lost"),
    supabase.from("quotes").select("*").neq("stage", "Live"),
    supabase.from("sows").select("*").neq("stage", "Live"),
  ]);

  const accountList = (accounts ?? []) as AccountMeta[];
  const accountById = new Map(accountList.map((a) => [a.id, a]));
  const owners = Array.from(new Set(accountList.map((a) => a.owner_name).filter(Boolean))).sort();

  const siteList = (sites ?? []) as Site[];
  // Quotes/SOWs can opt out of the pipeline (e.g. an upload that's just background info) — those
  // still exist as normal records, just never generate a tile.
  const quoteList = ((quotes ?? []) as Quote[]).filter((q) => q.track_pipeline);
  const sowList = ((sows ?? []) as Sow[]).filter((s) => s.track_pipeline);

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
        accountId: q.account_id,
        lost: q.lost || match.lost,
        moveFn: moveDealStage.bind(null, q.id, match.id),
        lostFn: markDealLost.bind(null, q.id, match.id),
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
      accountId: s.account_id,
      lost: s.lost,
      moveFn: moveSiteStage.bind(null, s.account_id, s.id),
      lostFn: markSiteLost.bind(null, s.account_id, s.id),
    })),
    ...dealCards,
    ...soloQuotes.map((q) => ({
      id: `quote-${q.id}`,
      type: "quote" as const,
      stage: q.stage,
      title: q.name,
      subtitle: q.customer,
      href: `/quotes/${q.id}`,
      accountId: q.account_id,
      lost: q.lost,
      moveFn: updateQuoteStage.bind(null, q.id),
      lostFn: markQuoteLost.bind(null, q.id),
    })),
    ...soloSows.map((s) => ({
      id: `sow-${s.id}`,
      type: "sow" as const,
      stage: s.stage,
      title: s.project_title,
      subtitle: s.customer,
      href: `/sows/${s.id}`,
      accountId: s.account_id,
      lost: s.lost,
      moveFn: updateSowStage.bind(null, s.id),
      lostFn: markSowLost.bind(null, s.id),
    })),
  ];

  // A prospect with nothing attached yet — no facility, quote, or SOW — would otherwise be
  // invisible on the pipeline. Give it a bare "Prospect" placeholder tile, tracked via the
  // account's own stage, so it's trackable from day one. The moment a facility/quote/SOW shows
  // up for that account (above), this placeholder stops being generated and the real tile takes
  // its place.
  const accountsWithPresence = new Set(cards.map((c) => c.accountId).filter(Boolean));
  const prospectCards: PipelineCard[] = accountList
    .filter((a) => a.segment === "prospect" && !accountsWithPresence.has(a.id) && a.stage !== "Live")
    .map((a) => ({
      id: `prospect-${a.id}`,
      type: "prospect" as const,
      stage: a.stage,
      title: a.name,
      subtitle: a.owner_name || "New prospect — no quote/SOW yet",
      href: `/accounts/${a.id}`,
      accountId: a.id,
      lost: a.lost,
      moveFn: moveAccountStage.bind(null, a.id),
      lostFn: markAccountLost.bind(null, a.id),
    }));

  cards.push(...prospectCards);

  const filteredCards = cards.filter((c) => {
    if (!showLost && c.lost) return false;
    const meta = c.accountId ? accountById.get(c.accountId) : undefined;
    if (segmentFilter && meta?.segment !== segmentFilter) return false;
    if (ownerFilter && meta?.owner_name !== ownerFilter) return false;
    return true;
  });

  const hasActiveFilters = Boolean(segmentFilter || ownerFilter || showLost);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-neutral-900">Pipeline</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Every prospect, facility being onboarded, quote, and SOW, grouped by stage. A quote and
        SOW for the same deal are shown as one tile and move together; a prospect with nothing
        attached yet still shows up so you can track it from day one.
      </p>

      <form
        action="/pipeline"
        className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">Segment</label>
          <select
            name="segment"
            defaultValue={sp.segment ?? "all"}
            className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
          >
            <option value="all">All</option>
            <option value="managed">Managed</option>
            <option value="prospect">Prospect</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">Owner</label>
          <select
            name="owner"
            defaultValue={sp.owner ?? "all"}
            className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
          >
            <option value="all">All</option>
            {owners.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-1.5 pb-2 text-xs text-neutral-600">
          <input type="checkbox" name="lost" value="1" defaultChecked={showLost} />
          Show lost
        </label>
        <button
          type="submit"
          className="rounded-md bg-[#3d1f6e] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2d1650]"
        >
          Apply filters
        </button>
        {hasActiveFilters && (
          <Link href="/pipeline" className="pb-2 text-xs text-neutral-400 hover:text-neutral-700">
            Clear filters
          </Link>
        )}
      </form>

      <div className="mt-6 grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-4">
        {STAGES.filter((s) => s !== "Live").map((stage) => {
          const stageCards = filteredCards.filter((c) => c.stage === stage);
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
                    className={`rounded-md border border-neutral-200 bg-white p-3 hover:shadow-sm ${c.lost ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${TYPE_BADGE_CLASS[c.type]}`}
                      >
                        {TYPE_LABEL[c.type]}
                      </span>
                      {c.lost && <LostBadge />}
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
                    <div className="mt-2 flex items-center justify-between">
                      <PipelineArrows stage={c.stage} onMove={c.moveFn} />
                      <LostToggle lost={c.lost} itemLabel={c.title} onToggle={c.lostFn} />
                    </div>
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
