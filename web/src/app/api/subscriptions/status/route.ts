import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/session";
import { getSubscription } from "@/lib/subscription";

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.address) return new Response("unauthenticated", { status: 401 });

  const sub = await getSubscription(session.address);
  return Response.json({
    subscribed: sub?.status === "active",
    renewsAt: sub?.renewsAt ?? null,
  });
}
