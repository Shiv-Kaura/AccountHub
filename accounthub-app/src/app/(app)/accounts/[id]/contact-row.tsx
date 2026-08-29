"use client";

import { useState, useTransition } from "react";
import type { Contact } from "@/lib/types";
import { updateContact, deleteContact } from "../actions";

export function ContactRow({ accountId, contact }: { accountId: string; contact: Contact }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!editing) {
    return (
      <div className="flex items-start justify-between gap-2 rounded-md border border-neutral-100 px-3 py-2 text-sm">
        <div>
          <div className="font-medium text-neutral-800">
            {contact.name}
            {contact.role && <span className="ml-2 text-xs text-neutral-400">{contact.role}</span>}
          </div>
          <div className="text-xs text-neutral-400">
            {[contact.email, contact.phone].filter(Boolean).join(" · ")}
          </div>
          {error && <div className="text-xs text-red-600">{error}</div>}
        </div>
        <div className="flex shrink-0 gap-2">
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
              if (!confirm(`Remove ${contact.name} from contacts?`)) return;
              setError(null);
              startTransition(async () => {
                try {
                  await deleteContact(accountId, contact.id);
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
            await updateContact(accountId, contact.id, formData);
            setEditing(false);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Couldn't save");
          }
        });
      }}
      className="grid grid-cols-2 gap-2 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm"
    >
      <input
        name="name"
        defaultValue={contact.name}
        required
        className="col-span-2 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
      />
      <input
        name="role"
        defaultValue={contact.role}
        placeholder="Role"
        className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
      />
      <input
        name="email"
        defaultValue={contact.email}
        placeholder="Email"
        className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
      />
      <input
        name="phone"
        defaultValue={contact.phone}
        placeholder="Phone"
        className="col-span-2 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
      />
      {error && <div className="col-span-2 text-xs text-red-600">{error}</div>}
      <div className="col-span-2 flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
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
