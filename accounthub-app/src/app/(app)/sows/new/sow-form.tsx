"use client";

import { useState, useTransition } from "react";
import { createSow, updateSow } from "../actions";
import { draftSow } from "./draft-actions";
import type { Account, Contact, Sow } from "@/lib/types";

export type AccountWithContacts = Pick<Account, "id" | "name" | "contact"> & {
  contacts: Pick<Contact, "id" | "name" | "role" | "email" | "phone">[];
};

function contactLabel(c: Pick<Contact, "name" | "role">) {
  return c.role ? `${c.name} — ${c.role}` : c.name;
}

function contactEmailPhone(c: Pick<Contact, "email" | "phone">) {
  return [c.email, c.phone].filter(Boolean).join(" / ");
}

export function SowForm({ accounts, sow }: { accounts: AccountWithContacts[]; sow?: Sow }) {
  const isEdit = Boolean(sow);
  const [accountId, setAccountId] = useState(sow?.account_id ?? "");
  const [customer, setCustomer] = useState(sow?.customer ?? "");
  const [contactName, setContactName] = useState(sow?.contact_name ?? "");
  const [contactEmailPhoneVal, setContactEmailPhoneVal] = useState(sow?.contact_email_phone ?? "");
  const [projectTitle, setProjectTitle] = useState(sow?.project_title ?? "");
  const [workSummary, setWorkSummary] = useState(sow?.work_summary ?? "");
  const [workDetailsText, setWorkDetailsText] = useState(sow?.work_details?.join("\n") ?? "");

  const [draftInput, setDraftInput] = useState("");
  const [draftError, setDraftError] = useState<string | null>(null);
  const [isDrafting, startDrafting] = useTransition();

  const selectedAccount = accounts.find((a) => a.id === accountId) || null;

  function handleDraft() {
    setDraftError(null);
    startDrafting(async () => {
      try {
        const draft = await draftSow(draftInput);
        if (!projectTitle) setProjectTitle(draft.projectTitle);
        setWorkSummary(draft.workSummary);
        setWorkDetailsText(draft.workDetails.join("\n"));
      } catch (err) {
        setDraftError(err instanceof Error ? err.message : "Couldn't generate a draft — try again.");
      }
    });
  }

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

  const action = isEdit ? updateSow.bind(null, sow!.id) : createSow;

  return (
    <form action={action} className="mt-6 flex max-w-2xl flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#aeb1b8]">Project title</label>
          <input
            name="projectTitle"
            required
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="e.g. RASLO - VetMed HL7 Integration"
            className="rounded-md border border-white/[0.10] px-3 py-1.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#aeb1b8]">Account</label>
          <select
            name="accountId"
            value={accountId}
            onChange={(e) => handleAccountChange(e.target.value)}
            className="rounded-md border border-white/[0.10] px-3 py-1.5 text-sm"
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
          <label className="text-xs font-medium text-[#aeb1b8]">Customer name</label>
          <input
            name="customer"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="rounded-md border border-white/[0.10] px-3 py-1.5 text-sm"
          />
          {selectedAccount && (
            <span className="text-[11px] text-[#5a5d64]">Auto-filled from {selectedAccount.name}</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#aeb1b8]">Address</label>
          <input
            name="address"
            defaultValue={sow?.address}
            className="rounded-md border border-white/[0.10] px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#aeb1b8]">Primary contact</label>
          <input
            name="contactName"
            value={contactName}
            onChange={(e) => handleContactPick(e.target.value)}
            list="sow-contact-dl"
            autoComplete="off"
            className="rounded-md border border-white/[0.10] px-3 py-1.5 text-sm"
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
            <span className="text-[11px] text-[#5a5d64]">
              Start typing to pick a saved contact from {selectedAccount.name} — email/phone fill in
              automatically.
            </span>
          ) : (
            <span className="text-[11px] text-[#5a5d64]">Link an account above to autofill from its saved contacts.</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#aeb1b8]">Contact email / phone</label>
          <input
            name="contactEmailPhone"
            value={contactEmailPhoneVal}
            onChange={(e) => setContactEmailPhoneVal(e.target.value)}
            className="rounded-md border border-white/[0.10] px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[#aeb1b8]">Meeting notes</label>
        <textarea
          name="meetingNotes"
          rows={3}
          defaultValue={sow?.meeting_notes}
          placeholder="What was discussed…"
          className="rounded-md border border-white/[0.10] px-3 py-1.5 text-sm"
        />
      </div>

      <div className="flex flex-col gap-2 rounded-md border border-[#8f2d56]/30 bg-[#8f2d56]/[0.12] p-3">
        <label className="text-xs font-medium text-[#f2f2f4]">
          Draft with Claude — describe the project in a sentence or two
        </label>
        <textarea
          value={draftInput}
          onChange={(e) => setDraftInput(e.target.value)}
          rows={2}
          placeholder="e.g. New HL7 interface with 6Radiology at their new facility"
          className="rounded-md border border-white/[0.12] bg-[#161618] px-3 py-1.5 text-sm"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDraft}
            disabled={isDrafting || !draftInput.trim()}
            className="self-start rounded-md bg-gradient-to-b from-[#b0447a] to-[#8f2d56] px-3 py-1.5 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50"
          >
            {isDrafting ? "Drafting…" : "Draft Work Summary & Details"}
          </button>
          {draftError && <span className="text-xs text-[#ff5c8a]">{draftError}</span>}
        </div>
        <span className="text-[11px] text-[#caa0b8]">
          Fills in the project title (if empty), work summary, and work details below — review and
          edit before saving.
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[#aeb1b8]">Work summary</label>
        <textarea
          name="workSummary"
          required
          rows={4}
          value={workSummary}
          onChange={(e) => setWorkSummary(e.target.value)}
          placeholder="2-4 sentences describing the overall scope, in professional SOW language."
          className="rounded-md border border-white/[0.10] px-3 py-1.5 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[#aeb1b8]">
          Work details (one action item per line)
        </label>
        <textarea
          name="workDetailsText"
          rows={6}
          value={workDetailsText}
          onChange={(e) => setWorkDetailsText(e.target.value)}
          placeholder={"Configure the HL7 interface between X and Y.\nBuild and validate HL7 message mapping."}
          className="rounded-md border border-white/[0.10] px-3 py-1.5 text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-[#aeb1b8]">
        <input type="checkbox" name="solutionsDiagram" defaultChecked={sow?.solutions_diagram} />
        Include a solutions diagram
      </label>

      <button
        type="submit"
        className="self-start rounded-md bg-gradient-to-b from-[#0496ff] to-[#006ba6] px-4 py-2 text-sm font-medium text-white hover:brightness-110"
      >
        {isEdit ? "Save changes" : "Create SOW"}
      </button>
    </form>
  );
}
