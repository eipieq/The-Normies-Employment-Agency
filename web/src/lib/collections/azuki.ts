import { getAddress, parseAbi } from "viem";
import {
  alchemyNftKey,
  fetchTokenMetadata,
  publicClient,
  resolveTokenUri,
} from "../evm";
import type { CollectionAdapter } from "./types";

const AZUKI = getAddress("0xed5af388653567Af2f388e6224dc7c4b3241c544");

const abi = parseAbi([
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
]);

type AzukiMetadata = {
  name?: string;
  image?: string;
  attributes?: { trait_type: string; value: string }[];
};

async function loadFromAlchemy(tokenId: number): Promise<AzukiMetadata | null> {
  const key = alchemyNftKey();
  if (!key) return null;

  const url = new URL(`https://eth-mainnet.g.alchemy.com/nft/v3/${key}/getNFTMetadata`);
  url.searchParams.set("contractAddress", AZUKI);
  url.searchParams.set("tokenId", String(tokenId));

  const res = await fetch(url, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(10_000) });
  if (!res.ok) return null;

  const data = await res.json();
  const meta = data.raw?.metadata ?? data.metadata ?? {};

  return {
    name: data.name ?? meta.name,
    image: data.image?.cachedUrl ?? data.image?.originalUrl ?? meta.image,
    attributes: meta.attributes,
  };
}

async function loadFromChain(tokenId: number): Promise<AzukiMetadata> {
  const uri = await publicClient.readContract({
    address: AZUKI,
    abi,
    functionName: "tokenURI",
    args: [BigInt(tokenId)],
  });

  const res = await fetchTokenMetadata(uri);
  return res.json() as Promise<AzukiMetadata>;
}

async function loadMetadata(tokenId: number): Promise<AzukiMetadata> {
  const alchemy = await loadFromAlchemy(tokenId);
  if (alchemy) return alchemy;
  return loadFromChain(tokenId);
}

function portraitSrc(image?: string) {
  if (!image) return "";
  if (image.startsWith("ipfs://")) return resolveTokenUri(image);
  return image;
}

function buildPrompt(tokenId: number, meta: AzukiMetadata): string {
  const traits = (meta.attributes ?? [])
    .map((a) => `${a.trait_type}: ${a.value}`)
    .join("\n");

  return `## azuki #${tokenId} dossier

### metadata name
${meta.name ?? `Azuki #${tokenId}`}

### traits
${traits || "no traits in metadata"}

### collection context
azuki is a 10k anime avatar collection. holders belong to the garden, a web3-native anime brand community. personalities should feel like garden members: stylish, self-possessed, culturally fluent, sometimes aloof, never generic assistant energy.

generate the persona object for this azuki.`;
}

export const azukiAdapter: CollectionAdapter = {
  meta: {
    slug: "azuki",
    name: "azuki",
    label: "azuki",
    contract: AZUKI,
    maxTokenId: 9999,
    openseaUrl: "https://opensea.io/collection/azuki",
  },

  async loadDossier(tokenId: number) {
    const [meta, owner] = await Promise.all([
      loadMetadata(tokenId),
      publicClient.readContract({
        address: AZUKI,
        abi,
        functionName: "ownerOf",
        args: [BigInt(tokenId)],
      }),
    ]);

    const tags = (meta.attributes ?? [])
      .slice(0, 5)
      .map((a) => a.value);

    return {
      collection: "azuki",
      tokenId,
      owner,
      portrait: {
        kind: "image",
        src: portraitSrc(meta.image),
      },
      tags,
      displayName: meta.name ?? null,
      cacheVersion: "0",
      prompt: buildPrompt(tokenId, meta),
    };
  },

  async isOwner(tokenId, address) {
    const owner = await publicClient.readContract({
      address: AZUKI,
      abi,
      functionName: "ownerOf",
      args: [BigInt(tokenId)],
    });
    return owner.toLowerCase() === address.toLowerCase();
  },
};
