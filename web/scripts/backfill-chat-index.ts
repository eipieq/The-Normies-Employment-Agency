// one-time backfill: the chats index (agency:chats:{address}) was added after
// people had already been chatting, so pre-existing history never got indexed.
// scans agency:history:* keys and zadds each into its owner's chat index.
// run: pnpm backfill-chat-index

import { Redis } from "@upstash/redis";

function redis() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("no redis env vars found");
  return new Redis({ url, token });
}

type StoredMessage = { role: "user" | "assistant"; content: string; ts: number };

async function main() {
  const r = redis();
  const keys = await r.keys("agency:history:*");
  console.log(`found ${keys.length} history keys`);

  let indexed = 0;
  for (const key of keys) {
    // agency:history:{collection}:{tokenId}:{address}
    const [, , collection, tokenId, address] = key.split(":");
    const messages = await r.lrange<StoredMessage>(key, 0, -1);
    const lastTs = messages[messages.length - 1]?.ts ?? Date.now();

    await r.zadd(`agency:chats:${address}`, { score: lastTs, member: `${collection}:${tokenId}` });
    console.log(`  indexed ${collection}:${tokenId} for ${address} (${messages.length} msgs)`);
    indexed++;
  }

  console.log(`\ndone. indexed ${indexed} chat threads.`);
}

main();
