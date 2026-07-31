import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/session";

const NOWPAYMENTS_API = "https://api.nowpayments.io/v1";

export async function POST(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.address) return new Response("unauthenticated", { status: 401 });

  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  const planId = process.env.NOWPAYMENTS_PLAN_ID;
  if (!apiKey || !planId) {
    return new Response("subscription not configured", { status: 503 });
  }

  // Derive base URL from request origin for callback/redirect URLs
  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

  const res = await fetch(`${NOWPAYMENTS_API}/subscriptions`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      plan_id: planId,
      order_id: session.address.toLowerCase(),
      order_description: "The Employment Agency — Holder Pass",
      ipn_callback_url: `${origin}/api/subscriptions/webhook`,
      success_url: `${origin}/subscribed`,
      cancel_url: origin,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("nowpayments checkout error", res.status, body);
    return new Response("payment provider error", { status: 502 });
  }

  const data = (await res.json()) as { payment_url?: string; invoice_url?: string; id?: string };
  const paymentUrl = data.payment_url ?? data.invoice_url;
  if (!paymentUrl) {
    return new Response("no payment url in response", { status: 502 });
  }

  return Response.json({ paymentUrl });
}
