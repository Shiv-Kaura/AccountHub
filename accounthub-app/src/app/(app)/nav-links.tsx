"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/accounts", label: "Facility Groups" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/sows", label: "SOW Generator" },
  { href: "/quotes", label: "Quote Generator" },
];

/**
 * Sidebar nav links, split into a client component only so the current
 * page can be highlighted (usePathname) — a purely visual affordance
 * from the design mockups, no navigation behavior changes.
 *
 * Combines True Elevation's slim left accent bar (not a glow) with a
 * live hover state on every item, active or not — blue is used here
 * for exactly one job (the active nav item), matching its brand/
 * primary-button/nav-active/Signed-status role everywhere else in the
 * app, so it never competes with the status colors used on data.
 */
export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? "relative rounded-md py-2 pl-3.5 pr-3 text-sm font-semibold text-[#eaf4ff] bg-[#0496ff]/[0.10] transition-colors hover:bg-[#0496ff]/[0.15]"
                : "relative rounded-md px-3 py-2 text-sm font-medium text-[#9a9ca3] transition-colors hover:bg-white/[0.045] hover:text-[#e7e8eb]"
            }
          >
            {active && (
              <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-[#0496ff]" />
            )}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
