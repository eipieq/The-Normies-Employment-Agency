import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { sessionOptions, type SessionData } from "@/lib/session";
import { isOwner } from "@/lib/ownership";
import { loadFeatures, NormiesApiError } from "@/lib/normies";
import { getPersona } from "@/lib/persona";
import { checkChatRateLimit } from "@/lib/chat-rate-limit";
import { veniceModel } from "@/lib/venice";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const tokenId = parseInt(id);
  if (isNaN(tokenId)) return new Response("bad id", { status: 400 });

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.address) return new Response("unauthenticated", { status: 401 });

  const owns = await isOwner(tokenId, session.address).catch(() => false);
  if (!owns) return new Response("not your normie", { status: 403 });

  const { ok, remaining } = await checkChatRateLimit(session.address, tokenId);
  if (!ok) {
    return new Response("rate limit exceeded", {
      status: 429,
      headers: { "X-RateLimit-Remaining": String(remaining) },
    });
  }

  const { messages } = (await req.json()) as { messages: UIMessage[] };

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
