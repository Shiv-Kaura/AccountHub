"use client";

import { useState, useTransition } from "react";
import type { Site } from "@/lib/types";
import { updateSite, deleteSite } from "../actions";
import { showToast } from "@/lib/toast-client";
import { StageSelect } from "./stage-select";

export function SiteRow({ accountId, site }: { accountId: string; site: Site }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!editing) {
    return (
      <div className="flex items-center justify-between rounded-md border border-neutral-100 px-3 py-2">
        <div>
          <div className="text-sm font-medium text-neutral-800">{site.name}</div>
          <div className="text-xs text-neutral-400">{site.location}</div>
          {error && <div className="text-xs text-red-600">{error}</div>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StageSelect accountId={accountId} siteId={site.id} stage={site.stage} />
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-neutral-500 hover:text-neutral-900"
          >
            Edit
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!confirm(`Remove facility "${site.name}"?`)) return;
              setError(null);
              startTransition(async () => {
                try {
                  await deleteSite(accountId, site.id);
                  showToast(`Removed ${site.name}`);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Couldn't delete");
                }
              });
            }}
            className="text-xs text-red-600 hover:text-red-800 disabled:opacity-60"
          >
            {pending ? "…" : "Delete"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await updateSite(accountId, site.id, formData);
            setEditing(false);
            showToast("Facility saved");
          } catch (e) {
            setError(e instanceof Error ? e.message : "Couldn't save");
          }
        });
      }}
      className="flex flex-col gap-2 rounded-md border border-neutral-200 bg-neutral-50 p-3"
    >
      <input
        name="name"
        defaultValue={site.name}
        required
        className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
      />
      <input
        name="location"
        defaultValue={site.location}
        placeholder="City, State"
        className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
      />
      {error && <div className="text-xs text-red-600">{error}</div>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[#3d1f6e] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2d1650] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs hover:bg-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
