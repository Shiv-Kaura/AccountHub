"use client";

import { useMemo, useState } from "react";
import { RATE_CARD, formatPrice, poRowFor, type PoRow } from "@/lib/rate-card";
import { createQuote, updateQuote } from "../actions";
import type { Account, Contact, Quote } from "@/lib/types";

export type AccountWithContacts = Pick<Account, "id" | "name" | "contact"> & {
  contacts: Pick<Contact, "id" | "name" | "role" | "email" | "phone">[];
};

function contactLabel(c: Pick<Contact, "name" | "role">) {
  return c.role ? `${c.name} — ${c.role}` : c.name;
}

function contactEmailPhone(c: Pick<Contact, "email" | "phone">) {
  return [c.email, c.phone].filter(Boolean).join(" / ");
}

function rateSelToQty(rateSel: Quote["rate_sel"] | undefined): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, v] of Object.entries(rateSel || {})) {
    if (v?.checked) out[key] = v.qty;
  }
  return out;
}

export function QuoteForm({ accounts, quote }: { accounts: AccountWithContacts[]; quote?: Quote }) {
  const isEdit = Boolean(quote);
  const [selected, setSelected] = useState<Record<string, number>>(() => rateSelToQty(quote?.rate_sel));
  const [accountId, setAccountId] = useState(quote?.account_id ?? "");
  const [customer, setCustomer] = useState(quote?.customer ?? "");
  const [synthesisContact, setSynthesisContact] = useState(quote?.synthesis_contact ?? "Shiv Kaura");
  const [synthesisEmailPhone, setSynthesisEmailPhone] = useState(quote?.synthesis_email_phone ?? "");
  const [customerContact, setCustomerContact] = useState(quote?.customer_contact ?? "");
  const [customerEmailPhone, setCustomerEmailPhone] = useState(quote?.customer_email_phone ?? "");

  const selectedAccount = accounts.find((a) => a.id === accountId) || null;

  function handleAccountChange(id: string) {
    setAccountId(id);
    const acc = accounts.find((a) => a.id === id) || null;
    if (acc) {
      setCustomer(acc.name);
      // If the account has exactly one saved contact, auto-fill it — otherwise leave the
      // customer-contact fields for the picker below.
      if (acc.contacts.length === 1) {
        setCustomerContact(acc.contacts[0].name);
        setCustomerEmailPhone(contactEmailPhone(acc.contacts[0]));
      }
    }
  }

  function handleCustomerContactPick(name: string) {
    setCustomerContact(name);
    const match = selectedAccount?.contacts.find((c) => c.name === name);
    if (match) setCustomerEmailPhone(contactEmailPhone(match));
  }

  const poRows: PoRow[] = useMemo(() => {
    return RATE_CARD.filter((item) => selected[item.key] > 0).map((item) =>
      poRowFor(item, selected[item.key])
    );
  }, [selected]);

  const rateSel = useMemo(() => {
    const out: Record<string, { checked: boolean; qty: number }> = {};
    for (const [key, qty] of Object.entries(selected)) {
      if (qty > 0) out[key] = { checked: true, qty };
    }
    return out;
  }, [selected]);

  const total = poRows.reduce((sum, r) => {
    const n = Number(String(r.price).replace(/[^0-9.-]/g, ""));
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  const action = isEdit ? updateQuote.bind(null, quote!.id) : createQuote;

  return (
    <form action={action} className="mt-6 flex flex-col gap-6">
      <input type="hidden" name="rateSelJson" value={JSON.stringify(rateSel)} />
      <input type="hidden" name="poRowsJson" value={JSON.stringify(poRows)} />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">Deal / project name</label>
          <input
            name="name"
            required
            defaultValue={quote?.name}
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
          <label className="text-xs font-medium text-neutral-600">Exhibit label</label>
          <input
            name="exhibitLabel"
            defaultValue={quote?.exhibit_label}
            placeholder="e.g. A-1"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">Synthesis contact</label>
          <input
            name="synthesisContact"
            value={synthesisContact}
            onChange={(e) => setSynthesisContact(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">Synthesis email / phone</label>
          <input
            name="synthesisEmailPhone"
            value={synthesisEmailPhone}
            onChange={(e) => setSynthesisEmailPhone(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">Customer contact</label>
          <input
            name="customerContact"
            value={customerContact}
            onChange={(e) => handleCustomerContactPick(e.target.value)}
            list="quote-contact-dl"
            autoComplete="off"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
          {selectedAccount && (
            <datalist id="quote-contact-dl">
              {selectedAccount.contacts.map((c) => (
                <option key={c.id} value={c.name}>
                  {contactLabel(c)}
                </option>
              ))}
            </datalist>
          )}
          {selectedAccount && selectedAccount.contacts.length > 0 && (
            <span className="text-[11px] text-neutral-400">
              Start typing to pick a saved contact from {selectedAccount.name} — email/phone fill in
              automatically.
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">Customer email / phone</label>
          <input
            name="customerEmailPhone"
            value={customerEmailPhone}
            onChange={(e) => setCustomerEmailPhone(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-neutral-600">
          Implementation items (one per line)
        </label>
        <textarea
          name="implementationItems"
          rows={3}
          defaultValue={quote?.implementation_items?.join("\n")}
          placeholder="Additional HL7 Interface with VetMed"
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
        />
      </div>

      <div>
        <div className="text-xs font-medium text-neutral-600">Rate card</div>
        <div className="mt-2 flex flex-col divide-y divide-neutral-100 rounded-md border border-neutral-200">
          {RATE_CARD.map((item) => {
            const qty = selected[item.key] ?? 0;
            const checked = qty > 0;
            return (
              <label
                key={item.key}
                className="flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-neutral-50"
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      setSelected((s) => ({ ...s, [item.key]: e.target.checked ? 1 : 0 }))
                    }
                  />
                  {item.label}
                  <span className="text-xs text-neutral-400">
                    {formatPrice(item.price)} {item.unit}
                  </span>
                </span>
                {checked && item.needsQty && (
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) =>
                      setSelected((s) => ({ ...s, [item.key]: Number(e.target.value) || 1 }))
                    }
                    className="w-20 rounded border border-neutral-300 px-2 py-1 text-xs"
                    aria-label={item.qtyLabel}
                  />
                )}
              </label>
            );
          })}
        </div>
      </div>

      {poRows.length > 0 && (
        <div>
          <div className="text-xs font-medium text-neutral-600">Purchase order lines</div>
          <table className="mt-2 w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-neutral-400">
                <th className="py-1 pr-2">Qty</th>
                <th className="py-1 pr-2">Item</th>
                <th className="py-1 pr-2">Price</th>
                <th className="py-1">Due</th>
              </tr>
            </thead>
            <tbody>
              {poRows.map((r, i) => (
                <tr key={i} className="border-t border-neutral-100">
                  <td className="py-1 pr-2">{r.qty}</td>
                  <td className="py-1 pr-2">{r.item}</td>
                  <td className="py-1 pr-2 font-medium">{r.price}</td>
                  <td className="py-1 text-neutral-400">{r.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 text-right text-sm font-semibold text-neutral-900">
            Total: {formatPrice(total)}
          </div>
        </div>
      )}

      <button
        type="submit"
        className="self-start rounded-md bg-[#3d1f6e] px-4 py-2 text-sm font-medium text-white hover:bg-[#2d1650]"
      >
        {isEdit ? "Save changes" : "Create quote"}
      </button>
    </form>
  );
}
