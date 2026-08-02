import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { parseSiweMessage } from "viem/siwe";
import { recoverMessageAddress } from "viem";
import { sessionOptions, type SessionData } from "@/lib/session";

export async function POST(req: Request) {
  const { message, signature } = await req.json() as { message: string; signature: `0x${string}` };

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  const parsed = parseSiweMessage(message);

  // nonce must match session
  if (!parsed.nonce || parsed.nonce !== session.nonce) {
    return new Response("invalid nonce", { status: 422 });
  }

  // domain must match request origin
  const origin = req.headers.get("origin");
  const expectedDomain = origin ? new URL(origin).host : null;
  if (!expectedDomain || parsed.domain !== expectedDomain) {
    return new Response("domain mismatch", { status: 422 });
  }

  // message must not be expired
  if (parsed.expirationTime && new Date(parsed.expirationTime) < new Date()) {
    return new Response("message expired", { status: 422 });
  }

  // recover signer address from signature
  const recovered = await recoverMessageAddress({ message, signature });
  if (recovered.toLowerCase() !== parsed.address?.toLowerCase()) {
    return new Response("signature mismatch", { status: 422 });
  }

  // valid. store address, clear nonce.
  session.address = recovered;
  session.nonce = undefined;
  await session.save();

  return Response.json({ address: recovered });
}
