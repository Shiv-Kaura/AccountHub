import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Sow } from "@/lib/types";
import { stageAccentHex } from "@/lib/ui";
import { GlassBanner, BannerActionLink } from "../glass-banner";

export default async function SowsPage() {
  const supabase = await createClient();
  const { data: sows } = await supabase
    .from("sows")
    .select("*")
    .order("sow_date", { ascending: false });

  const sowList = (sows ?? []) as Sow[];

  return (
    <div className="relative min-h-screen">
      <GlassBanner title="SOW Generator" actions={<BannerActionLink href="/sows/new">+ New SOW</BannerActionLink>} />

      <div className="p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#f7f7f8]">SOW Generator</h1>
            <p className="mt-1 text-sm text-[#8c8f96]">Every statement of work that&rsquo;s been drafted.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {sowList.map((s) => (
            <Link
              key={s.id}
              href={`/sows/${s.id}`}
              className={`relative overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#1c1c1e] p-4 pl-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors hover:bg-[#232326] ${s.lost ? "opacity-60" : ""}`}
            >
              <span
                className="absolute inset-y-0 left-0 w-[3px]"
                style={{ background: s.lost ? "#d81159" : stageAccentHex(s.stage) }}
              />
              <div className={`font-medium ${s.lost ? "text-[#b3b5bc] line-through decoration-[#d81159]/40" : "text-[#f2f2f4]"}`}>
                {s.project_title}
              </div>
              <div className="text-xs text-[#5a5d64]">
                {s.customer} · {s.sow_date} · {s.lost ? <span className="font-bold uppercase tracking-wide text-[#e8577f]">Lost</span> : s.stage}
              </div>
            </Link>
          ))}
          {sowList.length === 0 && (
            <p className="text-sm text-[#5a5d64]">No SOWs yet — create one above.</p>
          )}
        </div>
      </div>
    </div>
  );
}
