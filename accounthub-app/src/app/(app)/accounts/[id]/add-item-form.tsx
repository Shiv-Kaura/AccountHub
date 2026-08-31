"use client";

import { useRef, useState, useTransition } from "react";
import { addItem } from "../actions";
import { showToast } from "@/lib/toast-client";

export function AddItemForm({ accountId }: { accountId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await addItem(accountId, formData);
            showToast("Priority item added");
            formRef.current?.reset();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Couldn't add item");
          }
        });
      }}
      className="mt-4 flex flex-col gap-2"
    >
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-1 min-w-[180px] flex-col gap-1">
          <label className="text-xs font-medium text-[#aeb1b8]">What needs attention</label>
          <input
            name="title"
            required
            placeholder="e.g. Awaiting signed BAA"
            className="rounded-md border border-white/[0.10] px-2 py-1.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#aeb1b8]">Owner</label>
          <input name="owner" className="w-28 rounded-md border border-white/[0.10] px-2 py-1.5 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#aeb1b8]">Due</label>
          <input name="dueDate" type="date" className="rounded-md border border-white/[0.10] px-2 py-1.5 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#aeb1b8]">Zendesk #</label>
          <input name="zendesk" className="w-24 rounded-md border border-white/[0.10] px-2 py-1.5 text-sm" />
        </div>
        <label className="flex items-center gap-1 pb-2 text-xs text-[#aeb1b8]">
          <input type="checkbox" name="priority" /> High
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-white/[0.10] px-3 py-1.5 text-sm hover:bg-white/[0.05] disabled:opacity-60"
        >
          {pending ? "Adding…" : "+ Add"}
        </button>
      </div>
      {error && <div className="text-xs text-[#ff5c8a]">{error}</div>}
    </form>
  );
}
