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
    <div className="w-full max-w-xs rounded-xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-1 space-y-1">

      {/* 1. portrait */}
      <div className="relative bg-neutral-100 rounded-t-[10px] rounded-b-[5px] overflow-hidden">
        <NormiePortrait pixels={pixels} className="block w-full" />
        {name && (
          <span className="absolute top-3 right-3.5 text-sm text-neutral-400">{name}</span>
        )}
      </div>

      {/* 2. info */}
      <div className="bg-neutral-100 rounded-[5px] p-3.5 space-y-3">
        <p className="font-mono text-sm text-neutral-400 tabular-nums">
          #{String(tokenId).padStart(4, "0")}
        </p>
        <div className="flex items-center gap-1.5 text-sm text-neutral-400">
          <span>{archetype.category}</span>
          <span className="text-neutral-300">·</span>
          <span>{FORMALITY_LABEL[archetype.formality]}</span>
          <span className="text-neutral-300">·</span>
          <span>{ENERGY_LABEL[archetype.energy]}</span>
        </div>
        <div>
          <h1 className="font-pixel-square text-lg text-neutral-900 leading-snug capitalize">
            {persona.jobTitle}
          </h1>
          <p className="mt-1.5 text-[15px] text-neutral-500 leading-relaxed">
            {persona.oneLiner}
          </p>
        </div>
        <p className="text-sm text-neutral-400">
          {canvasNote}
          {archetype.tags.length > 0 && (
            <>
              <span className="mx-1.5 text-neutral-300">·</span>
              {archetype.tags.slice(0, 2).join(", ")}
            </>
          )}
        </p>
      </div>

      {/* 3. gated panel */}
      <GatedPanel tokenId={tokenId} />

      {/* 4. footer */}
      <div className="bg-neutral-100 rounded-t-[5px] rounded-b-[10px] p-3.5 flex items-center justify-between">
        <ShareButton
          tokenId={tokenId}
          jobTitle={persona.jobTitle}
          oneLiner={persona.oneLiner}
        />
        <span className="text-sm text-neutral-400">normie works</span>
      </div>

    </div>
  );
}
