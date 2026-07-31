import { generateText } from "ai";
import { keccak256, toBytes } from "viem";
import { Redis } from "@upstash/redis";
import { veniceModel } from "@/lib/venice";
import type { Persona } from "@/lib/persona/types";
import type { CollectionSlug } from "@/lib/collections/types";

export type StoredDecision = {
  hash: string;
  text: string;
  tokenId: number;
  collection: CollectionSlug;
  ts: number;
  attestationUid?: string;
};

function redis() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function preimageKey(hash: string) {
  return `decision:${hash}`;
}

function indexKey(collection: CollectionSlug, tokenId: number) {
  return `decisions:${collection}:${tokenId}`;
}

export async function generateDecision(
  persona: Persona,
  collection: CollectionSlug,
  tokenId: number,
): Promise<string> {
  try {
    const { text } = await generateText({
      model: veniceModel(),
      system: persona.systemPrompt,
      prompt: `You are about to make an autonomous decision as ${collection} #${tokenId}. Write a single sentence (15–40 words) in first person, in your character's voice, describing one concrete decision you are making right now. It can be mundane, professional, or oddly specific. Do not use quotation marks. Do not explain yourself.`,
      maxOutputTokens: 80,
      temperature: 0.9,
    });
    return text.trim().replace(/^["']|["']$/g, "");
  } catch (err) {
    console.error("[agency:error] decision:generate venice_error", {
      collection,
      tokenId,
      error: String(err),
    });
    throw err;
  }
}

export function hashDecision(text: string, tokenId: number, ts: number): `0x${string}` {
  return keccak256(toBytes(`${text}:${tokenId}:${ts}`));
}

export async function storeDecision(decision: StoredDecision): Promise<void> {
  const r = redis();
  if (!r) return;
  try {
    const pipe = r.pipeline();
    pipe.set(preimageKey(decision.hash), decision);
    pipe.lpush(indexKey(decision.collection, decision.tokenId), decision.hash);
    pipe.ltrim(indexKey(decision.collection, decision.tokenId), 0, 19);
    await pipe.exec();
  } catch (err) {
    console.error("[agency:error] decision:store redis_error", {
      collection: decision.collection,
      tokenId: decision.tokenId,
      hash: decision.hash,
      error: String(err),
    });
  }
}

export async function updateAttestationUid(hash: string, uid: string): Promise<void> {
  const r = redis();
  if (!r) return;
  try {
    const existing = await r.get<StoredDecision>(preimageKey(hash));
    if (!existing) return;
    await r.set(preimageKey(hash), { ...existing, attestationUid: uid });
  } catch (err) {
    console.error("[agency:error] decision:attest redis_error", { hash, uid, error: String(err) });
  }
}

export async function loadDecisions(
  collection: CollectionSlug,
  tokenId: number,
): Promise<StoredDecision[]> {
  const r = redis();
  if (!r) return [];
  try {
    const hashes = await r.lrange<string>(indexKey(collection, tokenId), 0, 19);
    if (!hashes.length) return [];
    const items = await Promise.all(
      hashes.map((h) => r.get<StoredDecision>(preimageKey(typeof h === "string" ? h : String(h)))),
    );
    return items.filter((d): d is StoredDecision => d !== null);
  } catch (err) {
    console.error("[agency:error] decision:load redis_error", { collection, tokenId, error: String(err) });
    return [];
  }
}
