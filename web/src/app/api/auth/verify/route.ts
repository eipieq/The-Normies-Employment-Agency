import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { parseSiweMessage } from "viem/siwe";
import { recoverMessageAddress } from "viem";
import { sessionOptions, type SessionData } from "@/lib/session";

export async function POST(req: Request) {
  const { message, signature } = await req.json() as { message: string; signature: `0x${string}` };

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  // parse the siwe message and validate nonce
  const parsed = parseSiweMessage(message);
  if (!parsed.nonce || parsed.nonce !== session.nonce) {
    return new Response("invalid nonce", { status: 422 });
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
