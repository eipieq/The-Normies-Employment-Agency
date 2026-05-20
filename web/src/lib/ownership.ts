import { normies } from "./normies";

// checks whether address is the current on-chain owner of tokenId.
// always fetches live — never trust cached owner for gating decisions.
export async function isOwner(tokenId: number, address: string): Promise<boolean> {
  const owner = await normies.owner(tokenId);
  return owner.owner.toLowerCase() === address.toLowerCase();
}
