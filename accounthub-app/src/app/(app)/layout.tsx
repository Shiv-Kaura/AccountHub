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
      <aside className="flex w-56 shrink-0 flex-col justify-between border-r border-neutral-200 bg-neutral-50 p-5">
        <div>
          <Link href="/">
            <div className="text-base font-semibold text-[#3d1f6e]">AccountHub</div>
            <div className="mt-0.5 text-[11px] uppercase tracking-wide text-neutral-400">
              Synthesis Health
            </div>
          </Link>

          <form action="/search" className="mt-4">
            <input
              name="q"
              type="search"
              placeholder="Search…"
              className="w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b3a99]"
            />
          </form>

          <nav className="mt-6 flex flex-col gap-1">
            <Link
              href="/"
              className="rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-[#5b3a99]/10 hover:text-[#3d1f6e]"
            >
              Dashboard
            </Link>
            <Link
              href="/accounts"
              className="rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-[#5b3a99]/10 hover:text-[#3d1f6e]"
            >
              Facility Groups
            </Link>
            <Link
              href="/pipeline"
              className="rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-[#5b3a99]/10 hover:text-[#3d1f6e]"
            >
              Pipeline
            </Link>
            <Link
              href="/sows"
              className="rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-[#5b3a99]/10 hover:text-[#3d1f6e]"
            >
              SOW Generator
            </Link>
            <Link
              href="/quotes"
              className="rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-[#5b3a99]/10 hover:text-[#3d1f6e]"
            >
              Quote Generator
            </Link>
          </nav>
        </div>
        <div className="flex flex-col gap-2">
          {user && <div className="truncate text-xs text-neutral-400">{user.email}</div>}
          <form action={signOut}>
            <button
              type="submit"
              className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-left text-sm text-neutral-600 hover:bg-neutral-100"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 bg-white">{children}</main>
      <Toaster />
    </div>
  );
}
