import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import { Toaster } from "./toaster";
import { NavLinks } from "./nav-links";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative flex min-h-screen">
      {/*
        True Elevation, combined with the restrained-glass pass: no ambient
        glow/blob wash behind the app (that read as a step back toward the
        old glow system — muz.li principle 4, "the glow/bloom halos are
        gone"). The sidebar is the one glass surface outside the banner —
        translucent + blurred so it still reads as glass against whatever
        scrolls under it, without needing a colored blob to justify it.
      */}
      <aside className="relative z-10 flex w-56 shrink-0 flex-col justify-between border-r border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-2xl backdrop-saturate-[140%]">
        <div>
          <Link href="/">
            <div className="text-base font-semibold text-[#4fc3ff]">
              AccountHub
            </div>
            <div className="mt-0.5 text-[11px] uppercase tracking-wide text-[#5a5d64]">
              Synthesis Health
            </div>
          </Link>

          <form action="/search" className="mt-4 flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.045] px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <input
              name="q"
              type="search"
              placeholder="Search…"
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </form>

          <NavLinks />
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
      <main className="relative z-10 min-w-0 flex-1">{children}</main>
      <Toaster />
    </div>
  );
}
