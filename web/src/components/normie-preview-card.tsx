import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { NormiePortrait } from "./normie-portrait";

type Props = {
  tokenId: number;
  pixels: string;
  jobTitle: string;
  oneLiner: string;
  category: string;
};

export function NormiePreviewCard({ tokenId, pixels, jobTitle, oneLiner, category }: Props) {
  return (
    <Link
      href={`/works/${tokenId}`}
      className="group block bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.09)] transition-shadow overflow-hidden"
    >
      {/* portrait */}
      <div className="bg-neutral-100 flex items-center justify-center py-6 relative">
        <NormiePortrait pixels={pixels} size={120} />
        <span className="absolute bottom-2 left-3 text-[10px] text-neutral-400 tabular-nums">
          #{String(tokenId).padStart(4, "0")}
        </span>
      </div>

      {/* content */}
      <div className="p-3.5 space-y-1.5">
        <p className="text-[10px] text-neutral-400">{category}</p>
        <p className="text-sm font-medium text-neutral-900 leading-snug">{jobTitle}</p>
        <p className="text-[11px] text-neutral-500 leading-relaxed line-clamp-2">{oneLiner}</p>
        <div className="flex items-center gap-1 pt-1 text-[11px] text-neutral-400 group-hover:text-neutral-600 transition-colors">
          view card
          <ArrowRight size={11} />
        </div>
      </div>
    </Link>
  );
}
