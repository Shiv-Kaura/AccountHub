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
        <h1 className="text-2xl font-semibold text-neutral-900">{account.name}</h1>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
          {account.segment === "managed" ? "Managed" : "Prospect"}
        </span>
        {account.owner_name && (
          <span className="rounded-full bg-[#5b3a99]/10 px-2 py-0.5 text-xs font-medium text-[#3d1f6e]">
            {account.owner_name}
          </span>
        )}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs text-neutral-400 hover:text-neutral-900"
        >
          Edit
        </button>
        {error && <span className="text-xs text-red-600">{error}</span>}
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
        className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm font-semibold"
      />
      <select
        name="health"
        defaultValue={account.health}
        className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
      >
        <option value="green">On track</option>
        <option value="yellow">Watch</option>
        <option value="red">At risk</option>
      </select>
      <select
        name="segment"
        defaultValue={account.segment}
        className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
      >
        <option value="managed">Managed</option>
        <option value="prospect">Prospect</option>
      </select>
      <input
        name="ownerName"
        defaultValue={account.owner_name}
        placeholder="Owner (e.g. Shiv)"
        className="w-32 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
      />
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
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-50"
      >
        Cancel
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </form>
  );
}
