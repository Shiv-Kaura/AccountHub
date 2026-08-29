"use client";

import { useState, useTransition } from "react";
import type { Item } from "@/lib/types";
import { ITEM_STATUSES, ITEM_STATUS_LABEL } from "@/lib/types";
import { itemStatusPillClass, isOverdue } from "@/lib/ui";
import { updateItem, deleteItem, setItemStatus } from "../actions";
import { showToast } from "@/lib/toast-client";

export function ItemRow({ accountId, item }: { accountId: string; item: Item }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!editing) {
    return (
      <div className="flex items-start justify-between gap-2 rounded-md border border-white/[0.05] px-3 py-2 text-sm">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <select
              defaultValue={item.status}
              disabled={pending}
              onChange={(e) => {
                setError(null);
                startTransition(async () => {
                  try {
                    await setItemStatus(accountId, item.id, e.target.value);
                    showToast("Status updated");
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Couldn't update");
                  }
                });
              }}
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${itemStatusPillClass(item.status)} disabled:opacity-60`}
            >
              {ITEM_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {ITEM_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            {item.priority && (
              <span className="rounded-full bg-[#d81159]/[0.12] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#ff5c8a] ring-1 ring-[#d81159]/30">
                High
              </span>
            )}
            <span className="font-medium text-[#e5e6ea]">{item.title}</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-[#5a5d64]">
            {item.owner && <span>{item.owner}</span>}
            {item.due_date && (
              <span className={isOverdue(item.due_date) && item.status !== "resolved" ? "font-medium text-[#ff5c8a]" : ""}>
                due {item.due_date}
              </span>
            )}
            {item.zendesk && <span className="rounded bg-white/[0.06] px-1.5 py-0.5">#{item.zendesk}</span>}
          </div>
          {error && <div className="text-xs text-[#ff5c8a]">{error}</div>}
        </div>
        <div className="flex shrink-0 gap-2">
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
              if (!confirm(`Delete "${item.title}"?`)) return;
              setError(null);
              startTransition(async () => {
                try {
                  await deleteItem(accountId, item.id);
                  showToast(`Deleted "${item.title}"`);
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
    );
  }

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await updateItem(accountId, item.id, formData);
            setEditing(false);
            showToast("Item saved");
          } catch (e) {
            setError(e instanceof Error ? e.message : "Couldn't save");
          }
        });
      }}
      className="flex flex-col gap-2 rounded-md border border-white/[0.07] bg-white/[0.03] p-3 text-sm"
    >
      <input
        name="title"
        defaultValue={item.title}
        required
        className="rounded-md border border-white/[0.10] px-2 py-1.5 text-sm"
      />
      <div className="grid grid-cols-3 gap-2">
        <select
          name="status"
          defaultValue={item.status}
          className="rounded-md border border-white/[0.10] px-2 py-1.5 text-sm"
        >
          {ITEM_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ITEM_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <input
          name="owner"
          defaultValue={item.owner}
          placeholder="Owner"
          className="rounded-md border border-white/[0.10] px-2 py-1.5 text-sm"
        />
        <input
          name="dueDate"
          type="date"
          defaultValue={item.due_date ?? ""}
          className="rounded-md border border-white/[0.10] px-2 py-1.5 text-sm"
        />
      </div>
      <div className="flex items-center gap-3">
        <input
          name="zendesk"
          defaultValue={item.zendesk}
          placeholder="Zendesk ticket #"
          className="flex-1 rounded-md border border-white/[0.10] px-2 py-1.5 text-sm"
        />
        <label className="flex items-center gap-1 text-xs text-[#aeb1b8]">
          <input type="checkbox" name="priority" defaultChecked={item.priority} />
          High priority
        </label>
      </div>
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
