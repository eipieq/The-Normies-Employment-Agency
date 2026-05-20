import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/session";
import { isOwner } from "@/lib/ownership";
import { loadFeatures, NormiesApiError } from "@/lib/normies";
import { getPersona } from "@/lib/persona";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const tokenId = parseInt(id);
  if (isNaN(tokenId)) return new Response("bad id", { status: 400 });

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.address) return new Response("unauthenticated", { status: 401 });

  // ownership check — always live, never cached.
  const owns = await isOwner(tokenId, session.address).catch(() => false);
  if (!owns) return new Response("not your normie", { status: 403 });

  // load + generate (persona cache handles repeat calls).
  let features;
  try {
    features = await loadFeatures(tokenId);
  } catch (e) {
    if (e instanceof NormiesApiError && e.status === 404) {
      return new Response("not found", { status: 404 });
    }
    throw e;
  }

  const persona = await getPersona(tokenId, features);

  return Response.json({
    workStyle: persona.workStyle,
    strengths: persona.strengths,
    blindSpots: persona.blindSpots,
    systemPrompt: persona.systemPrompt,
  });
}
