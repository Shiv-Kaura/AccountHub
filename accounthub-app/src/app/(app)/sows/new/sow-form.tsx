"use client";

import { useState } from "react";
import { createSow } from "../actions";
import type { Account, Contact } from "@/lib/types";

export type AccountWithContacts = Pick<Account, "id" | "name" | "contact"> & {
  contacts: Pick<Contact, "id" | "name" | "role" | "email" | "phone">[];
};

function contactLabel(c: Pick<Contact, "name" | "role">) {
  return c.role ? `${c.name} — ${c.role}` : c.name;
}

function contactEmailPhone(c: Pick<Contact, "email" | "phone">) {
  return [c.email, c.phone].filter(Boolean).join(" / ");
}

export function SowForm({ accounts }: { accounts: AccountWithContacts[] }) {
  const [accountId, setAccountId] = useState("");
  const [customer, setCustomer] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmailPhoneVal, setContactEmailPhoneVal] = useState("");

  const selectedAccount = accounts.find((a) => a.id === accountId) || null;

  function handleAccountChange(id: string) {
    setAccountId(id);
    const acc = accounts.find((a) => a.id === id) || null;
    if (acc) {
      setCustomer(acc.name);
      if (acc.contacts.length === 1) {
        setContactName(acc.contacts[0].name);
        setContactEmailPhoneVal(contactEmailPhone(acc.contacts[0]));
      }
    }
  }

  function handleContactPick(name: string) {
    setContactName(name);
    const match = selectedAccount?.contacts.find((c) => c.name === name);
    if (match) setContactEmailPhoneVal(contactEmailPhone(match));
  }

  return (
    <form action={createSow} className="mt-6 flex max-w-2xl flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">Project title</label>
          <input
            name="projectTitle"
            required
            placeholder="e.g. RASLO - VetMed HL7 Integration"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">Account</label>
          <select
            name="accountId"
            value={accountId}
            onChange={(e) => handleAccountChange(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          >
            <option value="">No account</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">Customer name</label>
          <input
            name="customer"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
          {selectedAccount && (
            <span className="text-[11px] text-neutral-400">Auto-filled from {selectedAccount.name}</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">Address</label>
          <input name="address" className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">Primary contact</label>
          <input
            name="contactName"
            value={contactName}
            onChange={(e) => handleContactPick(e.target.value)}
            list="sow-contact-dl"
            autoComplete="off"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
          {selectedAccount && (
            <datalist id="sow-contact-dl">
              {selectedAccount.contacts.map((c) => (
                <option key={c.id} value={c.name}>
                  {contactLabel(c)}
                </option>
              ))}
            </datalist>
          )}
          {selectedAccount && selectedAccount.contacts.length > 0 ? (
            <span className="text-[11px] text-neutral-400">
              Start typing to pick a saved contact from {selectedAccount.name} — email/phone fill in
              automatically.
            </span>
          ) : (
            <span className="text-[11px] text-neutral-400">Link an account above to autofill from its saved contacts.</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">Contact email / phone</label>
          <input
            name="contactEmailPhone"
            value={contactEmailPhoneVal}
            onChange={(e) => setContactEmailPhoneVal(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-neutral-600">Meeting notes</label>
        <textarea
          name="meetingNotes"
          rows={3}
          placeholder="What was discussed…"
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-neutral-600">Work summary</label>
        <textarea
          name="workSummary"
          required
          rows={4}
          placeholder="2-4 sentences describing the overall scope, in professional SOW language."
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-neutral-600">
          Work details (one action item per line)
        </label>
        <textarea
          name="workDetailsText"
          rows={6}
          placeholder={"Configure the HL7 interface between X and Y.\nBuild and validate HL7 message mapping."}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-600">
        <input type="checkbox" name="solutionsDiagram" />
        Include a solutions diagram
      </label>

      <button
        type="submit"
        className="self-start rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
      >
        Create SOW
      </button>
    </form>
  );
}
