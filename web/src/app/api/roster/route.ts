import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/session";
import { normies, NormiesApiError } from "@/lib/normies";
import { normiesAdapter } from "@/lib/collections/normies";
import { getPersona } from "@/lib/persona";

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.address) return new Response("unauthenticated", { status: 401 });

  let holdings;
  try {
    holdings = await normies.holdings(session.address);
  } catch (e) {
    if (e instanceof NormiesApiError) {
      return new Response("upstream error", { status: 502 });
    }
    throw e;
  }

  const tokenIds = holdings.tokenIds.map(Number).sort((a, b) => a - b);

  const results = await Promise.allSettled(
    tokenIds.map(async (id) => {
      const dossier = await normiesAdapter.loadDossier(id);
      const persona = await getPersona("normies", id, dossier);
      return {
        tokenId: id,
        pixels: dossier.portrait.kind === "pixels" ? dossier.portrait.pixels : "",
        jobTitle: persona.jobTitle,
        oneLiner: persona.oneLiner,
      };
    }),
  );

  return Response.json({
    address: session.address,
    normies: results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : [])),
  });
}
