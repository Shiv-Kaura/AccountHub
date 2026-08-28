import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Quote } from "@/lib/types";
import { formatPrice } from "@/lib/rate-card";
import { DeleteQuoteButton } from "./delete-button";

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
      <Link href="/quotes" className="text-sm text-neutral-400 hover:text-neutral-700">
        &larr; All quotes
      </Link>

      <div className="mt-2 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">{q.name}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {q.customer} · {q.quote_date} · {q.stage}
            {q.exhibit_label && ` · Exhibit ${q.exhibit_label}`}
          </p>
        </div>
        <DeleteQuoteButton id={q.id} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Synthesis contact
          </div>
          <div className="mt-1 text-neutral-800">{q.synthesis_contact || "—"}</div>
          <div className="text-neutral-500">{q.synthesis_email_phone}</div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Customer contact
          </div>
          <div className="mt-1 text-neutral-800">{q.customer_contact || "—"}</div>
          <div className="text-neutral-500">{q.customer_email_phone}</div>
        </div>
      </div>

      {q.implementation_items?.length > 0 && (
        <div className="mt-6">
          <div className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Implementation items
          </div>
          <ul className="mt-2 list-disc pl-5 text-sm text-neutral-700">
            {q.implementation_items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {q.po_rows?.length > 0 && (
        <div className="mt-6">
          <div className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Purchase order
          </div>
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
              {q.po_rows.map((r, i) => (
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
    </div>
  );
}
