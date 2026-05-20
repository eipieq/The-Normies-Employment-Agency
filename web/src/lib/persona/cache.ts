// filesystem cache for local dev. stores to web/.cache/personas/<key>.json.
// swap for upstash redis via vercel marketplace before prod.

import fs from "fs";
import path from "path";
import type { Persona } from "./types";

const CACHE_DIR = path.join(process.cwd(), ".cache", "personas");

function keyPath(tokenId: number, canvasVersion: number): string {
  return path.join(CACHE_DIR, `${tokenId}-${canvasVersion}.json`);
}

export function cacheGet(tokenId: number, canvasVersion: number): Persona | null {
  const p = keyPath(tokenId, canvasVersion);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as Persona;
  } catch {
    return null;
  }
}

export function cacheSet(tokenId: number, canvasVersion: number, persona: Persona): void {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(keyPath(tokenId, canvasVersion), JSON.stringify(persona, null, 2));
}
