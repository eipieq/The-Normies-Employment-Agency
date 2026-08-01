import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/session";
import { getCollection, parseTokenId, NormiesApiError } from "@/lib/collections";
import { isOwner } from "@/lib/ownership";
import { getPersona } from "@/lib/persona";
import { isSubscribed } from "@/lib/subscription";
import { checkChatRateLimit } from "@/lib/chat-rate-limit";
import {
  generateDecision,
  hashDecision,
  storeDecision,
  updateAttestationUid,
  loadDecisions,
} from "@/lib/decisions";

type Params = { params: Promise<{ collection: string; id: string }> };

// POST — generate a new decision
export async function POST(req: Request, { params }: Params) {
  const { collection: slug, id } = await params;
  const adapter = getCollection(slug);
  const tokenId = parseTokenId(id);
  if (!adapter || tokenId === null) return new Response("bad id", { status: 400 });

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.address) return new Response("unauthenticated", { status: 401 });

  const [owns, subscribed] = await Promise.all([
    isOwner(adapter.meta.slug, tokenId, session.address).catch(() => false),
    isSubscribed(session.address),
  ]);
  if (!owns) return new Response("not owner", { status: 403 });
  if (!subscribed) return new Response("subscription required", { status: 402 });

  const { ok } = await checkChatRateLimit(session.address, `decisions:${adapter.meta.slug}:${tokenId}`);
  if (!ok) return new Response("rate limit exceeded", { status: 429 });

  let dossier;
  try {
    dossier = await adapter.loadDossier(tokenId);
  } catch (e) {
    if (e instanceof NormiesApiError && e.status === 404) return new Response("not found", { status: 404 });
    throw e;
  }

  const persona = await getPersona(adapter.meta.slug, tokenId, dossier);
  const text = await generateDecision(persona, adapter.meta.slug, tokenId);
  const ts = Date.now();
  const hash = hashDecision(text, tokenId, ts);

  const decision = { hash, text, tokenId, collection: adapter.meta.slug, ts };
  await storeDecision(decision);

  return Response.json(decision);
}

// PATCH — save attestation UID after client-side EAS attest tx confirms
export async function PATCH(req: Request, { params }: Params) {
  const { collection: slug, id } = await params;
  const adapter = getCollection(slug);
  const tokenId = parseTokenId(id);
  if (!adapter || tokenId === null) return new Response("bad id", { status: 400 });

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.address) return new Response("unauthenticated", { status: 401 });

  const [owns, subscribed] = await Promise.all([
    isOwner(adapter.meta.slug, tokenId, session.address).catch(() => false),
    isSubscribed(session.address),
  ]);
  if (!owns) return new Response("not owner", { status: 403 });
  if (!subscribed) return new Response("subscription required", { status: 402 });

  const { hash, uid } = (await req.json()) as { hash: string; uid: string };
  if (!hash || !uid) return new Response("missing hash or uid", { status: 400 });

  const updated = await updateAttestationUid(hash, uid, adapter.meta.slug, tokenId);
  if (!updated) return new Response("not found or unauthorized", { status: 404 });
  return new Response(null, { status: 204 });
}

// GET — load decision history for the gated panel
export async function GET(_req: Request, { params }: Params) {
  const { collection: slug, id } = await params;
  const adapter = getCollection(slug);
  const tokenId = parseTokenId(id);
  if (!adapter || tokenId === null) return new Response("bad id", { status: 400 });

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.address) return new Response("unauthenticated", { status: 401 });

  const [owns, subscribed] = await Promise.all([
    isOwner(adapter.meta.slug, tokenId, session.address).catch(() => false),
    isSubscribed(session.address),
  ]);
  if (!owns) return new Response("not owner", { status: 403 });
  if (!subscribed) return new Response("subscription required", { status: 402 });

  const decisions = await loadDecisions(adapter.meta.slug, tokenId);
  return Response.json(decisions);
}
