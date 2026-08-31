import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { STAGES, type Stage } from "@/lib/types";
import type { Site, Account, Quote, Sow } from "@/lib/types";
import { moveSiteStage, markSiteLost, moveAccountStage, markAccountLost } from "../accounts/actions";
import { updateQuoteStage, markQuoteLost } from "../quotes/actions";
import { updateSowStage, markSowLost } from "../sows/actions";
import { moveDealStage, markDealLost } from "./actions";
import { DarkPipelineArrows, DarkLostToggle, DarkLostBadge } from "./dark-controls";
import { FacilityIcon, DocIcon, SparkIcon, SearchIcon, DotsIcon, EmptyIcon, FilterIcon } from "./pipeline-icons";
import { ownerInitials, ownerGradient } from "@/lib/owner-avatar";
import { daysInStage, daysInStageLabel } from "@/lib/ui";

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
  ownerName: string;
  stageChangedAt: string;
  lost: boolean;
  moveFn: (stage: string) => Promise<void>;
  lostFn: (lost: boolean) => Promise<void>;
};

type AccountMeta = Pick<Account, "id" | "name" | "segment" | "owner_name" | "stage" | "lost" | "stage_changed_at">;

const TYPE_LABEL: Record<PipelineCard["type"], string> = {
  site: "Facility",
  quote: "Quote",
  sow: "SOW",
  deal: "Quote + SOW",
  prospect: "Prospect",
};

// Every badge maps to the approved dark design system: neutral gray by
// default, with color reserved for the two hues that carry meaning
// (sunflower-gold = Prospect, dodger-blue/cornflower-ocean = anything
// quote/SOW-shaped). Facility stays plain gray on purpose.
function badgeClasses(type: PipelineCard["type"]) {
  switch (type) {
    case "prospect":
      return "text-[#ffbc42] bg-[rgba(255,188,66,0.13)]";
    case "quote":
    case "sow":
    case "deal":
      return "text-[#4fc3ff] bg-[rgba(4,150,255,0.14)]";
    default:
      return "text-[#aeb1b8] bg-white/[0.06]";
  }
}

