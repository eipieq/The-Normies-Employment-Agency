"use client";

import { NormiePreviewCard } from "./normie-preview-card";
import type { CollectionSlug, Portrait } from "@/lib/collections";

type Card = {
  collection: CollectionSlug;
  id: number;
  portrait: Portrait;
  jobTitle: string;
  oneLiner: string;
};

export function CardsMarquee({ cards }: { cards: Card[] }) {
  if (!cards.length) return null;

  return (
    <div className="overflow-hidden">
      <div className="flex gap-2 animate-marquee w-max">
        {[...cards, ...cards].map(({ collection, id, portrait, jobTitle, oneLiner }, i) => (
          <div key={`${collection}-${id}-${i}`} className="w-64 shrink-0">
            <NormiePreviewCard
              collection={collection}
              tokenId={id}
              portrait={portrait}
              jobTitle={jobTitle}
              oneLiner={oneLiner}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
