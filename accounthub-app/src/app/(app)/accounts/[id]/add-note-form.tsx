"use client";

import { useRef, useState, useTransition } from "react";
import { addNote } from "../actions";
import { showToast } from "@/lib/toast-client";

export function AddNoteForm({ accountId }: { accountId: string }) {
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
            await addNote(accountId, formData);
            showToast("Note added");
            formRef.current?.reset();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Couldn't add note");
          }
        });
      }}
      className="flex flex-col gap-2"
    >
      <div className="flex gap-2">
        <textarea
          name="body"
          placeholder="What happened, what's next…"
          required
          className="flex-1 rounded-md border border-white/[0.10] px-2 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-md border border-white/[0.10] px-3 py-1.5 text-sm hover:bg-white/[0.05] disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add"}
        </button>
      </div>
      {error && <div className="text-xs text-[#ff5c8a]">{error}</div>}
    </form>
  );
}
