import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { healthDotClass } from "@/lib/ui";
import { createAccount } from "./actions";
import type { Account } from "@/lib/types";
import { GlassBanner } from "../glass-banner";

export default async function AccountsPage() {
  const supabase = await createClient();
  const { data: accounts, error } = await supabase
    .from("accounts")
    .select("*")
    .order("name") as { data: Account[] | null; error: { message: string } | null };

  return (
    <div className="relative min-h-screen">
      <GlassBanner title="Facility Groups" />

      <div className="p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#f7f7f8]">Accounts / Facility Groups</h1>
            <p className="mt-1 text-sm text-[#8c8f96]">
              Every account and facility group you manage, one place.
            </p>
          </div>
        </div>

        <form action={createAccount} className="mt-6 flex items-end gap-2 rounded-[14px] border border-white/[0.06] bg-[#161618] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_2px_6px_rgba(0,0,0,0.3),0_10px_24px_rgba(0,0,0,0.22)]">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#aeb1b8]">New account name</label>
            <input
              name="name"
              required
              placeholder="e.g. Legacy Radiology Partners"
              className="w-72 rounded-md border border-white/[0.10] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0496ff]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#aeb1b8]">Segment</label>
            <select
              name="segment"
              className="rounded-md border border-white/[0.10] px-3 py-1.5 text-sm"
            >
              <option value="managed">Managed</option>
              <option value="prospect">Prospect</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#aeb1b8]">Owner</label>
            <input
              name="ownerName"
              placeholder="e.g. Shiv"
              className="w-32 rounded-md border border-white/[0.10] px-3 py-1.5 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-b from-[#0496ff] to-[#006ba6] px-3.5 py-1.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_4px_16px_rgba(4,150,255,0.4)]"
          >
            + New account/group
          </button>
        </form>

        {error && <p className="mt-6 text-sm text-[#ff5c8a]">{error.message}</p>}

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(accounts ?? []).map((a) => (
            <Link
              key={a.id}
              href={`/accounts/${a.id}`}
              className="rounded-[14px] border border-white/[0.06] bg-[#161618] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_2px_6px_rgba(0,0,0,0.3),0_10px_24px_rgba(0,0,0,0.22)] transition-shadow hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_2px_6px_rgba(0,0,0,0.3),0_10px_24px_rgba(4,150,255,0.14)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-[#5a5d64]">
                    {a.segment === "managed" ? "Managed" : "Prospect"}
                    {a.owner_name && ` · ${a.owner_name}`}
                  </div>
                  <div className="mt-0.5 font-medium text-[#f2f2f4]">{a.name}</div>
                </div>
                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${healthDotClass(a.health)}`} />
              </div>
            </Link>
          ))}
          {accounts?.length === 0 && (
            <p className="text-sm text-[#5a5d64]">No accounts yet — add one above.</p>
          )}
        </div>
      </div>
    </div>
  );
}
