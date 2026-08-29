"use client";

// Dark-board-only interactive controls. Kept separate from the shared
// PipelineArrows/LostToggle (in ../lost-toggle.tsx and ./pipeline-arrows.tsx)
// because those are also used on the still-light quote/SOW detail pages and
// the account's site row — reusing them here would mean either breaking
// those pages' contrast or making every shared component theme-aware for a
// theme only this one board uses so far.

import { useTransition } from "react";
import { STAGES, type Stage } from "@/lib/types";
import { showToast } from "@/lib/toast-client";
import { ChevronLeftIcon, ChevronRightIcon } from "./pipeline-icons";

export function DarkPipelineArrows({
  stage,
  onMove,
}: {
  stage: Stage;
  onMove: (nextStage: Stage) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const idx = STAGES.indexOf(stage);
  const prev = idx > 0 ? STAGES[idx - 1] : null;
  const next = idx < STAGES.length - 1 ? STAGES[idx + 1] : null;

  function move(target: Stage | null) {
    if (!target || pending) return;
    startTransition(async () => {
      try {
        await onMove(target);
        showToast(`Moved to ${target}`);
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Couldn't move that", "error");
      }
    });
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={pending || !prev}
        onClick={() => move(prev)}
        title={prev ? `Move back to ${prev}` : "Already at the first stage"}
        className="flex h-[23px] w-[23px] items-center justify-center rounded-[7px] bg-white/[0.045] text-[#3d3f44] transition-colors hover:bg-white/[0.08] hover:text-[#c7c9d0] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeftIcon />
      </button>
      <button
        type="button"
        disabled={pending || !next}
        onClick={() => move(next)}
        title={next ? `Move forward to ${next}` : "Already at the last stage"}
        className="group flex h-[23px] w-[23px] items-center justify-center rounded-[7px] bg-white/[0.06] text-[#c7c9d0] transition-all hover:bg-gradient-to-b hover:from-[#0496ff] hover:to-[#006ba6] hover:text-white hover:shadow-[0_2px_8px_rgba(4,150,255,0.5)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}

export function DarkLostToggle({
  lost,
  onToggle,
  itemLabel,
}: {
  lost: boolean;
  onToggle: (nextLost: boolean) => Promise<void>;
  itemLabel: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const next = !lost;
        if (next && !confirm(`Mark ${itemLabel} as lost? It'll drop off the active pipeline but stay on record.`)) {
          return;
        }
        startTransition(async () => {
          try {
            await onToggle(next);
            showToast(next ? `${itemLabel} marked lost` : `${itemLabel} reopened`);
          } catch (e) {
            showToast(e instanceof Error ? e.message : "Couldn't update that", "error");
          }
        });
      }}
      className="text-[10.5px] text-[#5a5d64] transition-colors hover:text-[#ff5c8a] disabled:opacity-60"
    >
      {pending ? "…" : lost ? "Restore from lost" : "Mark lost"}
    </button>
  );
}

export function DarkLostBadge() {
  return (
    <span className="rounded-[6px] bg-[rgba(216,17,89,0.16)] px-[7px] py-[3px] text-[9.5px] font-bold uppercase tracking-[0.03em] text-[#ff5c8a]">
      Lost
    </span>
  );
}
