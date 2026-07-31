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
