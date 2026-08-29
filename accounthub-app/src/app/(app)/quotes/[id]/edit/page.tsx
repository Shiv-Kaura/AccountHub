import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Quote } from "@/lib/types";
import { QuoteForm } from "../../new/quote-form";

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: quote }, { data: accounts }] = await Promise.all([
    supabase.from("quotes").select("*").eq("id", id).single(),
    supabase.from("accounts").select("id, name, contact, contacts(id, name, role, email, phone)").order("name"),
  ]);

  if (!quote) notFound();

  return (
    <div className="p-8">
      <Link href={`/quotes/${id}`} className="text-sm text-neutral-400 hover:text-neutral-700">
        &larr; Back to quote
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Edit quote</h1>
      <QuoteForm accounts={accounts ?? []} quote={quote as Quote} />
    </div>
  );
}
