import { loadFeatures } from "@/lib/normies";
import { getPersona } from "@/lib/persona";
import { HOMEPAGE_EXAMPLES } from "@/lib/featured-normies";
import { CardsMarquee } from "@/components/cards-marquee";
import { PillButtonLink } from "@/components/pill-button";

export const revalidate = 3600;

async function loadExample(id: number) {
  const features = await loadFeatures(id);
  const persona = await getPersona(id, features);
  return { id, features, persona };
}

export default async function Home() {
  const results = await Promise.allSettled(HOMEPAGE_EXAMPLES.map(loadExample));
  const examples = results.flatMap(r => r.status === "fulfilled" ? [r.value] : []);

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
          <PillButtonLink href="/explore">
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
        <section id="examples" className="pt-8 pb-32">
          <CardsMarquee
            cards={examples.map(({ id, features, persona }) => ({
              id,
              pixels: features.pixels,
              jobTitle: persona.jobTitle,
              oneLiner: persona.oneLiner,
            }))}
          />
        </section>
      )}

      {/* how it works */}
      <section className="px-6 pb-32">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
              {[
                { step: "01", title: "Read the dossier", body: "Pixel density, spatial distribution, trait combinations, canvas edit history. Every normie's data tells a different story." },
                { step: "02", title: "Place them in a role", body: "An AI placement officer reads the dossier and assigns a job title, one-liner, work style, strengths, and blind spots." },
                { step: "03", title: "Meet your coworker", body: "Connect your wallet to verify ownership. Unlock the full employment profile and open a chat with your normie." },
              ].map(({ step, title, body }, i, arr) => (
                <div
                  key={step}
                  className={`bg-neutral-100 p-3.5 space-y-2 ${
                    i === 0
                    ? "rounded-tl-[10px] rounded-tr-[10px] rounded-br-[5px] rounded-bl-[5px] sm:rounded-tl-[10px] sm:rounded-tr-[5px] sm:rounded-br-[5px] sm:rounded-bl-[10px]"
                    : i === arr.length - 1
                    ? "rounded-tl-[5px] rounded-tr-[5px] rounded-br-[10px] rounded-bl-[10px] sm:rounded-tl-[5px] sm:rounded-tr-[10px] sm:rounded-br-[10px] sm:rounded-bl-[5px]"
                    : "rounded-[5px]"
                  }`}
                >
                  <p className="font-mono text-sm text-neutral-400">{step}</p>
                  <p className="font-pixel-square text-base text-neutral-900">{title}</p>
                  <p className="text-sm font-medium text-neutral-500 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* coming soon */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-1">
            <div className="bg-neutral-100 rounded-[10px] p-3.5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-pixel-square text-base text-neutral-900">More features coming</p>
                <p className="text-sm font-medium text-neutral-500">
                  Normie works is the first feature. Payroll, performance reviews, and the union are next.
                </p>
              </div>
              <p className="text-sm font-medium text-neutral-400 shrink-0 ml-4">Soon™</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
