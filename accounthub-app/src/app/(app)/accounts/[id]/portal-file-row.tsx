"use client";

import { useState, useTransition } from "react";
import { STAGES } from "@/lib/types";
import type { PortalFile, Site } from "@/lib/types";
import { getPortalFileUrl, deletePortalFile, filePortalFileAsDoc } from "../actions";
import { showToast } from "@/lib/toast-client";

export function PortalFileRow({
  accountId,
  file,
  canDelete,
  canFile,
  siteList,
  defaultStage,
}: {
  accountId: string;
  file: PortalFile;
  canDelete: boolean;
  // Only customer-sent-back files can be filed as a doc — files we shared out don't need it.
  canFile?: boolean;
  siteList?: Site[];
  defaultStage?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [deleting, startDeleteTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showFileForm, setShowFileForm] = useState(false);

  return (
    <div className="rounded-md border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm">
      <div className="flex items-center justify-between">
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
        <div className="flex items-center gap-3">
          {canFile &&
            (file.filed_doc_id ? (
              <span className="text-xs text-[#5fd08a]">Filed ✓</span>
            ) : (
              <button
                type="button"
                onClick={() => setShowFileForm((v) => !v)}
                className="whitespace-nowrap text-xs text-[#4fc3ff] hover:underline"
              >
                {showFileForm ? "Cancel" : "Save to account"}
              </button>
            ))}
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
      </div>

      {showFileForm && (
        <FilePortalFileForm
          accountId={accountId}
          fileId={file.id}
          siteList={siteList ?? []}
          defaultStage={defaultStage ?? "Discovery"}
          defaultTitle={file.note || file.file_name}
          onFiled={() => setShowFileForm(false)}
          onError={setError}
        />
      )}
    </div>
  );
}

function FilePortalFileForm({
  accountId,
  fileId,
  siteList,
  defaultStage,
  defaultTitle,
  onFiled,
  onError,
}: {
  accountId: string;
  fileId: string;
  siteList: Site[];
  defaultStage: string;
  defaultTitle: string;
  onFiled: () => void;
  onError: (e: string | null) => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        onError(null);
        startTransition(async () => {
          try {
            await filePortalFileAsDoc(accountId, fileId, formData);
            showToast("Filed to account");
            onFiled();
          } catch (e) {
            onError(e instanceof Error ? e.message : "Couldn't file that document");
          }
        });
      }}
      className="mt-3 flex flex-col gap-2 border-t border-white/[0.06] pt-3"
    >
      <input
        name="title"
        placeholder="Deal / project title"
        required
        defaultValue={defaultTitle}
        className="rounded-md border border-white/[0.10] px-2 py-1.5 text-sm"
      />
      <div className="flex gap-2">
        <select name="kind" className="rounded-md border border-white/[0.10] px-2 py-1.5 text-sm">
          <option value="quote">Quote</option>
          <option value="sow">SOW</option>
        </select>
        <select
          name="facilitySiteId"
          className="flex-1 rounded-md border border-white/[0.10] px-2 py-1.5 text-sm"
        >
          <option value="">No facility (group-level)</option>
          {siteList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-1.5 text-xs text-[#aeb1b8]">
        <input type="checkbox" name="trackPipeline" defaultChecked />
        Track this on the pipeline
      </label>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[#aeb1b8]">
          Pipeline stage (continues this account&apos;s current tile, if any)
        </label>
        <select
          name="pipelineStage"
          defaultValue={defaultStage}
          className="rounded-md border border-white/[0.10] px-2 py-1.5 text-sm"
        >
          {STAGES.filter((s) => s !== "Live").map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md border border-white/[0.10] px-3 py-1.5 text-sm hover:bg-white/[0.05] disabled:opacity-60"
      >
        {pending ? "Filing…" : "File document"}
      </button>
    </form>
  );
}
