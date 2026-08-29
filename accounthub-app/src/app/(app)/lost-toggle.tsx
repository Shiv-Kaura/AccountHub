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
          ? "rounded-md border border-neutral-300 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-50 disabled:opacity-60"
          : "rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-60"
      }
    >
      {pending ? "…" : lost ? "Reopen" : "Mark lost"}
    </button>
  );
}

export function LostBadge() {
  return (
    <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-neutral-500">
      Lost
    </span>
  );
}
