"use client";

import { useState, useTransition } from "react";
import type { Doc } from "@/lib/types";
import { getDocUrl } from "../actions";

export function DocLink({ doc }: { doc: Doc }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex items-center justify-between rounded-md border border-neutral-100 px-3 py-2 text-sm">
      <div>
        <button
          type="button"
          disabled={pending || !doc.storage_path}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              try {
                if (!doc.storage_path) return;
                const url = await getDocUrl(doc.storage_path);
                window.open(url, "_blank", "noopener,noreferrer");
              } catch (e) {
                setError(e instanceof Error ? e.message : "Could not open file");
              }
            });
          }}
          className="font-medium text-neutral-800 hover:underline disabled:cursor-not-allowed disabled:text-neutral-400"
        >
          {doc.title}
        </button>
        <span className="ml-2 rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] font-medium text-neutral-500">
          {doc.kind === "sow" ? "SOW" : "Quote"}
        </span>
        <div className="text-xs text-neutral-400">
          {doc.file_name}
          {pending && " · opening…"}
          {error && <span className="text-red-600"> · {error}</span>}
        </div>
      </div>
    </div>
  );
}
