"use client";

import { useState } from "react";

export function PortalLink({ portalUrl }: { portalUrl: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center gap-2 rounded-md border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm">
      <span className="flex-1 truncate text-[#c7c9d0]">{portalUrl}</span>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(portalUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            // Clipboard access can be blocked in some browser contexts — the link is still
            // selectable/visible above, so this just skips the one-click convenience.
          }
        }}
        className="shrink-0 rounded-md border border-white/[0.10] px-2.5 py-1 text-xs hover:bg-white/[0.05]"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
