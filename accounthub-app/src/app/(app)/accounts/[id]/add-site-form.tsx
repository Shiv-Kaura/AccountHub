"use client";

import { useRef, useState, useTransition } from "react";
import { addSite } from "../actions";
import { showToast } from "@/lib/toast-client";

export function AddSiteForm({ accountId }: { accountId: string }) {
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
            await addSite(accountId, formData);
            showToast("Facility added");
            formRef.current?.reset();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Couldn't add facility");
          }
        });
      }}
      className="mt-4 flex flex-col gap-2"
    >
      <div className="flex gap-2">
        <input
          name="name"
          placeholder="Facility name"
          required
          className="flex-1 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
        />
        <input
          name="location"
          placeholder="City, State"
          className="w-32 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-60"
        >
          {pending ? "Adding…" : "+ Add"}
        </button>
      </div>
      {error && <div className="text-xs text-red-600">{error}</div>}
    </form>
  );
}
