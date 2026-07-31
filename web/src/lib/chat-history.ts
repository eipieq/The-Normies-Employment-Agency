import { Redis } from "@upstash/redis";
import type { CollectionSlug } from "@/lib/collections";

export type StoredMessage = {
  role: "user" | "assistant";
  content: string;
  ts: number;
};

const MAX_MESSAGES = 40; // 20 turns

function redis() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function historyKey(collection: CollectionSlug, tokenId: number, address: string) {
  return `agency:history:${collection}:${tokenId}:${address.toLowerCase()}`;
}

function perfKey(collection: CollectionSlug, tokenId: number) {
  return `agency:perf:${collection}:${tokenId}`;
}

export async function loadHistory(
  collection: CollectionSlug,
  tokenId: number,
  address: string,
): Promise<StoredMessage[]> {
  const r = redis();
  if (!r) return [];
  try {
    return await r.lrange<StoredMessage>(historyKey(collection, tokenId, address), 0, -1);
  } catch (err) {
    console.error("[agency:error] history:load redis_error", { collection, tokenId, error: String(err) });
    return [];
  }
}

export async function appendHistory(
  collection: CollectionSlug,
  tokenId: number,
  address: string,
  userContent: string,
  assistantContent: string,
): Promise<void> {
  const r = redis();
  if (!r) return;

  try {
    const ts = Date.now();
    const pipe = r.pipeline();
    pipe.rpush(
      historyKey(collection, tokenId, address),
      { role: "user", content: userContent, ts },
      { role: "assistant", content: assistantContent, ts: ts + 1 },
    );
    pipe.ltrim(historyKey(collection, tokenId, address), -MAX_MESSAGES, -1);
    pipe.hincrby(perfKey(collection, tokenId), "messages", 1);
    pipe.hset(perfKey(collection, tokenId), { lastActive: new Date().toISOString() });
    await pipe.exec();
  } catch (err) {
    console.error("[agency:error] history:append redis_error", { collection, tokenId, error: String(err) });
  }
}
