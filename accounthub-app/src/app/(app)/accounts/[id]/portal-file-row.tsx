"use client";

import { useState, useTransition } from "react";
import type { PortalFile } from "@/lib/types";
import { getPortalFileUrl, deletePortalFile } from "../actions";

export function PortalFileRow({
  accountId,
  file,
  canDelete,
}: {
  accountId: string;
  file: PortalFile;
  canDelete: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [deleting, startDeleteTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex items-center justify-between rounded-md border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm">
      <div>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              try {
                const url = await getPortalFileUrl(file.storage_path);
                window.open(url, "_blank", "noopener,noreferrer");
              } catch (e) {
                setError(e instanceof Error ? e.message : "Could not open file");
              }
            });
          }}
          className="font-medium text-[#e5e6ea] hover:underline disabled:cursor-not-allowed disabled:text-[#5a5d64]"
        >
          {file.file_name}
        </button>
        {file.note && <div className="text-xs text-[#8c8f96]">{file.note}</div>}
        <div className="text-xs text-[#5a5d64]">
          {new Date(file.uploaded_at).toLocaleDateString()}
          {pending && " · opening…"}
          {error && <span className="text-[#ff5c8a]"> · {error}</span>}
        </div>
      </div>
      {canDelete && (
        <button
          type="button"
          disabled={deleting}
          onClick={() => {
            if (!confirm(`Remove "${file.file_name}"? This can't be undone.`)) return;
            startDeleteTransition(async () => {
              try {
                await deletePortalFile(accountId, file.id, file.storage_path);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Could not remove file");
              }
            });
          }}
          className="text-xs text-[#5a5d64] hover:text-[#ff5c8a] disabled:cursor-not-allowed"
        >
          {deleting ? "Removing…" : "Remove"}
        </button>
      )}
    </div>
  );
}
