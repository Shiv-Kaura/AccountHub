import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createSow } from "../actions";

export default async function NewSowPage() {
  const supabase = await createClient();
  const { data: accounts } = await supabase.from("accounts").select("id, name").order("name");

  return (
    <div className="p-8">
      <Link href="/sows" className="text-sm text-neutral-400 hover:text-neutral-700">
        &larr; All SOWs
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-neutral-900">New SOW</h1>

      <form action={createSow} className="mt-6 flex max-w-2xl flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-600">Project title</label>
            <input
              name="projectTitle"
              required
              placeholder="e.g. RASLO - VetMed HL7 Integration"
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-600">Account</label>
            <select name="accountId" className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm">
              <option value="">No account</option>
              {(accounts ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-600">Customer name</label>
            <input name="customer" className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-600">Address</label>
            <input name="address" className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">Meeting notes</label>
          <textarea
            name="meetingNotes"
            rows={3}
            placeholder="What was discussed…"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">Work summary</label>
          <textarea
            name="workSummary"
            required
            rows={4}
            placeholder="2-4 sentences describing the overall scope, in professional SOW language."
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">
            Work details (one action item per line)
          </label>
          <textarea
            name="workDetailsText"
            rows={6}
            placeholder={"Configure the HL7 interface between X and Y.\nBuild and validate HL7 message mapping."}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <input type="checkbox" name="solutionsDiagram" />
          Include a solutions diagram
        </label>

        <button
          type="submit"
          className="self-start rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Create SOW
        </button>
      </form>
    </div>
  );
}
