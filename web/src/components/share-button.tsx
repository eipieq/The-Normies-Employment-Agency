"use client";

import type { CollectionSlug } from "@/lib/collections";

type Props = {
  collection: CollectionSlug;
  label: string;
  tokenId: number;
  jobTitle: string;
  oneLiner: string;
};

export function ShareButton({ collection, label, tokenId, jobTitle, oneLiner }: Props) {
  function share() {
    const url = `${window.location.origin}/collections/${collection}/works/${tokenId}`;
    const text = `${label} #${tokenId} got a job.\n\n${jobTitle}.\n\n"${oneLiner}"\n\n${url}`;
    window.open(
      `https://x.com/intent/post?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener",
    );
  }

  return (
    <button
      onClick={share}
      className="inline-flex items-center gap-1.5 rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
    >
      Share on
      <svg width="13" height="13" viewBox="0 0 1200 1227" fill="currentColor" aria-hidden="true">
        <path d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z" />
      </svg>
    </button>
  );
}
