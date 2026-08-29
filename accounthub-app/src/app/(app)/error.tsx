"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="text-lg font-semibold text-[#f2f2f4]">Something went wrong</div>
      <p className="max-w-sm text-sm text-[#8c8f96]">
        {error.message || "That action didn't go through. Nothing else on the page was affected."}
      </p>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-gradient-to-b from-[#0496ff] to-[#006ba6] px-4 py-2 text-sm font-medium text-white hover:brightness-110"
        >
          Try again
        </button>
        <Link href="/accounts" className="text-sm text-[#8c8f96] hover:text-[#f2f2f4]">
          Back to accounts
        </Link>
      </div>
    </div>
  );
}
