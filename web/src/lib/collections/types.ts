import type { Persona } from "../persona/types";

export type CollectionSlug = "normies" | "azuki";

export type CollectionMeta = {
  slug: CollectionSlug;
  name: string;
  label: string; // "normie", "azuki"
  contract: `0x${string}` | null;
  maxTokenId: number;
  openseaUrl: string;
};

export type Portrait =
  | { kind: "pixels"; pixels: string }
  | { kind: "image"; src: string };

export type Dossier = {
  collection: CollectionSlug;
  tokenId: number;
  owner: string;
  portrait: Portrait;
  tags: string[];
  displayName: string | null;
  cacheVersion: string;
  prompt: string;
};

export type CollectionAdapter = {
  meta: CollectionMeta;
  loadDossier(tokenId: number): Promise<Dossier>;
  isOwner(tokenId: number, address: string): Promise<boolean>;
};

export type PersonaResult = {
  dossier: Dossier;
  persona: Persona;
};
