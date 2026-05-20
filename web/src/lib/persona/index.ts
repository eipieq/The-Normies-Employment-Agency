import { loadFeatures, type NormieFeatures } from "../normies";
import { generatePersona } from "./generator";
import { cacheGet, cacheSet } from "./cache";
import type { Persona } from "./types";

export type { Persona };
export { generatePersona };

export async function getPersona(tokenId: number, features?: NormieFeatures): Promise<Persona> {
  const f = features ?? await loadFeatures(tokenId);
  const cv = f.history.versionCount;

  const cached = cacheGet(tokenId, cv);
  if (cached) return cached;

  const persona = await generatePersona(f);
  cacheSet(tokenId, cv, persona);
  return persona;
}
