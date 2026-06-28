// shapes that mirror api.normies.art responses.
// keep these tight to what we actually consume.

export type TraitKey =
  | "Type"
  | "Gender"
  | "Age"
  | "Hair Style"
  | "Facial Feature"
  | "Eyes"
  | "Expression"
  | "Accessory";

export type Traits = {
  raw: string;
  attributes: { trait_type: TraitKey; value: string }[];
};

export type CanvasInfo = {
  actionPoints: number;
  level: number;
  customized: boolean;
  delegate: string;
  delegateSetBy: string;
};

export type CanvasDiff = {
  added: { x: number; y: number }[];
  removed: { x: number; y: number }[];
  addedCount: number;
  removedCount: number;
  netChange: number;
};

export type Owner = {
  tokenId: string;
  owner: string;
};

export type Version = {
  version: number;
  changeCount: number;
  newPixelCount: number;
  transformer: string;
  blockNumber: string;
  timestamp: string;
  txHash: string;
};

export type Holdings = {
  address: string;
  tokenIds: string[];
};

// we only pull name + type from /agents/info; the rest comes from our generator.
export type AgentInfo = {
  tokenId: string;
  agentId: string;
  name: string;
  type: string;
};
