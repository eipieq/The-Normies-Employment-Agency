import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/session";
import { getCollection, parseTokenId, NormiesApiError } from "@/lib/collections";
import { isOwner } from "@/lib/ownership";
import { isSubscribed } from "@/lib/subscription";
import { getPersona } from "@/lib/persona";
import { loadHistory } from "@/lib/chat-history";
import { ChatSurface } from "@/components/chat-surface";

type Props = { params: Promise<{ collection: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection: slug, id } = await params;
  const adapter = getCollection(slug);
  const tokenId = parseTokenId(id);
  if (!adapter || tokenId === null) return { title: "not found" };

  try {
    const dossier = await adapter.loadDossier(tokenId);
    const persona = await getPersona(adapter.meta.slug, tokenId, dossier);
    return {
      title: `chat — ${adapter.meta.label} #${tokenId}`,
      description: persona.oneLiner,
    };
  } catch {
    return { title: `chat — ${adapter.meta.label} #${tokenId}` };
  }
}

export default async function CollectionChatPage({ params }: Props) {
  const { collection: slug, id } = await params;
  const adapter = getCollection(slug);
  const tokenId = parseTokenId(id);
  if (!adapter || tokenId === null || tokenId > adapter.meta.maxTokenId) notFound();

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  const worksUrl = `/collections/${slug}/works/${tokenId}`;
  if (!session.address) redirect(worksUrl);

  const [owns, subscribed, history] = await Promise.all([
    isOwner(adapter.meta.slug, tokenId, session.address).catch(() => false),
    isSubscribed(session.address).catch(() => false),
    loadHistory(adapter.meta.slug, tokenId, session.address),
  ]);

  // no history and no access at all: this isn't a past conversation, just a
  // cold link. send them to the public card instead of an empty chat shell.
  if (!owns && history.length === 0) redirect(worksUrl);

  let dossier;
  try {
    dossier = await adapter.loadDossier(tokenId);
  } catch (e) {
    if (e instanceof NormiesApiError && e.status >= 400 && e.status < 500) notFound();
    throw e;
  }

  const persona = await getPersona(adapter.meta.slug, tokenId, dossier);

  const disabled = !owns
    ? {
        message: `you no longer own this ${adapter.meta.label}. you can still read the conversation.`,
        ctaHref: worksUrl,
        ctaLabel: "view card",
      }
    : !subscribed
      ? {
          message: "your holder pass has expired. resubscribe to keep chatting.",
          ctaHref: worksUrl,
          ctaLabel: "renew pass",
        }
      : null;

  return (
    <main className="flex flex-1 flex-col overflow-hidden min-h-0">
      <ChatSurface
        collection={adapter.meta.slug}
        label={adapter.meta.label}
        tokenId={tokenId}
        jobTitle={persona.jobTitle}
        portrait={dossier.portrait}
        initialHistory={history}
        disabled={disabled}
      />
    </main>
  );
}
