import Link from "next/link";
import { NormiePortrait } from "./normie-portrait";

type Props = {
  tokenId: number;
  pixels: string;
  jobTitle: string;
  oneLiner: string;
};

export function NormiePreviewCard({ tokenId, pixels, jobTitle, oneLiner }: Props) {
  return (
    <Link
      href={`/works/${tokenId}`}
      className="group block bg-white rounded-xl p-1 space-y-1 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.09)] transition-shadow"
    >
      {/* image section */}
      <div className="bg-neutral-100 rounded-t-[10px] rounded-b-[5px] aspect-square overflow-hidden">
        <NormiePortrait pixels={pixels} className="block w-full h-full" />
      </div>

      {/* text section */}
      <div className="bg-neutral-100 rounded-t-[5px] rounded-b-[10px] p-3.5 space-y-2">
        <p className="font-mono text-sm text-neutral-400 tabular-nums">
          #{String(tokenId).padStart(4, "0")}
        </p>
        <p className="font-pixel-square text-lg text-neutral-900 leading-snug capitalize">{jobTitle}</p>
        <p className="font-normal text-[15px] text-neutral-500 leading-relaxed line-clamp-2 first-letter:uppercase">{oneLiner}</p>
      </div>
    </Link>
  );
}
