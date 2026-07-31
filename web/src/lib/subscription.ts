import { Redis } from "@upstash/redis";

export type SubRecord = {
  status: "active";
  planId: string;
  activatedAt: number;
  renewsAt?: number;
};

function redis() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function subKey(address: string) {
  return `agency:sub:${address.toLowerCase()}`;
}

export async function getSubscription(address: string): Promise<SubRecord | null> {
  const r = redis();
  if (!r) return null;
  try {
    return await r.get<SubRecord>(subKey(address));
  } catch (err) {
    console.error("[agency:error] subscription:get redis_error", { address, error: String(err) });
    return null;
  }
}

export async function isSubscribed(address: string): Promise<boolean> {
  const sub = await getSubscription(address);
  return sub?.status === "active";
}

// Called from the IPN webhook on each successful payment (initial + renewals).
// TTL = 35 days: covers a 30-day billing cycle with 5-day grace on late renewal.
export async function activateSubscription(
  address: string,
  planId: string,
): Promise<void> {
  const r = redis();
  if (!r) return;
  try {
    const renewsAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    const record: SubRecord = { status: "active", planId, activatedAt: Date.now(), renewsAt };
    await r.set(subKey(address), record, { ex: 35 * 24 * 60 * 60 });
  } catch (err) {
    console.error("[agency:error] subscription:activate redis_error", { address, planId, error: String(err) });
    throw err;
  }
}
