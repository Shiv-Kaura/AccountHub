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
 */
export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? "rounded-md px-3 py-2 text-sm font-semibold text-[#4fc3ff] bg-[#0496ff]/[0.14] shadow-[inset_0_0_0_1px_rgba(4,150,255,0.22)]"
                : "rounded-md px-3 py-2 text-sm font-medium text-[#c7c9d0] hover:bg-[#0496ff]/[0.14] hover:text-[#4fc3ff]"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
