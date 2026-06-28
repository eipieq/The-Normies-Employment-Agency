import { cache } from "react";
import { getCollection } from "./collections";
import type { CollectionSlug } from "./collections/types";
import { getPersona } from "./persona";

export const loadWorks = cache(async (collection: CollectionSlug, tokenId: number) => {
  const adapter = getCollection(collection)!;
  const dossier = await adapter.loadDossier(tokenId);
  const persona = await getPersona(collection, tokenId, dossier);
  return { adapter, dossier, persona };
});
