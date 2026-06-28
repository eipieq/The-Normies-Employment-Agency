import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/session";
import { getCollection, parseTokenId, NormiesApiError } from "@/lib/collections";
import { isOwner } from "@/lib/ownership";
import { getPersona } from "@/lib/persona";

type Params = { params: Promise<{ collection: string; id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { collection: slug, id } = await params;
  const adapter = getCollection(slug);
  const tokenId = parseTokenId(id);
  if (!adapter || tokenId === null) return new Response("bad request", { status: 400 });

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.address) return new Response("unauthenticated", { status: 401 });

  const owns = await isOwner(adapter.meta.slug, tokenId, session.address).catch(() => false);
  if (!owns) return new Response("not owner", { status: 403 });

  let dossier;
  try {
    dossier = await adapter.loadDossier(tokenId);
  } catch (e) {
    if (e instanceof NormiesApiError && e.status === 404) {
      return new Response("not found", { status: 404 });
    }
    throw e;
  }

  const persona = await getPersona(adapter.meta.slug, tokenId, dossier);

  return Response.json({
    workStyle: persona.workStyle,
    strengths: persona.strengths,
    blindSpots: persona.blindSpots,
    systemPrompt: persona.systemPrompt,
  });
}
