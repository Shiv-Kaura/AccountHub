import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Sow } from "@/lib/types";

export default async function SowsPage() {
  const supabase = await createClient();
  const { data: sows } = await supabase
    .from("sows")
    .select("*")
    .order("sow_date", { ascending: false });

  const sowList = (sows ?? []) as Sow[];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#f2f2f4]">SOW Generator</h1>
          <p className="mt-1 text-sm text-[#8c8f96]">Every statement of work that&rsquo;s been drafted.</p>
        </div>
        <Link
          href="/sows/new"
          className="rounded-md bg-gradient-to-b from-[#0496ff] to-[#006ba6] px-3 py-1.5 text-sm font-medium text-white hover:brightness-110"
        >
          + New SOW
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {sowList.map((s) => (
          <Link
            key={s.id}
            href={`/sows/${s.id}`}
            className="rounded-lg border border-white/[0.07] p-4 hover:border-white/[0.16] hover:shadow-sm"
          >
            <div className="font-medium text-[#f2f2f4]">{s.project_title}</div>
            <div className="text-xs text-[#5a5d64]">
              {s.customer} · {s.sow_date} · {s.stage}
            </div>
          </Link>
        ))}
        {sowList.length === 0 && (
          <p className="text-sm text-[#5a5d64]">No SOWs yet — create one above.</p>
        )}
      </div>
    </div>
  );
}
