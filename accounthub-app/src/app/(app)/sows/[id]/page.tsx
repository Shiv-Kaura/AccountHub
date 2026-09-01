import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Sow } from "@/lib/types";
import { DeleteSowButton } from "./delete-button";
import { SowStageSelect } from "./sow-stage-select";
import { markSowLost } from "../actions";
import { LostToggle, LostBadge } from "../../lost-toggle";
import { GlassBanner } from "../../glass-banner";

export default async function SowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: sow } = await supabase.from("sows").select("*").eq("id", id).single();

  if (!sow) notFound();
  const s = sow as Sow;

  return (
    <div className="relative min-h-screen">
      <GlassBanner crumb="SOW Generator" title={s.project_title} showSearch={false} />

      <div className="p-8">
      <Link href="/sows" className="text-sm text-[#5a5d64] hover:text-[#c7c9d0]">
        &larr; All SOWs
      </Link>

      <div className="mt-2 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-[#f2f2f4]">{s.project_title}</h1>
            {s.lost && <LostBadge />}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#8c8f96]">
            <span>{s.customer} · {s.sow_date}</span>
            <SowStageSelect id={s.id} stage={s.stage} />
            <LostToggle lost={s.lost} itemLabel={s.project_title} onToggle={(next) => markSowLost(s.id, next)} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/sows/${s.id}/edit`}
            className="rounded-md border border-white/[0.10] px-3 py-1.5 text-sm hover:bg-white/[0.05]"
          >
            Edit
          </Link>
          <a
            href={`/sows/${s.id}/export`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-[#0496ff] px-3 py-1.5 text-sm font-medium text-white hover:brightness-110 active:brightness-90 active:scale-[0.98] transition"
          >
            Export PDF
          </a>
          <DeleteSowButton id={s.id} />
        </div>
      </div>

      <div className="mt-6 rounded-[14px] border border-white/[0.06] bg-[#1c1c1e] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        {(s.contact_name || s.contact_email_phone) && (
          <div className="max-w-2xl">
            <div className="text-xs font-medium uppercase tracking-wide text-[#5a5d64]">
              Contact
            </div>
            <p className="mt-1 text-sm text-[#c7c9d0]">
              {s.contact_name}
              {s.contact_email_phone && <span className="text-[#8c8f96]"> — {s.contact_email_phone}</span>}
            </p>
          </div>
        )}

        <div className="mt-6 max-w-2xl first:mt-0">
          <div className="text-xs font-medium uppercase tracking-wide text-[#5a5d64]">
            Work summary
          </div>
          <p className="mt-1 text-sm leading-relaxed text-[#c7c9d0]">{s.work_summary}</p>
        </div>

        {s.work_details?.length > 0 && (
          <div className="mt-6 max-w-2xl">
            <div className="text-xs font-medium uppercase tracking-wide text-[#5a5d64]">
              Work details
            </div>
            <ol className="mt-2 list-decimal pl-5 text-sm text-[#c7c9d0]">
              {s.work_details.map((d, i) => (
                <li key={i} className="py-0.5">
                  {d}
                </li>
              ))}
            </ol>
          </div>
        )}

        {s.meeting_notes && (
          <div className="mt-6 max-w-2xl">
            <div className="text-xs font-medium uppercase tracking-wide text-[#5a5d64]">
              Meeting notes
            </div>
            <p className="mt-1 text-sm text-[#aeb1b8]">{s.meeting_notes}</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
