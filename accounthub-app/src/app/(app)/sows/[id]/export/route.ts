import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Sow } from "@/lib/types";
import { buildSowHtml } from "@/lib/export-html";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: sow } = await supabase.from("sows").select("*").eq("id", id).single();

  if (!sow) notFound();

  const html = buildSowHtml(sow as Sow);
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
