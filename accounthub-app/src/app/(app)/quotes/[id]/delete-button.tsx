"use client";

import { useTransition } from "react";
import { deleteQuote } from "../actions";

export function DeleteQuoteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this quote? This can't be undone.")) return;
        startTransition(() => {
          deleteQuote(id);
        });
      }}
      className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
