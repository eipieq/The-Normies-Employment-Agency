import { normies, NormiesApiError } from "./api";
import {
  complexity,
  density,
  distribution,
  type Distribution,
  type HistoryComplexity,
} from "./analyze";
import { archetype, type ArchetypeFeatures } from "./archetypes";
import type {
  AgentInfo,
  CanvasDiff,
  CanvasInfo,
  Owner,
  Traits,
  Version,
} from "./types";

export { normies, NormiesApiError };
export { density, distribution, complexity, archetype };
export type {
  AgentInfo,
  ArchetypeFeatures,
  CanvasDiff,
  CanvasInfo,
  Distribution,
  HistoryComplexity,
  Owner,
  Traits,
  Version,
};

// one call, the full feature bundle for a normie. used by the persona generator.
export type NormieFeatures = {
  tokenId: number;
  owner: string;
  pixels: string;
  traits: Traits;
  canvas: CanvasInfo;
  diff: CanvasDiff;
  versions: Version[];
  agent: AgentInfo | null;
  density: number;
  distribution: Distribution;
  history: HistoryComplexity;
  archetype: ArchetypeFeatures;
};

export async function loadFeatures(tokenId: number): Promise<NormieFeatures> {
  const [pixels, traits, canvas, diff, versions, owner, agent] =
    await Promise.all([
      normies.pixels(tokenId),
      normies.traits(tokenId),
      normies.canvasInfo(tokenId),
      normies.canvasDiff(tokenId),
      normies.versions(tokenId),
      normies.owner(tokenId),
      normies.agentInfo(tokenId),
    ]);

  const d = density(pixels);
  const dist = distribution(pixels);

  return {
    tokenId,
    owner: owner.owner,
    pixels,
    traits,
    canvas,
    diff,
    versions,
    agent,
    density: d,
    distribution: dist,
    history: complexity(canvas, versions),
    archetype: archetype(traits, d, dist),
  };
}
