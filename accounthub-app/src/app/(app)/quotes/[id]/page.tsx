import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Quote } from "@/lib/types";
import { formatPrice } from "@/lib/rate-card";
import { DeleteQuoteButton } from "./delete-button";
import { QuoteStageSelect } from "./quote-stage-select";
import { markQuoteLost } from "../actions";
import { LostToggle, LostBadge } from "../../lost-toggle";

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: quote } = await supabase.from("quotes").select("*").eq("id", id).single();

  if (!quote) notFound();
  const q = quote as Quote;

  const total = q.po_rows.reduce((sum, r) => {
    const n = Number(String(r.price).replace(/[^0-9.-]/g, ""));
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  return (
    <div className="p-8">
      <Link href="/quotes" className="text-sm text-[#5a5d64] hover:text-[#c7c9d0]">
        &larr; All quotes
      </Link>

      <div className="mt-2 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-[#f2f2f4]">{q.name}</h1>
            {q.lost && <LostBadge />}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#8c8f96]">
            <span>{q.customer} · {q.quote_date}</span>
            <QuoteStageSelect id={q.id} stage={q.stage} />
            {q.exhibit_label && <span>Exhibit {q.exhibit_label}</span>}
            <LostToggle lost={q.lost} itemLabel={q.name} onToggle={(next) => markQuoteLost(q.id, next)} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/quotes/${q.id}/edit`}
            className="rounded-md border border-white/[0.10] px-3 py-1.5 text-sm hover:bg-white/[0.05]"
          >
            Edit
          </Link>
          <a
            href={`/quotes/${q.id}/export`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-gradient-to-b from-[#0496ff] to-[#006ba6] px-3 py-1.5 text-sm font-medium text-white hover:brightness-110"
          >
            Export PDF
          </a>
          <DeleteQuoteButton id={q.id} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-[#5a5d64]">
            Synthesis contact
          </div>
          <div className="mt-1 text-[#e5e6ea]">{q.synthesis_contact || "—"}</div>
          <div className="text-[#8c8f96]">{q.synthesis_email_phone}</div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-[#5a5d64]">
            Customer contact
          </div>
          <div className="mt-1 text-[#e5e6ea]">{q.customer_contact || "—"}</div>
          <div className="text-[#8c8f96]">{q.customer_email_phone}</div>
        </div>
      </div>

      {q.implementation_items?.length > 0 && (
        <div className="mt-6">
          <div className="text-xs font-medium uppercase tracking-wide text-[#5a5d64]">
            Implementation items
          </div>
          <ul className="mt-2 list-disc pl-5 text-sm text-[#c7c9d0]">
            {q.implementation_items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {q.po_rows?.length > 0 && (
        <div className="mt-6">
          <div className="text-xs font-medium uppercase tracking-wide text-[#5a5d64]">
            Purchase order
          </div>
          <table className="mt-2 w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-[#5a5d64]">
                <th className="py-1 pr-2">Qty</th>
                <th className="py-1 pr-2">Item</th>
                <th className="py-1 pr-2">Price</th>
                <th className="py-1">Due</th>
              </tr>
            </thead>
            <tbody>
              {q.po_rows.map((r, i) => (
                <tr key={i} className="border-t border-white/[0.05]">
                  <td className="py-1 pr-2">{r.qty}</td>
                  <td className="py-1 pr-2">{r.item}</td>
                  <td className="py-1 pr-2 font-medium">{r.price}</td>
                  <td className="py-1 text-[#5a5d64]">{r.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 text-right text-sm font-semibold text-[#f2f2f4]">
            Total: {formatPrice(total)}
          </div>
        </div>
      )}
    </div>
  );
}
