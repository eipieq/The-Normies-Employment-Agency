import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { sessionOptions, type SessionData } from "@/lib/session";
import { getCollection, parseTokenId, NormiesApiError } from "@/lib/collections";
import { isOwner } from "@/lib/ownership";
import { getPersona } from "@/lib/persona";
import { checkChatRateLimit } from "@/lib/chat-rate-limit";
import { veniceModel } from "@/lib/venice";

type Params = { params: Promise<{ collection: string; id: string }> };

export async function POST(req: Request, { params }: Params) {
  const { collection: slug, id } = await params;
  const adapter = getCollection(slug);
  const tokenId = parseTokenId(id);
  if (!adapter || tokenId === null) return new Response("bad id", { status: 400 });

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.address) return new Response("unauthenticated", { status: 401 });

  const owns = await isOwner(adapter.meta.slug, tokenId, session.address).catch(() => false);
  if (!owns) return new Response("not owner", { status: 403 });

  const { ok, remaining } = await checkChatRateLimit(
    session.address,
    `${adapter.meta.slug}:${tokenId}`,
  );
  if (!ok) {
    return new Response("rate limit exceeded", {
      status: 429,
      headers: { "X-RateLimit-Remaining": String(remaining) },
    });
  }

  const { messages } = (await req.json()) as { messages: UIMessage[] };

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

  const result = streamText({
    model: veniceModel(),
    system: persona.systemPrompt,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 1024,
  });

  return result.toUIMessageStreamResponse({
    headers: { "X-RateLimit-Remaining": String(remaining) },
  });
}
