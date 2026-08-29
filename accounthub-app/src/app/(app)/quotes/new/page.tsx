import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { QuoteForm } from "./quote-form";

export default async function NewQuotePage() {
  const supabase = await createClient();
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name, contact, contacts(id, name, role, email, phone)")
    .order("name");

  return (
    <div className="p-8">
      <Link href="/quotes" className="text-sm text-[#5a5d64] hover:text-[#c7c9d0]">
        &larr; All quotes
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-[#f2f2f4]">New quote</h1>
      <QuoteForm accounts={accounts ?? []} />
    </div>
  );
}
