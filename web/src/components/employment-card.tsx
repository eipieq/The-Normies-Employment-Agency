import Link from "next/link";
import { NormiePortrait } from "./normie-portrait";
import { ShareButton } from "./share-button";
import { GatedPanel } from "./gated-panel";
import type { Persona } from "@/lib/persona";
import type { ArchetypeFeatures, HistoryComplexity, AgentInfo } from "@/lib/normies";

type Props = {
  tokenId: number;
  pixels: string;
  persona: Persona;
  archetype: ArchetypeFeatures;
  history: HistoryComplexity;
  agent: AgentInfo | null;
};

const ENERGY_LABEL: Record<string, string> = {
  reserved: "Quiet Energy",
  baseline: "Steady Energy",
  expressive: "High Energy",
};

const FORMALITY_LABEL: Record<string, string> = {
  formal: "Formal",
  casual: "Casual",
  experimental: "Experimental",
  eccentric: "Eccentric",
};

export function EmploymentCard({ tokenId, pixels, persona, archetype, history, agent }: Props) {
  const name = agent?.name ?? null;
  const canvasNote = history.isVirgin
    ? "first edition"
    : history.versionCount === 1
    ? "1 edit"
    : `${history.versionCount} edits`;

  return (
    <div className="w-full max-w-sm rounded-xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-1 space-y-1">

      {/* 1. portrait */}
      <div className="relative bg-neutral-100 rounded-t-[10px] rounded-b-[5px] overflow-hidden">
        <NormiePortrait pixels={pixels} className="block w-full" />
        {name && (
          <span className="absolute top-3 right-3.5 text-sm text-neutral-400">{name}</span>
        )}
      </div>

      {/* 2. info */}
      <div className="bg-neutral-100 rounded-[5px] p-3.5 space-y-3">
        {/* number */}
        <p className="font-mono text-sm text-neutral-400 tabular-nums">
          #{String(tokenId).padStart(4, "0")}
        </p>

        {/* title */}
        <h1 className="font-pixel-square text-2xl text-neutral-900 leading-snug capitalize">
          {persona.jobTitle}
        </h1>

        {/* chips: meta + canvas tags */}
        <div className="flex flex-wrap gap-1">
          {[archetype.category, FORMALITY_LABEL[archetype.formality], ENERGY_LABEL[archetype.energy], canvasNote, ...archetype.tags.slice(0, 2)]
            .map(l => l.charAt(0).toUpperCase() + l.slice(1))
            .map(label => (
              <span key={label} className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[13px] font-medium text-neutral-600">
                {label}
              </span>
            ))}
        </div>

        {/* description */}
        <p className="text-[15px] font-medium text-neutral-500 leading-relaxed">
          {persona.oneLiner.charAt(0).toUpperCase() + persona.oneLiner.slice(1)}
        </p>
      </div>

      {/* 3. gated panel */}
      <GatedPanel tokenId={tokenId} />

      {/* 4. footer */}
      <div className="bg-neutral-50 rounded-t-[5px] rounded-b-[10px] p-3.5 flex items-center justify-between">
          <ShareButton
            tokenId={tokenId}
            jobTitle={persona.jobTitle}
            oneLiner={persona.oneLiner}
          />
          <Link
            href="/"
            className="text-neutral-900 hover:text-neutral-700 transition-colors"
            style={{ fontFamily: "var(--font-instrument-sans)", fontWeight: 500, fontSize: "13px", letterSpacing: "-0.01em", lineHeight: 1 }}
          >
            The Normies<br />Employment Agency
          </Link>
      </div>

    </div>
  );
}
