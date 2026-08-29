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
          <h1 className="text-2xl font-semibold text-neutral-900">SOW Generator</h1>
          <p className="mt-1 text-sm text-neutral-500">Every statement of work that&rsquo;s been drafted.</p>
        </div>
        <Link
          href="/sows/new"
          className="rounded-md bg-[#3d1f6e] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#2d1650]"
        >
          + New SOW
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {sowList.map((s) => (
          <Link
            key={s.id}
            href={`/sows/${s.id}`}
            className="rounded-lg border border-neutral-200 p-4 hover:border-neutral-300 hover:shadow-sm"
          >
            <div className="font-medium text-neutral-900">{s.project_title}</div>
            <div className="text-xs text-neutral-400">
              {s.customer} · {s.sow_date} · {s.stage}
            </div>
          </Link>
        ))}
        {sowList.length === 0 && (
          <p className="text-sm text-neutral-400">No SOWs yet — create one above.</p>
        )}
      </div>
    </div>
  );
}
