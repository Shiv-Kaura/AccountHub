import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import { Toaster } from "./toaster";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col justify-between border-r border-white/[0.07] bg-white/[0.03] p-5">
        <div>
          <Link href="/">
            <div className="text-base font-semibold text-[#4fc3ff]">AccountHub</div>
            <div className="mt-0.5 text-[11px] uppercase tracking-wide text-[#5a5d64]">
              Synthesis Health
            </div>
          </Link>

          <form action="/search" className="mt-4">
            <input
              name="q"
              type="search"
              placeholder="Search…"
              className="w-full rounded-md border border-white/[0.10] px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0496ff]"
            />
          </form>

          <nav className="mt-6 flex flex-col gap-1">
            <Link
              href="/"
              className="rounded-md px-3 py-2 text-sm font-medium text-[#c7c9d0] hover:bg-[#0496ff]/[0.14] hover:text-[#4fc3ff]"
            >
              Dashboard
            </Link>
            <Link
              href="/accounts"
              className="rounded-md px-3 py-2 text-sm font-medium text-[#c7c9d0] hover:bg-[#0496ff]/[0.14] hover:text-[#4fc3ff]"
            >
              Facility Groups
            </Link>
            <Link
              href="/pipeline"
              className="rounded-md px-3 py-2 text-sm font-medium text-[#c7c9d0] hover:bg-[#0496ff]/[0.14] hover:text-[#4fc3ff]"
            >
              Pipeline
            </Link>
            <Link
              href="/sows"
              className="rounded-md px-3 py-2 text-sm font-medium text-[#c7c9d0] hover:bg-[#0496ff]/[0.14] hover:text-[#4fc3ff]"
            >
              SOW Generator
            </Link>
            <Link
              href="/quotes"
              className="rounded-md px-3 py-2 text-sm font-medium text-[#c7c9d0] hover:bg-[#0496ff]/[0.14] hover:text-[#4fc3ff]"
            >
              Quote Generator
            </Link>
          </nav>
        </div>
        <div className="flex flex-col gap-2">
          {user && <div className="truncate text-xs text-[#5a5d64]">{user.email}</div>}
          <form action={signOut}>
            <button
              type="submit"
              className="w-full rounded-md border border-white/[0.10] px-3 py-1.5 text-left text-sm text-[#aeb1b8] hover:bg-white/[0.08]"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 bg-[#0a0a0b]">{children}</main>
      <Toaster />
    </div>
  );
}
