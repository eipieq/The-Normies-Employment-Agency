"use client";

import { ArrowUpRight } from "@phosphor-icons/react";
import { PillButton } from "@/components/pill-button";

type Props = {
  tokenId: number;
  jobTitle: string;
  oneLiner: string;
};

export function ShareButton({ tokenId, jobTitle, oneLiner }: Props) {
  function share() {
    const url = `${window.location.origin}/works/${tokenId}`;
    const text = `normie #${tokenId} got a job.\n\n${jobTitle}.\n\n"${oneLiner}"\n\n${url}`;
    window.open(
      `https://x.com/intent/post?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener"
    );
  }

  return (
    <PillButton onClick={share}>
      <ArrowUpRight size={14} />
      share on x
    </PillButton>
  );
}
