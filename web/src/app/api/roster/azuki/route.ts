import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/session";
import { azukiAdapter } from "@/lib/collections/azuki";
import { getPersona } from "@/lib/persona";

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.address) return new Response("unauthenticated", { status: 401 });

  if (!azukiAdapter.getHoldings) {
    return Response.json({ address: session.address, items: [] });
  }

  let tokenIds: number[];
  try {
    tokenIds = await azukiAdapter.getHoldings(session.address);
  } catch (err) {
    console.error("[agency:error] roster:azuki holdings_error", { error: String(err) });
    return new Response("upstream error", { status: 502 });
  }

  const results = await Promise.allSettled(
    tokenIds.map(async (id) => {
      const dossier = await azukiAdapter.loadDossier(id);
      const persona = await getPersona("azuki", id, dossier);
      return {
        tokenId: id,
        portrait: dossier.portrait,
        jobTitle: persona.jobTitle,
        oneLiner: persona.oneLiner,
      };
    }),
  );

  return Response.json({
    address: session.address,
    items: results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : [])),
  });
}