function BadgeIcon({ type }: { type: PipelineCard["type"] }) {
  if (type === "prospect") return <SparkIcon />;
  if (type === "quote" || type === "sow" || type === "deal") return <DocIcon />;
  return <FacilityIcon />;
}

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
    supabase.from("accounts").select("id, name, segment, owner_name, stage, lost, stage_changed_at"),
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
        ownerName: accountById.get(q.account_id ?? "")?.owner_name ?? "",
        stageChangedAt: q.stage_changed_at < match.stage_changed_at ? match.stage_changed_at : q.stage_changed_at,
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
      ownerName: s.owner || accountById.get(s.account_id ?? "")?.owner_name || "",
      stageChangedAt: s.stage_changed_at,
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
      ownerName: accountById.get(q.account_id ?? "")?.owner_name ?? "",
      stageChangedAt: q.stage_changed_at,
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
      ownerName: accountById.get(s.account_id ?? "")?.owner_name ?? "",
      stageChangedAt: s.stage_changed_at,
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
      subtitle: a.owner_name ? "New prospect, no quote/SOW yet" : "New prospect — no quote/SOW yet",
      href: `/accounts/${a.id}`,
      accountId: a.id,
      ownerName: a.owner_name ?? "",
      stageChangedAt: a.stage_changed_at,
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
    <div className="relative min-h-screen text-[#eceef0]">
      {/* Grain + color washes now come from the site-wide AmbientGlow in the app layout —
          this page no longer needs its own (previously a plain white corner blob, an
          earlier iteration superseded by the approved G-final system). */}

      {/* Top bar */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] bg-[rgba(20,20,22,0.62)] px-7 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur-[22px] backdrop-saturate-[140%]">
        <div className="flex items-center gap-3">
          <span className="text-[15px]">🚀</span>
          <span className="text-[13px] font-semibold tracking-tight text-[#f2f2f4]">AccountHub</span>
          <span className="h-3.5 w-px bg-white/10" />
          <span className="text-[13px] text-[#8c8f96]">Pipeline</span>
        </div>

        <form action="/search" className="flex w-[280px] items-center gap-2 rounded-[9px] border border-white/[0.08] bg-white/[0.045] px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <SearchIcon className="text-[#6c6f78]" />
          <input
            name="q"
            type="search"
            placeholder="Search accounts, quotes…"
            className="flex-1 bg-transparent text-xs text-[#e5e6ea] placeholder:text-[#6c6f78] focus:outline-none"
          />
        </form>

        <form action="/pipeline" className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.05] px-2.5 py-1.5 text-xs text-[#c7c9d0] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <FilterIcon className="text-[#8c8f96]" />
            <label className="sr-only" htmlFor="segment">Segment</label>
            <select
              id="segment"
              name="segment"
              defaultValue={sp.segment ?? "all"}
              className="bg-transparent text-xs text-[#c7c9d0] focus:outline-none"
            >
              <option className="bg-[#1c1c1e]" value="all">Segment: All</option>
              <option className="bg-[#1c1c1e]" value="managed">Managed</option>
              <option className="bg-[#1c1c1e]" value="prospect">Prospect</option>
            </select>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.05] px-2.5 py-1.5 text-xs text-[#c7c9d0] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <label className="sr-only" htmlFor="owner">Owner</label>
            <select
              id="owner"
              name="owner"
              defaultValue={sp.owner ?? "all"}
              className="bg-transparent text-xs text-[#c7c9d0] focus:outline-none"
            >
              <option className="bg-[#1c1c1e]" value="all">Owner: All</option>
              {owners.map((o) => (
                <option className="bg-[#1c1c1e]" key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-1.5 text-xs text-[#8c8f96]">
            <input
              type="checkbox"
              name="lost"
              value="1"
              defaultChecked={showLost}
              className="h-3.5 w-3.5 rounded border-white/20 bg-transparent accent-[#0496ff]"
            />
            Show lost
          </label>
          <button
            type="submit"
            className="rounded-lg bg-[#0496ff] px-3.5 py-1.5 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] transition hover:brightness-110 active:brightness-90 active:scale-[0.98]"
          >
            Apply filters
          </button>
          {hasActiveFilters && (
            <Link href="/pipeline" className="text-xs text-[#5a5d64] hover:text-[#c7c9d0]">
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Header */}
      <div className="relative px-7 pt-6">
        <h1 className="text-[19px] font-semibold tracking-tight text-[#f7f7f8]">Pipeline</h1>
        <p className="mt-1 max-w-xl text-[12.5px] leading-relaxed text-[#8c8f96]">
          Every prospect, facility being onboarded, quote, and SOW — grouped by stage. A quote and
          SOW for the same deal move together; a prospect with nothing attached yet still shows up
          so you can track it from day one.
        </p>
      </div>

      {/* Board */}
      <div className="relative mx-7 my-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {STAGES.filter((s) => s !== "Live").map((stage) => {
          const stageCards = filteredCards.filter((c) => c.stage === stage);
          const activeCards = stageCards.filter((c) => !c.lost);
          const avgDays =
            activeCards.length > 0
              ? Math.round(activeCards.reduce((sum, c) => sum + daysInStage(c.stageChangedAt), 0) / activeCards.length)
              : null;

          return (
            <div key={stage} className="flex min-h-[600px] flex-col rounded-[18px] border border-white/[0.06] bg-white/[0.03] p-2.5">
              <div className="flex items-baseline justify-between px-1.5 pb-3 pt-1.5">
                <span className="text-[11.5px] font-bold uppercase tracking-wide text-[#aeb1b8]">{stage}</span>
                <div className="flex items-baseline gap-1.5">
                  {avgDays !== null && <span className="text-[10px] text-[#5a5d64]">avg {avgDays}d</span>}
                  <span className="rounded-full bg-white/[0.06] px-2 py-px text-[10.5px] font-semibold text-[#8c8f96]">
                    {stageCards.length}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                {stageCards.map((c) => (
                  <div
                    key={c.id}
                    className={`group relative rounded-[14px] border border-white/[0.06] bg-[#1c1c1e] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] transition-colors hover:bg-[#232326] ${c.lost ? "opacity-60" : ""}`}
                  >
                    <button
                      type="button"
                      title="More actions"
                      className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.06] text-[#b0b3ba] opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <DotsIcon />
                    </button>

                    <div className="flex items-center gap-2 pr-6">
                      <span className={`inline-flex items-center gap-1 rounded-md px-[7px] py-[3px] text-[9.5px] font-bold uppercase tracking-wide ${badgeClasses(c.type)}`}>
                        <BadgeIcon type={c.type} />
                        {TYPE_LABEL[c.type]}
                      </span>
                      {c.lost && <DarkLostBadge />}
                    </div>

                    {c.type === "deal" ? (
                      <>
                        <div className="mt-2.5 text-[13.5px] font-semibold text-[#f2f2f4]">{c.title}</div>
                        <div className="text-[11.5px] text-[#8c8f96]">{c.subtitle}</div>
                        <div className="mt-2 flex gap-3.5">
                          <Link href={c.quoteHref!} className="text-[11px] font-semibold text-[#4fc3ff] hover:underline">
                            Open quote
                          </Link>
                          <Link href={c.sowHref!} className="text-[11px] font-semibold text-[#4fc3ff] hover:underline">
                            Open SOW
                          </Link>
                        </div>
                      </>
                    ) : (
                      <Link href={c.href} className="block">
                        <div className="mt-2.5 text-[13.5px] font-semibold text-[#f2f2f4]">{c.title}</div>
                        <div className="text-[11.5px] text-[#8c8f96]">{c.subtitle}</div>
                      </Link>
                    )}

                    {c.ownerName && (
                      <div className="mt-3 flex items-center gap-1.5">
                        <span
                          className="flex h-[19px] w-[19px] items-center justify-center rounded-full text-[8.5px] font-bold text-white"
                          style={{
                            background: `linear-gradient(180deg, ${ownerGradient(c.ownerName).from}, ${ownerGradient(c.ownerName).to})`,
                          }}
                        >
                          {ownerInitials(c.ownerName)}
                        </span>
                        <span className="text-[11px] text-[#c7c9d0]">{c.ownerName}</span>
                        <span className="text-[11px] text-[#3d3f44]">·</span>
                        <span className="text-[11px] text-[#77797f]">{daysInStageLabel(c.stageChangedAt)}</span>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <DarkPipelineArrows stage={c.stage} onMove={c.moveFn} />
                      <DarkLostToggle lost={c.lost} itemLabel={c.title} onToggle={c.lostFn} />
                    </div>
                  </div>
                ))}
                {stageCards.length === 0 && (
                  <div className="mx-0.5 flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-white/[0.09] px-3 py-5">
                    <EmptyIcon className="text-[#3d3f44]" />
                    <span className="text-[11px] text-[#4d4f56]">Nothing here yet</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
