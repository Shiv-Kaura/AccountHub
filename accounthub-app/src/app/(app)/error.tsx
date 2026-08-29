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
      <div className="text-lg font-semibold text-neutral-900">Something went wrong</div>
      <p className="max-w-sm text-sm text-neutral-500">
        {error.message || "That action didn't go through. Nothing else on the page was affected."}
      </p>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-[#3d1f6e] px-4 py-2 text-sm font-medium text-white hover:bg-[#2d1650]"
        >
          Try again
        </button>
        <Link href="/accounts" className="text-sm text-neutral-500 hover:text-neutral-900">
          Back to accounts
        </Link>
      </div>
    </div>
  );
}
