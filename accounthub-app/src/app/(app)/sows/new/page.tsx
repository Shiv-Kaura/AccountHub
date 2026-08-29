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
      <Link href="/sows" className="text-sm text-[#5a5d64] hover:text-[#c7c9d0]">
        &larr; All SOWs
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-[#f2f2f4]">New SOW</h1>

      <SowForm accounts={accounts ?? []} />
    </div>
  );
}
