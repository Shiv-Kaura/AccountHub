"use client";

import { useRef, useState, useTransition } from "react";
import { addContact } from "../actions";
import { showToast } from "@/lib/toast-client";

export function AddContactForm({ accountId }: { accountId: string }) {
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
            await addContact(accountId, formData);
            showToast("Contact added");
            formRef.current?.reset();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Couldn't add contact");
          }
        });
      }}
      className="mt-4 grid grid-cols-2 gap-2"
    >
      <input
        name="name"
        placeholder="Full name"
        required
        className="col-span-2 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
      />
      <input
        name="email"
        placeholder="Email"
        className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
      />
      <input
        name="phone"
        placeholder="Phone"
        className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
      />
      {error && <div className="col-span-2 text-xs text-red-600">{error}</div>}
      <button
        type="submit"
        disabled={pending}
        className="col-span-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-60"
      >
        {pending ? "Adding…" : "+ Add contact"}
      </button>
    </form>
  );
}
