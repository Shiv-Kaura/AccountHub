"use client";

import { useTransition } from "react";
import { showToast } from "@/lib/toast-client";

export function LostToggle({
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
      className={
        lost
          ? "rounded-md border border-white/[0.10] px-2 py-1 text-xs text-[#aeb1b8] hover:bg-white/[0.05] disabled:opacity-60"
          : "rounded-md border border-[#d81159]/30 px-2 py-1 text-xs text-[#ff5c8a] hover:bg-[#d81159]/[0.16] disabled:opacity-60"
      }
    >
      {pending ? "…" : lost ? "Reopen" : "Mark lost"}
    </button>
  );
}

export function LostBadge() {
  return (
    <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#8c8f96]">
      Lost
    </span>
  );
}
