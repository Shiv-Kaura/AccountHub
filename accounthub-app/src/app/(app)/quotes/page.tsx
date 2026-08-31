import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Quote } from "@/lib/types";
import { formatPrice } from "@/lib/rate-card";
import { stageAccentHex } from "@/lib/ui";
import { GlassBanner, BannerActionLink } from "../glass-banner";

export default async function QuotesPage() {
  const supabase = await createClient();
  const { data: quotes } = await supabase
    .from("quotes")
    .select("*")
    .order("quote_date", { ascending: false });

  const quoteList = (quotes ?? []) as Quote[];

  return (
    <div className="relative min-h-screen">
      <GlassBanner title="Quote Generator" actions={<BannerActionLink href="/quotes/new">+ New quote</BannerActionLink>} />

      <div className="p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#f7f7f8]">Quote Generator</h1>
            <p className="mt-1 text-sm text-[#8c8f96]">Every quote that&rsquo;s been drafted.</p>
          </div>
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
                className={`relative flex items-center justify-between overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#1c1c1e] p-4 pl-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors hover:bg-[#232326] ${q.lost ? "opacity-60" : ""}`}
              >
                <span
                  className="absolute inset-y-0 left-0 w-[3px]"
                  style={{ background: q.lost ? "#d81159" : stageAccentHex(q.stage) }}
                />
                <div>
                  <div className={`font-medium ${q.lost ? "text-[#b3b5bc] line-through decoration-[#d81159]/40" : "text-[#f2f2f4]"}`}>
                    {q.name}
                  </div>
                  <div className="text-xs text-[#5a5d64]">
                    {q.customer} · {q.quote_date} · {q.lost ? <span className="font-bold uppercase tracking-wide text-[#e8577f]">Lost</span> : q.stage}
                  </div>
                </div>
                <div className="text-sm font-medium text-[#c7c9d0]">
                  {total > 0 ? formatPrice(total) : ""}
                </div>
              </Link>
            );
          })}
          {quoteList.length === 0 && (
            <p className="text-sm text-[#5a5d64]">No quotes yet — create one above.</p>
          )}
        </div>
      </div>
    </div>
  );
}
