import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { healthDotClass } from "@/lib/ui";
import { createAccount } from "./actions";
import type { Account } from "@/lib/types";

export default async function AccountsPage() {
  const supabase = await createClient();
  const { data: accounts, error } = await supabase
    .from("accounts")
    .select("*")
    .order("name") as { data: Account[] | null; error: { message: string } | null };

  return (
    <div className="p-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Accounts / Facility Groups</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Every account and facility group you manage, one place.
          </p>
        </div>
      </div>

      <form action={createAccount} className="mt-6 flex items-end gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">New account name</label>
          <input
            name="name"
            required
            placeholder="e.g. Legacy Radiology Partners"
            className="w-72 rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b3a99]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">Segment</label>
          <select
            name="segment"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          >
            <option value="managed">Managed</option>
            <option value="deal">Deal</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-[#3d1f6e] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#2d1650]"
        >
          + New account/group
        </button>
      </form>

      {error && <p className="mt-6 text-sm text-red-600">{error.message}</p>}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(accounts ?? []).map((a) => (
          <Link
            key={a.id}
            href={`/accounts/${a.id}`}
            className="rounded-lg border border-neutral-200 p-4 transition hover:border-neutral-300 hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-neutral-400">
                  {a.segment === "managed" ? "Managed" : "Deal"}
                </div>
                <div className="mt-0.5 font-medium text-neutral-900">{a.name}</div>
              </div>
              <span className={`mt-1 h-2.5 w-2.5 rounded-full ${healthDotClass(a.health)}`} />
            </div>
          </Link>
        ))}
        {accounts?.length === 0 && (
          <p className="text-sm text-neutral-400">No accounts yet — add one above.</p>
        )}
      </div>
    </div>
  );
}
