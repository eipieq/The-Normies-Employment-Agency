import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

function rpcUrl() {
  if (process.env.MAINNET_RPC_URL) return process.env.MAINNET_RPC_URL;
  if (process.env.ALCHEMY_API_KEY) {
    return `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
  }
  return "https://ethereum-rpc.publicnode.com";
}

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(rpcUrl(), { timeout: 15_000 }),
});

export function resolveTokenUri(uri: string): string {
  if (uri.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${uri.slice(7)}`;
  }
  return uri;
}

export function tokenUriCandidates(uri: string): string[] {
  if (!uri.startsWith("ipfs://")) return [uri];
  const path = uri.slice(7);
  return [
    `https://ipfs.io/ipfs/${path}`,
    `https://dweb.link/ipfs/${path}`,
    `https://gateway.pinata.cloud/ipfs/${path}`,
  ];
}

export async function fetchTokenMetadata(uri: string): Promise<Response> {
  for (const url of tokenUriCandidates(uri)) {
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) return res;
  }
  throw new Error(`metadata fetch failed for ${uri}`);
}

export function alchemyNftKey() {
  if (process.env.ALCHEMY_API_KEY) return process.env.ALCHEMY_API_KEY;
  if (process.env.NODE_ENV === "development") return "demo";
  return null;
}
