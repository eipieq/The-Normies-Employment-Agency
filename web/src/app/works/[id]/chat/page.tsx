import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/session";
import { isOwner } from "@/lib/ownership";
import { loadFeatures, NormiesApiError } from "@/lib/normies";
import { getPersona } from "@/lib/persona";
import { ChatSurface } from "@/components/chat-surface";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const tokenId = parseInt(id);
  if (isNaN(tokenId)) return { title: "not found" };

  try {
    const f = await loadFeatures(tokenId);
    const persona = await getPersona(tokenId, f);
    return {
      title: `chat — normie #${tokenId}`,
      description: persona.oneLiner,
    };
  } catch {
    return { title: `chat — normie #${tokenId}` };
  }
}

export default async function ChatPage({ params }: Props) {
  const { id } = await params;
  const tokenId = parseInt(id);
  if (isNaN(tokenId) || tokenId < 0) notFound();

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.address) redirect(`/works/${tokenId}`);

  const owns = await isOwner(tokenId, session.address).catch(() => false);
  if (!owns) redirect(`/works/${tokenId}`);

  let features;
  try {
    features = await loadFeatures(tokenId);
  } catch (e) {
    if (e instanceof NormiesApiError && e.status >= 400 && e.status < 500) notFound();
    throw e;
  }

  const persona = await getPersona(tokenId, features);

  return (
    <main className="flex flex-1 flex-col items-center px-4 pb-6 pt-6">
      <ChatSurface
        tokenId={tokenId}
        jobTitle={persona.jobTitle}
        pixels={features.pixels}
      />
    </main>
  );
}
