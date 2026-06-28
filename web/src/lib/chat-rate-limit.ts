import { Redis } from "@upstash/redis";

const LIMIT = 30;
const WINDOW_SEC = 3600;

function redisUrl() {
  return process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
}

function redisToken() {
  return process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
}

function useRedis() {
  return Boolean(redisUrl() && redisToken());
}

export async function checkChatRateLimit(
  address: string,
  scope: string | number,
): Promise<{ ok: boolean; remaining: number }> {
  if (!useRedis()) return { ok: true, remaining: LIMIT };

  const key = `chat:${address.toLowerCase()}:${scope}`;
  const redis = new Redis({ url: redisUrl()!, token: redisToken()! });
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, WINDOW_SEC);

  return { ok: count <= LIMIT, remaining: Math.max(0, LIMIT - count) };
}
