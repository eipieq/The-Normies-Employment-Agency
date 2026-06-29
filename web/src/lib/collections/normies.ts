import { loadFeatures, normies, NormiesApiError, type NormieFeatures } from "../normies";
import { getDepartmentFromFeatures } from "../cluster";
import type { CollectionAdapter, Dossier } from "./types";

const ENERGY_LABEL: Record<string, string> = {
  reserved: "quiet energy",
  baseline: "steady energy",
  expressive: "high energy",
};

function buildPrompt(f: NormieFeatures): string {
  const traits = f.traits.attributes
    .map((a) => `${a.trait_type}: ${a.value}`)
    .join("\n");

  const agentSection = f.agent
    ? `registered name: ${f.agent.name}\nregistered type: ${f.agent.type}`
    : "not erc-8004 registered. invent a name that fits.";

  return `## normie #${f.tokenId} dossier

### agent registration
${agentSection}

### traits
${traits}

### pixel analysis
density: ${(f.density * 100).toFixed(1)}% (${f.density > 0.4 ? "heavy" : f.density < 0.25 ? "sparse" : "medium"})
top mass: ${(f.distribution.topMass * 100).toFixed(1)}%
bottom mass: ${(f.distribution.bottomMass * 100).toFixed(1)}%
center mass: ${(f.distribution.centerMass * 100).toFixed(1)}%
edge mass: ${(f.distribution.edgeMass * 100).toFixed(1)}%

### archetype
category: ${f.archetype.category}
formality: ${f.archetype.formality}
perception: ${f.archetype.perception}
demeanor: ${f.archetype.demeanor}
energy: ${f.archetype.energy}${f.archetype.tags.length > 0 ? `\nflavor tags: ${f.archetype.tags.join(", ")}` : ""}

### canvas history
versions: ${f.history.versionCount}
total pixel churn: ${f.history.totalChurn}
transformer diversity: ${f.history.transformerDiversity}
virgin (never edited): ${f.history.isVirgin}

generate the persona object for this normie.`;
}

function toDossier(f: NormieFeatures): Dossier {
  const canvasNote = f.history.isVirgin
    ? "first edition"
    : f.history.versionCount === 1
      ? "1 edit"
      : `${f.history.versionCount} edits`;

  const tags = [
    f.archetype.category,
    f.archetype.formality,
    ENERGY_LABEL[f.archetype.energy] ?? f.archetype.energy,
    canvasNote,
    ...f.archetype.tags.slice(0, 2),
  ];

  return {
    collection: "normies",
    tokenId: f.tokenId,
    owner: f.owner,
    portrait: { kind: "pixels", pixels: f.pixels },
    tags,
    displayName: f.agent?.name ?? null,
    cacheVersion: String(f.history.versionCount),
    prompt: buildPrompt(f),
  };
}

export const normiesAdapter: CollectionAdapter = {
  meta: {
    slug: "normies",
    name: "normies",
    label: "normie",
    contract: null,
    maxTokenId: 8888,
    openseaUrl: "https://opensea.io/collection/normies",
  },

  async loadDossier(tokenId: number) {
    const f = await loadFeatures(tokenId);
    return toDossier(f);
  },

  async isOwner(tokenId, address) {
    const owner = await normies.owner(tokenId);
    return owner.owner.toLowerCase() === address.toLowerCase();
  },

  async getDepartment(tokenId) {
    try {
      const f = await loadFeatures(tokenId);
      return getDepartmentFromFeatures(f);
    } catch {
      return null;
    }
  },
};

export { NormiesApiError };
