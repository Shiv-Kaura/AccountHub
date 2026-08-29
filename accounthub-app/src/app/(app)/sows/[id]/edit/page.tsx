import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Sow } from "@/lib/types";
import { SowForm } from "../../new/sow-form";

export default async function EditSowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: sow }, { data: accounts }] = await Promise.all([
    supabase.from("sows").select("*").eq("id", id).single(),
    supabase.from("accounts").select("id, name, contact, contacts(id, name, role, email, phone)").order("name"),
  ]);

  if (!sow) notFound();

  return (
    <div className="p-8">
      <Link href={`/sows/${id}`} className="text-sm text-[#5a5d64] hover:text-[#c7c9d0]">
        &larr; Back to SOW
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-[#f2f2f4]">Edit SOW</h1>
      <SowForm accounts={accounts ?? []} sow={sow as Sow} />
    </div>
  );
}
