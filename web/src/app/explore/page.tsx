import type { Metadata } from "next";
import { loadFeatures } from "@/lib/normies";
import { getPersona } from "@/lib/persona";
import { FEATURED_NORMIES } from "@/lib/featured-normies";
import { NormiePreviewCard } from "@/components/normie-preview-card";
import { ExploreSearch } from "@/components/explore-search";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Explore — the normies employment agency",
  description: "Browse featured normies and search by token ID.",
};

async function loadFeatured(id: number) {
  const features = await loadFeatures(id);
  const persona = await getPersona(id, features);
  return { id, features, persona };
}

export default async function ExplorePage() {
  const results = await Promise.allSettled(FEATURED_NORMIES.map(loadFeatured));
  const featured = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));

  return (
    <main className="flex flex-1 flex-col px-6 py-12 pb-24">
      <div className="max-w-4xl mx-auto w-full space-y-10">
        <div className="space-y-4">
          <h1 className="font-pixel-square text-3xl text-neutral-900">Explore</h1>
          <p className="text-base text-neutral-500 max-w-lg">
            Search any normie by token ID, or browse our featured placements.
          </p>
          <ExploreSearch />
        </div>

        {featured.length > 0 && (
          <section className="space-y-4">
            <p className="text-sm font-medium text-neutral-400">Featured placements</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              {featured.map(({ id, features, persona }) => (
                <NormiePreviewCard
                  key={id}
                  tokenId={id}
                  pixels={features.pixels}
                  jobTitle={persona.jobTitle}
                  oneLiner={persona.oneLiner}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
