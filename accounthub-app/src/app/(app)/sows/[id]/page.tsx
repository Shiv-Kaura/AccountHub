import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Sow } from "@/lib/types";
import { DeleteSowButton } from "./delete-button";
import { SowStageSelect } from "./sow-stage-select";

export default async function SowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: sow } = await supabase.from("sows").select("*").eq("id", id).single();

  if (!sow) notFound();
  const s = sow as Sow;

  return (
    <div className="p-8">
      <Link href="/sows" className="text-sm text-neutral-400 hover:text-neutral-700">
        &larr; All SOWs
      </Link>

      <div className="mt-2 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">{s.project_title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            <span>{s.customer} · {s.sow_date}</span>
            <SowStageSelect id={s.id} stage={s.stage} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/sows/${s.id}/edit`}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
          >
            Edit
          </Link>
          <a
            href={`/sows/${s.id}/export`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-[#3d1f6e] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#2d1650]"
          >
            Export PDF
          </a>
          <DeleteSowButton id={s.id} />
        </div>
      </div>

      {(s.contact_name || s.contact_email_phone) && (
        <div className="mt-6 max-w-2xl">
          <div className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Contact
          </div>
          <p className="mt-1 text-sm text-neutral-700">
            {s.contact_name}
            {s.contact_email_phone && <span className="text-neutral-500"> — {s.contact_email_phone}</span>}
          </p>
        </div>
      )}

      <div className="mt-6 max-w-2xl">
        <div className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          Work summary
        </div>
        <p className="mt-1 text-sm leading-relaxed text-neutral-700">{s.work_summary}</p>
      </div>

      {s.work_details?.length > 0 && (
        <div className="mt-6 max-w-2xl">
          <div className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Work details
          </div>
          <ol className="mt-2 list-decimal pl-5 text-sm text-neutral-700">
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
          <div className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Meeting notes
          </div>
          <p className="mt-1 text-sm text-neutral-600">{s.meeting_notes}</p>
        </div>
      )}
    </div>
  );
}
