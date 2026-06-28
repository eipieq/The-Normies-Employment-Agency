import Link from "next/link";
import Image from "next/image";
import { NormiePortrait } from "./normie-portrait";
import { ShareButton } from "./share-button";
import { GatedPanel } from "./gated-panel";
import type { Persona } from "@/lib/persona";
import type { CollectionMeta, Portrait } from "@/lib/collections";

type Props = {
  collection: CollectionMeta;
  tokenId: number;
  portrait: Portrait;
  persona: Persona;
  tags: string[];
  displayName?: string | null;
};

function Portrait({ portrait, alt }: { portrait: Portrait; alt: string }) {
  if (portrait.kind === "pixels") {
    return <NormiePortrait pixels={portrait.pixels} className="block w-full" />;
  }
  return (
    <Image
      src={portrait.src}
      alt={alt}
      width={400}
      height={400}
      className="block w-full h-auto"
      unoptimized
    />
  );
}

export function EmploymentCard({
  collection,
  tokenId,
  portrait,
  persona,
  tags,
  displayName,
}: Props) {
  return (
    <div className="w-full max-w-sm rounded-xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-1 space-y-1">
      <div className="relative bg-neutral-100 rounded-t-[10px] rounded-b-[5px] overflow-hidden">
        <Portrait portrait={portrait} alt={`${collection.label} #${tokenId}`} />
        {displayName && (
          <span className="absolute top-3 right-3.5 text-sm text-neutral-400">{displayName}</span>
        )}
      </div>

      <div className="bg-neutral-100 rounded-[5px] p-3.5 space-y-3">
        <p className="font-mono text-sm text-neutral-400 tabular-nums">
          #{String(tokenId).padStart(4, "0")}
        </p>

        <h1 className="font-pixel-square text-2xl text-neutral-900 leading-snug capitalize">
          {persona.jobTitle}
        </h1>

        <div className="flex flex-wrap gap-1">
          {tags
            .map((l) => l.charAt(0).toUpperCase() + l.slice(1))
            .map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[13px] font-medium text-neutral-600"
              >
                {label}
              </span>
            ))}
        </div>

        <p className="text-[15px] font-medium text-neutral-500 leading-relaxed">
          {persona.oneLiner.charAt(0).toUpperCase() + persona.oneLiner.slice(1)}
        </p>
      </div>

      <GatedPanel collection={collection.slug} tokenId={tokenId} label={collection.label} />

      <div className="bg-neutral-50 rounded-t-[5px] rounded-b-[10px] p-3.5 flex items-center justify-between">
        <ShareButton
          collection={collection.slug}
          label={collection.label}
          tokenId={tokenId}
          jobTitle={persona.jobTitle}
          oneLiner={persona.oneLiner}
        />
        <Link
          href="/"
          className="text-neutral-900 hover:text-neutral-700 transition-colors"
          style={{
            fontFamily: "var(--font-instrument-sans)",
            fontWeight: 500,
            fontSize: "13px",
            letterSpacing: "-0.01em",
            lineHeight: 1,
          }}
        >
          The Employment
          <br />
          Agency
        </Link>
      </div>
    </div>
  );
}
