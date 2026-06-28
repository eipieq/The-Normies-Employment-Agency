import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/session";

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  const nonce = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  session.nonce = nonce;
  await session.save();
  return new Response(nonce, { headers: { "Content-Type": "text/plain" } });
}
