import { azukiAdapter } from "./azuki";
import { normiesAdapter, NormiesApiError } from "./normies";
import type { CollectionAdapter, CollectionSlug } from "./types";

const adapters: Record<CollectionSlug, CollectionAdapter> = {
  normies: normiesAdapter,
  azuki: azukiAdapter,
};

export function listCollections(): CollectionAdapter[] {
  return Object.values(adapters);
}

export function getCollection(slug: string): CollectionAdapter | null {
  if (slug in adapters) return adapters[slug as CollectionSlug];
  return null;
}

export function parseTokenId(id: string): number | null {
  const n = parseInt(id, 10);
  if (isNaN(n) || n < 0) return null;
  return n;
}

export { NormiesApiError };
export type {
  CollectionSlug,
  CollectionMeta,
  Dossier,
  Portrait,
  CollectionAdapter,
} from "./types";
