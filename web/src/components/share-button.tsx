"use client";

import { ArrowUpRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

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
    <Button variant="outline" size="sm" onClick={share} className="gap-1.5">
      <ArrowUpRight size={16} />
      share on x
    </Button>
  );
}
