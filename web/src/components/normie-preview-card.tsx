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
      className="group block bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.09)] transition-shadow overflow-hidden"
    >
      {/* portrait */}
      <div className="bg-neutral-100 flex items-center justify-center py-6">
        <NormiePortrait pixels={pixels} size={120} />
      </div>

      {/* content */}
      <div className="p-3.5 space-y-1.5">
        <p className="text-sm text-neutral-400 tabular-nums">
          #{String(tokenId).padStart(4, "0")}
        </p>
        <p className="text-lg font-medium text-neutral-900 leading-snug">{jobTitle}</p>
        <p className="text-sm text-neutral-500 leading-relaxed line-clamp-2">{oneLiner}</p>
      </div>
    </Link>
  );
}
