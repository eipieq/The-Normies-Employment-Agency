"use client";

import { useState } from "react";
import { DownloadSimple, Spinner } from "@phosphor-icons/react";
import type { CollectionSlug } from "@/lib/collections";

type Props = {
  collection: CollectionSlug;
  label: string;
  tokenId: number;
  jobTitle: string;
  oneLiner: string;
};

function caption(
  collection: CollectionSlug,
  label: string,
  tokenId: number,
  jobTitle: string,
  oneLiner: string,
) {
  const url = `${window.location.origin}/collections/${collection}/works/${tokenId}`;
  return `${label} #${tokenId} got a job.\n\n${jobTitle}.\n\n"${oneLiner}"\n\n${url}`;
}

function canShareFile(file: File) {
  try {
    return !!navigator.canShare?.({ files: [file] });
  } catch {
    return false;
  }
}

function save(file: File, filename: string) {
  const href = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

export function ShareButton({ collection, label, tokenId, jobTitle, oneLiner }: Props) {
  const [busy, setBusy] = useState<"download" | "share" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filename = `${label}-${String(tokenId).padStart(4, "0")}-card.png`;
  const cardUrl = `/collections/${collection}/works/${tokenId}/card.png`;

  async function getFile() {
    const res = await fetch(cardUrl);
    if (!res.ok) throw new Error("export failed");
    const blob = await res.blob();
    return new File([blob], filename, { type: "image/png" });
  }

  async function download() {
    setBusy("download");
    setError(null);
    try {
      save(await getFile(), filename);
    } catch {
      setError("couldn't export the card");
    } finally {
      setBusy(null);
    }
  }

  async function share() {
    setBusy("share");
    setError(null);
    try {
      const file = await getFile();
      const text = caption(collection, label, tokenId, jobTitle, oneLiner);
      if (canShareFile(file)) {
        await navigator.share({ files: [file], text, title: jobTitle });
        return;
      }
      save(file, filename);
      window.open(`https://x.com/intent/post?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setError("couldn't export the card");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={download}
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 rounded-md border border-black/10 bg-white px-3 py-1.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50 disabled:opacity-50"
        >
          {busy === "download" ? (
            <Spinner size={20} weight="regular" className="animate-spin" />
          ) : (
            <DownloadSimple size={20} weight="regular" />
          )}
          Download
        </button>
        <button
          type="button"
          onClick={share}
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {busy === "share" ? (
            <Spinner size={20} weight="regular" className="animate-spin" />
          ) : (
            <>
              Share on
              <svg width="13" height="13" viewBox="0 0 1200 1227" fill="currentColor" aria-hidden="true">
                <path d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z" />
              </svg>
            </>
          )}
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
