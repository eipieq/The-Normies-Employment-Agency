import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCollection, parseTokenId, NormiesApiError } from "@/lib/collections";
import type { CollectionSlug } from "@/lib/collections/types";
import { loadWorks } from "@/lib/load-works";
import { EmploymentCard } from "@/components/employment-card";

type Props = { params: Promise<{ collection: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection: slug, id } = await params;
  const adapter = getCollection(slug);
  const tokenId = parseTokenId(id);
  if (!adapter || tokenId === null) return { title: "not found" };

  try {
    const { persona } = await loadWorks(adapter.meta.slug, tokenId);
    return {
      title: `${adapter.meta.label} #${tokenId} — ${persona.jobTitle}`,
      description: persona.oneLiner,
    };
  } catch {
    return { title: `${adapter.meta.label} #${tokenId}` };
  }
}

export default async function CollectionWorksPage({ params }: Props) {
  const { collection: slug, id } = await params;
  const adapter = getCollection(slug);
  const tokenId = parseTokenId(id);
  if (!adapter || tokenId === null || tokenId > adapter.meta.maxTokenId) notFound();

  let data;
  try {
    data = await loadWorks(adapter.meta.slug as CollectionSlug, tokenId);
  } catch (e) {
    if (e instanceof NormiesApiError && e.status >= 400 && e.status < 500) notFound();
    throw e;
  }

  const { dossier, persona } = data;
  const department = await adapter.getDepartment?.(tokenId).catch(() => null) ?? null;

  return (
    <main className="flex flex-1 flex-col items-center justify-start pt-12 pb-24 px-4">
      <EmploymentCard
        collection={adapter.meta}
        tokenId={tokenId}
        portrait={dossier.portrait}
        persona={persona}
        tags={dossier.tags}
        displayName={dossier.displayName}
        department={department}
      />
    </main>
  );
}
