import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/session";

const NOWPAYMENTS_API = "https://api.nowpayments.io/v1";
const PRICE_USD = 14.99;

export async function POST(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.address) return new Response("unauthenticated", { status: 401 });

  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) return new Response("subscription not configured", { status: 503 });

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

  // Use the invoice API (requires only x-api-key, not JWT).
  // IPN fires on payment completion — same webhook handler activates the subscription.
  const res = await fetch(`${NOWPAYMENTS_API}/invoice`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price_amount: PRICE_USD,
      price_currency: "usd",
      order_id: session.address.toLowerCase(),
      order_description: "The Employment Agency — Holder Pass (30 days)",
      ipn_callback_url: `${origin}/api/subscriptions/webhook`,
      success_url: `${origin}/subscribed`,
      cancel_url: origin,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("nowpayments invoice error", res.status, body);
    return new Response("payment provider error", { status: 502 });
  }

  const data = (await res.json()) as { invoice_url?: string; id?: string };
  const paymentUrl = data.invoice_url;
  if (!paymentUrl) {
    return new Response("no invoice url in response", { status: 502 });
  }

  return Response.json({ paymentUrl });
}
