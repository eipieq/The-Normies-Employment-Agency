"use client";

import { NormiePreviewCard } from "./normie-preview-card";

type Card = {
  id: number;
  pixels: string;
  jobTitle: string;
  oneLiner: string;
};

export function CardsMarquee({ cards }: { cards: Card[] }) {
  if (!cards.length) return null;

  return (
    <div className="overflow-hidden">
      <div className="flex gap-2 animate-marquee w-max">
        {[...cards, ...cards].map(({ id, pixels, jobTitle, oneLiner }, i) => (
          <div key={`${id}-${i}`} className="w-64 shrink-0">
            <NormiePreviewCard
              tokenId={id}
              pixels={pixels}
              jobTitle={jobTitle}
              oneLiner={oneLiner}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
