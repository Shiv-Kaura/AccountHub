"use client";

import { useTransition } from "react";
import { STAGES, type Stage } from "@/lib/types";
import { stagePillClass } from "@/lib/ui";
import { updateQuoteStage } from "../actions";

export function QuoteStageSelect({ id, stage }: { id: string; stage: Stage }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={stage}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(() => {
          updateQuoteStage(id, next);
        });
      }}
      className={`rounded-full px-2 py-1 text-xs font-medium ${stagePillClass(stage)} disabled:opacity-60`}
    >
      {STAGES.map((st) => (
        <option key={st} value={st}>
          {st}
        </option>
      ))}
    </select>
  );
}
