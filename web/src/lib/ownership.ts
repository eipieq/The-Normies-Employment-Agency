import { getCollection, type CollectionSlug } from "./collections";

export async function isOwner(
  collection: CollectionSlug,
  tokenId: number,
  address: string,
): Promise<boolean> {
  const adapter = getCollection(collection);
  if (!adapter) return false;
  return adapter.isOwner(tokenId, address);
}
