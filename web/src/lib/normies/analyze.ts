import type { CanvasInfo, Version } from "./types";

const W = 40;
const H = 40;
const TOTAL = W * H;

export type Distribution = {
  topMass: number;
  bottomMass: number;
  leftMass: number;
  rightMass: number;
  centerMass: number;
  edgeMass: number;
  quadrants: { tl: number; tr: number; bl: number; br: number };
};

export type HistoryComplexity = {
  versionCount: number;
  totalChurn: number;
  avgChurnPerEdit: number;
  transformerDiversity: number;
  isVirgin: boolean;
};

export function density(pixels: string): number {
  let count = 0;
  for (let i = 0; i < pixels.length; i++) {
    if (pixels.charCodeAt(i) === 49) count++; // '1'
  }
  return count / TOTAL;
}

export function distribution(pixels: string): Distribution {
  let top = 0,
    bottom = 0,
    left = 0,
    right = 0;
  let tl = 0,
    tr = 0,
    bl = 0,
    br = 0;
  let center = 0,
    edge = 0;
  let total = 0;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (pixels.charCodeAt(y * W + x) !== 49) continue;
      total++;

      if (y < H / 2) top++;
      else bottom++;
      if (x < W / 2) left++;
      else right++;

      const inTop = y < H / 2;
      const inLeft = x < W / 2;
      if (inTop && inLeft) tl++;
      else if (inTop) tr++;
      else if (inLeft) bl++;
      else br++;

      // inner 20x20 = center, ring outside = edge
      if (x >= 10 && x < 30 && y >= 10 && y < 30) center++;
      else edge++;
    }
  }

  const n = Math.max(total, 1);
  return {
    topMass: top / n,
    bottomMass: bottom / n,
    leftMass: left / n,
    rightMass: right / n,
    centerMass: center / n,
    edgeMass: edge / n,
    quadrants: { tl, tr, bl, br },
  };
}

export function complexity(
  info: CanvasInfo,
  versions: Version[]
): HistoryComplexity {
  const versionCount = versions.length;
  const totalChurn = versions.reduce((s, v) => s + v.changeCount, 0);
  const transformers = new Set(versions.map((v) => v.transformer.toLowerCase()));
  return {
    versionCount,
    totalChurn,
    avgChurnPerEdit: versionCount === 0 ? 0 : totalChurn / versionCount,
    transformerDiversity: transformers.size,
    isVirgin: !info.customized && versionCount === 0,
  };
}
