import { loadFeatures } from "@/lib/normies";
import { getPersona } from "@/lib/persona";
import { NormiePreviewCard } from "@/components/normie-preview-card";
import { PillButtonLink } from "@/components/pill-button";

export const revalidate = 3600;

const EXAMPLES = [1, 100, 1337];

async function loadExample(id: number) {
  const features = await loadFeatures(id);
  const persona = await getPersona(id, features);
  return { id, features, persona };
}

export default async function Home() {
  const examples = await Promise.all(EXAMPLES.map(loadExample)).catch(() => []);

  return (
    <main className="flex flex-1 flex-col">
      {/* hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-20 gap-5">
        <h1 className="font-pixel-square text-5xl text-neutral-900 max-w-xl leading-tight">
          Your normie got a job.
        </h1>
        <p className="text-base text-neutral-500 max-w-lg leading-relaxed">
          We read the on-chain data (pixels, traits, canvas history) and place your normie in a role.
          You get an employment card, a work profile, and a coworker to chat with.
        </p>
        <div className="flex items-center gap-2 mt-1">
          <PillButtonLink href="#examples">
            Explore the Talented Normies
          </PillButtonLink>
          <PillButtonLink
            href="https://opensea.io/collection/normies"
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
          >
            Explore on OpenSea
          </PillButtonLink>
        </div>
      </section>

      {/* examples */}
      {examples.length > 0 && (
        <section id="examples" className="px-6 pt-8 pb-32">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              {examples.map(({ id, features, persona }) => (
                <NormiePreviewCard
                  key={id}
                  tokenId={id}
                  pixels={features.pixels}
                  jobTitle={persona.jobTitle}
                  oneLiner={persona.oneLiner}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* how it works */}
      <section className="px-6 pb-32">
        <div className="max-w-3xl mx-auto">
          <div className="bg-neutral-100 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-neutral-900">01. Read the dossier</p>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Pixel density, spatial distribution, trait combinations, canvas edit history.
                Every normie's data tells a different story.
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-neutral-900">02. Place them in a role</p>
              <p className="text-sm text-neutral-500 leading-relaxed">
                An AI placement officer reads the dossier and assigns a job title, one-liner,
                work style, strengths, and blind spots.
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-neutral-900">03. Meet your coworker</p>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Connect your wallet to verify ownership. Unlock the full employment profile
                and open a chat with your normie.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* coming soon */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="border border-neutral-100 rounded-2xl px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">More features coming</p>
              <p className="text-sm text-neutral-400 mt-0.5">
                Normie works is the first feature. Payroll, performance reviews, and the union are next.
              </p>
            </div>
            <p className="text-sm text-neutral-300 shrink-0 ml-4">Soon™</p>
          </div>
        </div>
      </section>
    </main>
  );
}
