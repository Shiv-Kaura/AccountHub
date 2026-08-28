import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Quote } from "@/lib/types";
import { formatPrice } from "@/lib/rate-card";

export default async function QuotesPage() {
  const supabase = await createClient();
  const { data: quotes } = await supabase
    .from("quotes")
    .select("*")
    .order("quote_date", { ascending: false });

  const quoteList = (quotes ?? []) as Quote[];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Quote Generator</h1>
          <p className="mt-1 text-sm text-neutral-500">Every quote that&rsquo;s been drafted.</p>
        </div>
        <Link
          href="/quotes/new"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          + New quote
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {quoteList.map((q) => {
          const total = q.po_rows.reduce((sum, r) => {
            const n = Number(String(r.price).replace(/[^0-9.-]/g, ""));
            return sum + (Number.isFinite(n) ? n : 0);
          }, 0);
          return (
            <Link
              key={q.id}
              href={`/quotes/${q.id}`}
              className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 hover:border-neutral-300 hover:shadow-sm"
            >
              <div>
                <div className="font-medium text-neutral-900">{q.name}</div>
                <div className="text-xs text-neutral-400">
                  {q.customer} · {q.quote_date} · {q.stage}
                </div>
              </div>
              <div className="text-sm font-medium text-neutral-700">
                {total > 0 ? formatPrice(total) : ""}
              </div>
            </Link>
          );
        })}
        {quoteList.length === 0 && (
          <p className="text-sm text-neutral-400">No quotes yet — create one above.</p>
        )}
      </div>
    </div>
  );
}
