import crypto from "crypto";
import { activateSubscription } from "@/lib/subscription";

type NowPaymentsIPN = {
  payment_id: number;
  payment_status: string;
  order_id: string; // wallet address — set by us at checkout
  plan_id?: string;
  price_amount: number;
  price_currency: string;
  actually_paid: number;
  pay_currency: string;
};

// Sort object keys alphabetically (recursive) — required for HMAC verification
function sortKeys(obj: unknown): unknown {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return obj;
  return Object.fromEntries(
    Object.entries(obj as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => [k, sortKeys(v)]),
  );
}

function verifySignature(body: unknown, sig: string): boolean {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret) return false;
  const hmac = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(sortKeys(body)))
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(sig));
}

export async function POST(req: Request) {
  const sig = req.headers.get("x-nowpayments-sig");
  if (!sig) return new Response("missing signature", { status: 400 });

  let body: NowPaymentsIPN;
  try {
    body = (await req.json()) as NowPaymentsIPN;
  } catch {
    return new Response("invalid json", { status: 400 });
  }

  if (!verifySignature(body, sig)) {
    return new Response("invalid signature", { status: 401 });
  }

  if (body.payment_status === "finished") {
    const address = body.order_id;
    if (address?.startsWith("0x")) {
      const planId = body.plan_id ?? process.env.NOWPAYMENTS_PLAN_ID ?? "unknown";
      await activateSubscription(address, planId);
    }
  }

  return new Response(null, { status: 200 });
}
