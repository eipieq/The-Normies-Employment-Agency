import Link from "next/link";
import Image from "next/image";
import { NormiePortrait } from "./normie-portrait";
import type { CollectionSlug, Portrait } from "@/lib/collections";

type Props = {
  collection: CollectionSlug;
  tokenId: number;
  portrait: Portrait;
  jobTitle: string;
  oneLiner: string;
};

function PreviewPortrait({ portrait, alt }: { portrait: Portrait; alt: string }) {
  if (portrait.kind === "pixels") {
    return <NormiePortrait pixels={portrait.pixels} className="block w-full" />;
  }
  return (
    <Image
      src={portrait.src}
      alt={alt}
      width={256}
      height={256}
      className="block w-full h-auto"
      unoptimized
    />
  );
}

export function NormiePreviewCard({
  collection,
  tokenId,
  portrait,
  jobTitle,
  oneLiner,
}: Props) {
  return (
    <Link
      href={`/collections/${collection}/works/${tokenId}`}
      className="group block bg-white rounded-xl p-1 space-y-1 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.09)] transition-shadow"
    >
      <div className="bg-neutral-100 rounded-t-[10px] rounded-b-[5px] overflow-hidden">
        <PreviewPortrait portrait={portrait} alt={`#${tokenId}`} />
      </div>

      <div className="bg-neutral-100 rounded-t-[5px] rounded-b-[10px] px-3.5 py-4 space-y-2">
        <p className="font-mono text-sm text-neutral-400 tabular-nums">
          #{String(tokenId).padStart(4, "0")}
        </p>
        <p className="font-pixel-square text-lg text-neutral-900 leading-snug capitalize">{jobTitle}</p>
        <p className="font-normal text-[15px] text-neutral-500 leading-relaxed line-clamp-2 first-letter:uppercase">
          {oneLiner}
        </p>
      </div>
    </Link>
  );
}
