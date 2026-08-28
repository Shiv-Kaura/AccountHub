import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SowForm } from "./sow-form";

export default async function NewSowPage() {
  const supabase = await createClient();
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name, contact, contacts(id, name, role, email, phone)")
    .order("name");

  return (
    <div className="p-8">
      <Link href="/sows" className="text-sm text-neutral-400 hover:text-neutral-700">
        &larr; All SOWs
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-neutral-900">New SOW</h1>

      <SowForm accounts={accounts ?? []} />
    </div>
  );
}
