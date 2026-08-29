"use client";

import { useTransition } from "react";
import { STAGES, type Stage } from "@/lib/types";
import { showToast } from "@/lib/toast-client";

export function PipelineArrows({
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
    <div className="mt-2 flex items-center gap-1">
      <button
        type="button"
        disabled={pending || !prev}
        onClick={() => move(prev)}
        title={prev ? `Move back to ${prev}` : "Already at the first stage"}
        className="rounded border border-white/[0.07] px-1.5 py-0.5 text-xs text-[#8c8f96] hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-30"
      >
        &larr;
      </button>
      <button
        type="button"
        disabled={pending || !next}
        onClick={() => move(next)}
        title={next ? `Move forward to ${next}` : "Already at the last stage"}
        className="rounded border border-white/[0.07] px-1.5 py-0.5 text-xs text-[#8c8f96] hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-30"
      >
        &rarr;
      </button>
    </div>
  );
}
