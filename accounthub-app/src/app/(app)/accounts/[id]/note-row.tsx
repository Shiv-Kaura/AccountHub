"use client";

import { useState, useTransition } from "react";
import type { AccountNote } from "@/lib/types";
import { updateNote, deleteNote } from "../actions";
import { showToast } from "@/lib/toast-client";

export function NoteRow({ accountId, note }: { accountId: string; note: AccountNote }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!editing) {
    return (
      <div className="rounded-md border border-neutral-100 px-3 py-2 text-sm">
        <div className="flex items-center justify-between">
          <div className="text-xs text-neutral-400">{note.note_date}</div>
          <div className="flex gap-2">
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
                if (!confirm("Delete this note?")) return;
                setError(null);
                startTransition(async () => {
                  try {
                    await deleteNote(accountId, note.id);
                    showToast("Note deleted");
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
        <div className="text-neutral-700">{note.body}</div>
        {error && <div className="text-xs text-red-600">{error}</div>}
      </div>
    );
  }

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await updateNote(accountId, note.id, formData);
            setEditing(false);
            showToast("Note saved");
          } catch (e) {
            setError(e instanceof Error ? e.message : "Couldn't save");
          }
        });
      }}
      className="flex flex-col gap-2 rounded-md border border-neutral-200 bg-neutral-50 p-3"
    >
      <textarea
        name="body"
        defaultValue={note.body}
        required
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
