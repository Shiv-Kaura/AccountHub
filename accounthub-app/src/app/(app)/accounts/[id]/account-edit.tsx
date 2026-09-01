"use client";

import { useState, useTransition } from "react";
import type { Account } from "@/lib/types";
import { healthDotClass } from "@/lib/ui";
import { updateAccount } from "../actions";
import { showToast } from "@/lib/toast-client";

export function AccountHeader({ account }: { account: Account }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!editing) {
    return (
      <div className="mt-2 flex items-center gap-3">
        <span className={`h-3 w-3 rounded-full ${healthDotClass(account.health)}`} />
        <h1 className="text-2xl font-semibold text-[#f2f2f4]">{account.name}</h1>
        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs font-medium text-[#8c8f96]">
          {account.segment === "managed" ? "Managed" : "Prospect"}
        </span>
        {account.owner_name && (
          <span className="rounded-full bg-[#0496ff]/[0.14] px-2 py-0.5 text-xs font-medium text-[#4fc3ff]">
            {account.owner_name}
          </span>
        )}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs text-[#5a5d64] hover:text-[#f2f2f4]"
        >
          Edit
        </button>
        {error && <span className="text-xs text-[#ff5c8a]">{error}</span>}
      </div>
    );
  }

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await updateAccount(account.id, formData);
            setEditing(false);
            showToast("Account saved");
          } catch (e) {
            setError(e instanceof Error ? e.message : "Couldn't save");
          }
        });
      }}
      className="mt-2 flex flex-wrap items-center gap-2"
    >
      <input
        name="name"
        defaultValue={account.name}
        required
        className="rounded-md border border-white/[0.10] px-2 py-1.5 text-sm font-semibold"
      />
      <select
        name="health"
        defaultValue={account.health}
        className="rounded-md border border-white/[0.10] px-2 py-1.5 text-sm"
      >
        <option value="green">On track</option>
        <option value="yellow">Watch</option>
        <option value="red">At risk</option>
      </select>
      <select
        name="segment"
        defaultValue={account.segment}
        className="rounded-md border border-white/[0.10] px-2 py-1.5 text-sm"
      >
        <option value="managed">Managed</option>
        <option value="prospect">Prospect</option>
      </select>
      <input
        name="ownerName"
        defaultValue={account.owner_name}
        placeholder="Owner (e.g. Shiv)"
        className="w-32 rounded-md border border-white/[0.10] px-2 py-1.5 text-sm"
      />
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
        className="rounded-md border border-white/[0.10] px-3 py-1.5 text-xs hover:bg-white/[0.05]"
      >
        Cancel
      </button>
      {error && <span className="text-xs text-[#ff5c8a]">{error}</span>}
    </form>
  );
}
