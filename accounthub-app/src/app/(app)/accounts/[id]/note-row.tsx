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
      <div className="rounded-md border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm">
        <div className="flex items-center justify-between">
          <div className="text-xs text-[#5a5d64]">{note.note_date}</div>
          <div className="flex gap-2">
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
              className="text-xs text-[#ff5c8a] hover:text-[#ff8fae] disabled:opacity-60"
            >
              {pending ? "…" : "Delete"}
            </button>
          </div>
        </div>
        <div className="text-[#c7c9d0]">{note.body}</div>
        {error && <div className="text-xs text-[#ff5c8a]">{error}</div>}
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
      className="flex flex-col gap-2 rounded-md border border-white/[0.07] bg-white/[0.03] p-3"
    >
      <textarea
        name="body"
        defaultValue={note.body}
        required
        className="rounded-md border border-white/[0.10] px-2 py-1.5 text-sm"
      />
      {error && <div className="text-xs text-[#ff5c8a]">{error}</div>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gradient-to-b from-[#0496ff] to-[#006ba6] px-3 py-1.5 text-xs font-medium text-white hover:brightness-110 disabled:opacity-60"
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
