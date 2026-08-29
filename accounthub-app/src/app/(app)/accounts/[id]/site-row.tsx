"use client";

import { useState, useTransition } from "react";
import type { Site } from "@/lib/types";
import { updateSite, deleteSite, markSiteLost } from "../actions";
import { showToast } from "@/lib/toast-client";
import { StageSelect } from "./stage-select";
import { LostToggle, LostBadge } from "../../lost-toggle";
import { stageAccentHex } from "@/lib/ui";

export function SiteRow({ accountId, site }: { accountId: string; site: Site }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!editing) {
    return (
      <div className="relative flex items-center justify-between overflow-hidden rounded-md border border-white/[0.05] bg-white/[0.02] py-2 pl-4 pr-3">
        <span
          className="absolute inset-y-0 left-0 w-[3px]"
          style={{ background: site.lost ? "#d81159" : stageAccentHex(site.stage) }}
        />
        <div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-[#e5e6ea]">{site.name}</div>
            {site.lost && <LostBadge />}
          </div>
          <div className="text-xs text-[#5a5d64]">{site.location}</div>
          {error && <div className="text-xs text-[#ff5c8a]">{error}</div>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StageSelect accountId={accountId} siteId={site.id} stage={site.stage} />
          <LostToggle
            lost={site.lost}
            itemLabel={site.name}
            onToggle={(next) => markSiteLost(accountId, site.id, next)}
          />
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-[#8c8f96] hover:text-[#f2f2f4]"
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
            className="text-xs text-[#ff5c8a] hover:text-[#ff8fae] disabled:opacity-60"
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
      className="flex flex-col gap-2 rounded-md border border-white/[0.07] bg-white/[0.03] p-3"
    >
      <input
        name="name"
        defaultValue={site.name}
        required
        className="rounded-md border border-white/[0.10] px-2 py-1.5 text-sm"
      />
      <input
        name="location"
        defaultValue={site.location}
        placeholder="City, State"
        className="rounded-md border border-white/[0.10] px-2 py-1.5 text-sm"
      />
      {error && <div className="text-xs text-[#ff5c8a]">{error}</div>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[#0496ff] px-3 py-1.5 text-xs font-medium text-white hover:brightness-110 active:brightness-90 active:scale-[0.98] transition disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-md border border-white/[0.10] px-3 py-1.5 text-xs hover:bg-white/[0.06]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
