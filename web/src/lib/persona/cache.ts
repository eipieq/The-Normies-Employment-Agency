// persona cache: upstash redis in prod, filesystem in local dev.

import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import type { Persona } from "./types";

const CACHE_DIR = path.join(process.cwd(), ".cache", "personas");

function cacheKey(tokenId: number, canvasVersion: number) {
  return `persona:${tokenId}:${canvasVersion}`;
}

function fsPath(tokenId: number, canvasVersion: number) {
  return path.join(CACHE_DIR, `${tokenId}-${canvasVersion}.json`);
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

export async function cacheGet(tokenId: number, canvasVersion: number): Promise<Persona | null> {
  if (useRedis()) {
    return (await redis().get<Persona>(cacheKey(tokenId, canvasVersion))) ?? null;
  }

  const p = fsPath(tokenId, canvasVersion);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as Persona;
  } catch {
    return null;
  }
}

export async function cacheSet(tokenId: number, canvasVersion: number, persona: Persona): Promise<void> {
  if (useRedis()) {
    await redis().set(cacheKey(tokenId, canvasVersion), persona);
    return;
  }

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(fsPath(tokenId, canvasVersion), JSON.stringify(persona, null, 2));
}
