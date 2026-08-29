import type { ReactNode } from "react";
import Link from "next/link";
import { SearchIcon } from "./pipeline/pipeline-icons";

/**
 * The frosted glass top banner from the approved design mockups, now
 * shared across every page instead of being Pipeline-only. Cosmetic
 * shell only — a title/breadcrumb on the left, optional actions on the
 * right, optional inline search form. No behavior of its own.
 */
export function GlassBanner({
  crumb,
  title,
  actions,
  showSearch = true,
}: {
  crumb?: ReactNode;
  title: ReactNode;
  actions?: ReactNode;
  showSearch?: boolean;
}) {
  return (
    <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] bg-[rgba(20,20,22,0.62)] px-7 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur-[22px] backdrop-saturate-[140%]">
      <div className="flex items-center gap-3">
        <span className="text-[15px]">🚀</span>
        <span className="text-[13px] font-semibold tracking-tight text-[#f2f2f4]">AccountHub</span>
        <span className="h-3.5 w-px bg-white/10" />
        <span className="text-[13px] text-[#8c8f96]">
          {crumb ? (
            <>
              <span className="text-[#8c8f96]">{crumb}</span>
              <span className="mx-1.5 text-[#5a5d64]">/</span>
              <span className="text-[#8c8f96]">{title}</span>
            </>
          ) : (
            title
          )}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {showSearch && (
          <form action="/search" className="flex w-[240px] items-center gap-2 rounded-[9px] border border-white/[0.08] bg-white/[0.045] px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <SearchIcon className="text-[#6c6f78]" />
            <input
              name="q"
              type="search"
              placeholder="Search…"
              className="flex-1 bg-transparent text-xs text-[#e5e6ea] placeholder:text-[#6c6f78] focus:outline-none"
            />
          </form>
        )}
        {actions}
      </div>
    </div>
  );
}

/** Consistent primary "glow" action button for banners (New account, New quote, etc). */
export function BannerActionLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg bg-gradient-to-b from-[#0496ff] to-[#006ba6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_4px_16px_rgba(4,150,255,0.4)]"
    >
      {children}
    </Link>
  );
}
