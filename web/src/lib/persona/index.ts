import { loadFeatures } from "../normies";
import { generatePersona } from "./generator";
import { cacheGet, cacheSet } from "./cache";
import type { Persona } from "./types";

export type { Persona };
export { generatePersona };

// canvas version as the cache discriminator. every unique canvas state gets its own persona.
// fallback to 0 when versions is empty (virgin normie, never edited).
function canvasVersion(versionCount: number): number {
  return versionCount;
}

export async function getPersona(tokenId: number): Promise<Persona> {
  const f = await loadFeatures(tokenId);
  const cv = canvasVersion(f.history.versionCount);

  const cached = cacheGet(tokenId, cv);
  if (cached) return cached;

  const persona = await generatePersona(f);
  cacheSet(tokenId, cv, persona);
  return persona;
}
