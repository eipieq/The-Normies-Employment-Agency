import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import type { CollectionSlug } from "../collections/types";
import type { Persona } from "./types";

const CACHE_DIR = path.join(process.cwd(), ".cache", "personas");

function cacheKey(collection: CollectionSlug, tokenId: number, version: string) {
  return `agency:persona:${collection}:${tokenId}:${version}`;
}

function fsPath(collection: CollectionSlug, tokenId: number, version: string) {
  return path.join(CACHE_DIR, `${collection}-${tokenId}-${version}.json`);
}

function redisUrl() {
  return process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
}

function redisToken() {
  return process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
}

function useRedis() {
  return Boolean(redisUrl() && redisToken());
}

function redis() {
  return new Redis({ url: redisUrl()!, token: redisToken()! });
}

export async function cacheGet(
  collection: CollectionSlug,
  tokenId: number,
  version: string,
): Promise<Persona | null> {
  if (useRedis()) {
    try {
      return (await redis().get<Persona>(cacheKey(collection, tokenId, version))) ?? null;
    } catch (err) {
      console.error("[agency:error] persona:cache_get redis_error", { collection, tokenId, error: String(err) });
      return null;
    }
  }

  const p = fsPath(collection, tokenId, version);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as Persona;
  } catch {
    return null;
  }
}

const VALID_SLUGS = new Set<string>(["normies", "azuki"]);

export async function listCachedTokens(): Promise<
  { collection: CollectionSlug; tokenId: number }[]
> {
  if (useRedis()) {
    try {
      const keys = await redis().keys("agency:persona:*");
      const seen = new Set<string>();
      const result: { collection: CollectionSlug; tokenId: number }[] = [];
      for (const key of keys) {
        // agency:persona:{collection}:{tokenId}:{version}
        const parts = key.split(":");
        if (parts.length < 5) continue;
        const collection = parts[2];
        const tokenId = parseInt(parts[3], 10);
        if (!VALID_SLUGS.has(collection) || isNaN(tokenId)) continue;
        const k = `${collection}:${tokenId}`;
        if (seen.has(k)) continue;
        seen.add(k);
        result.push({ collection: collection as CollectionSlug, tokenId });
      }
      return result;
    } catch (err) {
      console.error("[agency:error] persona:list_cached_tokens redis_error", { error: String(err) });
      return [];
    }
  }

  try {
    if (!fs.existsSync(CACHE_DIR)) return [];
    const files = fs.readdirSync(CACHE_DIR);
    const seen = new Set<string>();
    const result: { collection: CollectionSlug; tokenId: number }[] = [];
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      // {collection}-{tokenId}-{version}.json
      const m = file.match(/^(normies|azuki)-(\d+)-/);
      if (!m) continue;
      const collection = m[1] as CollectionSlug;
      const tokenId = parseInt(m[2], 10);
      const k = `${collection}:${tokenId}`;
      if (seen.has(k)) continue;
      seen.add(k);
      result.push({ collection, tokenId });
    }
    return result;
  } catch {
    return [];
  }
}

export async function cacheSet(
  collection: CollectionSlug,
  tokenId: number,
  version: string,
  persona: Persona,
): Promise<void> {
  if (useRedis()) {
    try {
      await redis().set(cacheKey(collection, tokenId, version), persona);
    } catch (err) {
      console.error("[agency:error] persona:cache_set redis_error", { collection, tokenId, error: String(err) });
    }
    return;
  }

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(fsPath(collection, tokenId, version), JSON.stringify(persona, null, 2));
}
