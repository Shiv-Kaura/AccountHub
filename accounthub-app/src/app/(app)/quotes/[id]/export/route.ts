import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Quote } from "@/lib/types";
import { buildQuoteHtml } from "@/lib/export-html";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: quote } = await supabase.from("quotes").select("*").eq("id", id).single();

  if (!quote) notFound();

  const html = buildQuoteHtml(quote as Quote);
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
