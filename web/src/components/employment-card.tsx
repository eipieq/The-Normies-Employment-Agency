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
  reserved: "quiet energy",
  baseline: "steady energy",
  expressive: "high energy",
};

const FORMALITY_LABEL: Record<string, string> = {
  formal: "formal",
  casual: "casual",
  experimental: "experimental",
  eccentric: "eccentric",
};

export function EmploymentCard({ tokenId, pixels, persona, archetype, history, agent }: Props) {
  const name = agent?.name ?? null;
  const canvasNote = history.isVirgin
    ? "first edition"
    : history.versionCount === 1
    ? "1 edit"
    : `${history.versionCount} edits`;

  return (
    <div className="w-full max-w-sm rounded-xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* portrait panel */}
      <div className="relative bg-neutral-100 flex items-center justify-center py-8">
        <NormiePortrait pixels={pixels} size={200} />
        <span className="absolute bottom-3 left-3.5 text-sm text-neutral-400 tabular-nums">
          #{String(tokenId).padStart(4, "0")}
        </span>
        {name && (
          <span className="absolute top-3 right-3.5 text-sm text-neutral-400">
            {name}
          </span>
        )}
      </div>

      {/* content */}
      <div className="p-4 space-y-3">
        {/* meta row */}
        <div className="flex items-center gap-1.5 text-sm text-neutral-400">
          <span>{archetype.category}</span>
          <span className="text-neutral-200">·</span>
          <span>{FORMALITY_LABEL[archetype.formality]}</span>
          <span className="text-neutral-200">·</span>
          <span>{ENERGY_LABEL[archetype.energy]}</span>
        </div>

        {/* job title */}
        <div>
          <h1 className="text-[17px] font-medium text-neutral-900 leading-snug">
            {persona.jobTitle}
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500 leading-relaxed">
            {persona.oneLiner}
          </p>
        </div>

        {/* divider */}
        <div className="border-t border-neutral-100" />

        {/* canvas status */}
        <p className="text-sm text-neutral-400">
          {canvasNote}
          {archetype.tags.length > 0 && (
            <>
              <span className="mx-1.5 text-neutral-200">·</span>
              {archetype.tags.slice(0, 2).join(", ")}
            </>
          )}
        </p>

        {/* gated section */}
        <GatedPanel tokenId={tokenId} />

        {/* actions */}
        <div className="flex items-center justify-between pt-0.5">
          <ShareButton
            tokenId={tokenId}
            jobTitle={persona.jobTitle}
            oneLiner={persona.oneLiner}
          />
          <span className="text-sm text-neutral-300">
            normie employment agency
          </span>
        </div>
      </div>
    </div>
  );
}
