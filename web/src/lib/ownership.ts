import { getCollection, type CollectionSlug } from "./collections";

export async function isOwner(
  collection: CollectionSlug,
  tokenId: number,
  address: string,
): Promise<boolean> {
  // Local-dev bypass: only active when NODE_ENV=development AND DEV_OWNER_ADDRESS is set in .env.local
  if (
    process.env.NODE_ENV === "development" &&
    process.env.DEV_OWNER_ADDRESS &&
    address.toLowerCase() === process.env.DEV_OWNER_ADDRESS.toLowerCase()
  ) {
    return true;
  }

  const adapter = getCollection(collection);
  if (!adapter) return false;
  return adapter.isOwner(tokenId, address);
}
