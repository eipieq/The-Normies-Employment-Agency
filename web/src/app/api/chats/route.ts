import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/session";
import { getCollection } from "@/lib/collections";
import { getPersona } from "@/lib/persona";
import { listChatThreads, loadHistory } from "@/lib/chat-history";

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  const address = session.address;
  if (!address) return new Response("unauthenticated", { status: 401 });

  const threads = await listChatThreads(address);

  const results = await Promise.allSettled(
    threads.map(async (t) => {
      const adapter = getCollection(t.collection);
      if (!adapter) return null;

      const [dossier, history] = await Promise.all([
        adapter.loadDossier(t.tokenId),
        loadHistory(t.collection, t.tokenId, address),
      ]);
      const persona = await getPersona(t.collection, t.tokenId, dossier);
      const lastMessage = history[history.length - 1]?.content ?? "";

      return {
        collection: t.collection,
        tokenId: t.tokenId,
        label: adapter.meta.label,
        portrait: dossier.portrait,
        jobTitle: persona.jobTitle,
        lastMessage,
        lastActive: t.lastActive,
      };
    }),
  );

  return Response.json({
    chats: results.flatMap((r) => (r.status === "fulfilled" && r.value ? [r.value] : [])),
  });
}
