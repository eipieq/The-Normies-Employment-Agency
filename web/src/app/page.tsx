import { listCollections } from "@/lib/collections";
import { loadWorks } from "@/lib/load-works";
import { HOMEPAGE_EXAMPLES } from "@/lib/featured-collections";
import { CardsMarquee } from "@/components/cards-marquee";
import { PillButtonLink } from "@/components/pill-button";

export const revalidate = 3600;

const DEV_EXAMPLES = { normies: [6303], azuki: [1] } as const;
const SKIP_DEV_EXAMPLES = true;

async function loadExample(collection: keyof typeof HOMEPAGE_EXAMPLES, id: number) {
  const { dossier, persona } = await loadWorks(collection, id);
  return { collection, id, portrait: dossier.portrait, persona };
}

export default async function Home() {
  const loads =
    process.env.NODE_ENV === "development" && SKIP_DEV_EXAMPLES
      ? []
      : Object.entries(
          process.env.NODE_ENV === "development" ? DEV_EXAMPLES : HOMEPAGE_EXAMPLES,
        ).flatMap(([collection, ids]) =>
          ids.map((id) => loadExample(collection as keyof typeof HOMEPAGE_EXAMPLES, id)),
        );
  const results = await Promise.allSettled(loads);
  const examples = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));

  const collections = listCollections();

  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col items-center justify-center text-center px-4 sm:px-6 py-14 sm:py-20 gap-5">
        <h1 className="font-pixel-square text-3xl sm:text-5xl text-neutral-900 max-w-xl leading-tight">
          Your NFT got a job.
        </h1>
        <p className="text-base text-neutral-500 max-w-lg leading-relaxed px-1">
          We read on-chain data and place your token in a role. Employment card, work profile,
          system prompt, and a coworker to chat with. Gated by wallet ownership.
        </p>
        <div className="flex flex-col items-stretch gap-2 w-full max-w-md sm:max-w-none sm:flex-row sm:items-center sm:justify-center mt-1">
          {collections.map((c) => (
            <PillButtonLink
              key={c.meta.slug}
              href={`/collections/${c.meta.slug}/works/1`}
              variant={c.meta.slug === "normies" ? "primary" : "secondary"}
              className="w-full sm:w-auto capitalize"
            >
              Try {c.meta.name}
            </PillButtonLink>
          ))}
        </div>
      </section>

      {examples.length > 0 && (
        <section id="examples" className="pt-8 pb-32">
          <CardsMarquee
            cards={examples.map(({ collection, id, portrait, persona }) => ({
              collection,
              id,
              portrait,
              jobTitle: persona.jobTitle,
              oneLiner: persona.oneLiner,
            }))}
          />
        </section>
      )}

      <section className="px-6 pb-32">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
              {[
                {
                  step: "01",
                  title: "Read the dossier",
                  body: "Pixels and canvas for normies. Metadata traits for azuki. Every token gets a different signal.",
                },
                {
                  step: "02",
                  title: "Place them in a role",
                  body: "A placement officer assigns job title, work style, strengths, blind spots, and a full system prompt.",
                },
                {
                  step: "03",
                  title: "Meet your coworker",
                  body: "Connect wallet to verify ownership. Unlock the profile and chat with your derived persona.",
                },
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
    </main>
  );
}
