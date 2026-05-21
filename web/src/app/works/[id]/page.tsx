import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadFeatures } from "@/lib/normies";
import { getPersona } from "@/lib/persona";
import { NormiesApiError } from "@/lib/normies";
import { EmploymentCard } from "@/components/employment-card";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const tokenId = parseInt(id);
  if (isNaN(tokenId)) return { title: "not found" };

  try {
    const f = await loadFeatures(tokenId);
    const persona = await getPersona(tokenId, f);
    return {
      title: `normie #${tokenId} — ${persona.jobTitle}`,
      description: persona.oneLiner,
      openGraph: {
        title: `normie #${tokenId} — ${persona.jobTitle}`,
        description: persona.oneLiner,
        images: [`/works/${tokenId}/opengraph-image`],
      },
      twitter: {
        card: "summary_large_image",
        title: `normie #${tokenId} — ${persona.jobTitle}`,
        description: persona.oneLiner,
      },
    };
  } catch {
    return { title: `normie #${tokenId}` };
  }
}

export default async function WorksPage({ params }: Props) {
  const { id } = await params;
  const tokenId = parseInt(id);

  if (isNaN(tokenId) || tokenId < 0) notFound();

  let features;
  try {
    features = await loadFeatures(tokenId);
  } catch (e) {
    if (e instanceof NormiesApiError && e.status >= 400 && e.status < 500) notFound();
    throw e;
  }

  const persona = await getPersona(tokenId, features);

  return (
    <main className="flex flex-1 flex-col items-center justify-start pt-12 pb-24 px-4">
      <EmploymentCard
        tokenId={tokenId}
        pixels={features.pixels}
        persona={persona}
        archetype={features.archetype}
        history={features.history}
        agent={features.agent}
      />
    </main>
  );
}
