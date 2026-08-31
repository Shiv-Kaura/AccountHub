"use client";

import { useTransition } from "react";
import { deleteSow } from "../actions";

export function DeleteSowButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this SOW? This can't be undone.")) return;
        startTransition(() => {
          deleteSow(id);
        });
      }}
      className="rounded-md border border-white/[0.10] px-3 py-1.5 text-sm text-[#ff5c8a] hover:bg-[#d81159]/[0.16] disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
