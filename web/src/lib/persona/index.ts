import { getCollection } from "../collections";
import type { CollectionSlug, Dossier } from "../collections/types";
import { generatePersona } from "./generator";
import { cacheGet, cacheSet } from "./cache";
import type { Persona } from "./types";

export type { Persona };
export { generatePersona };

export async function getPersona(
  collection: CollectionSlug,
  tokenId: number,
  dossier?: Dossier,
): Promise<Persona> {
  const adapter = getCollection(collection)!;
  const d = dossier ?? await adapter.loadDossier(tokenId);

  const cached = await cacheGet(collection, tokenId, d.cacheVersion);
  if (cached) return cached;

  const persona = await generatePersona(d);
  await cacheSet(collection, tokenId, d.cacheVersion, persona);
  return persona;
}
