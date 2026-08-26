import type { Metadata } from "next";
import { Section, Lede, Step, PillLink } from "@/components/primitives";
import { DIMENSIONS } from "@/lib/anchors";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How ARPI derives a canonical personality vector from on-chain attribute data: trait extraction, embedding-based OCEAN scoring, rarity-weighted aggregation, canonical storage, and language model expression.",
};

export default function MethodologyPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-5xl px-5 pt-14 pb-10 sm:px-8 sm:pt-20">
        <p className="label mb-4">Methodology</p>
        <h1 className="max-w-3xl font-pixel-square text-2xl leading-tight text-foreground sm:text-4xl">
          From attributes to a canonical personality.
        </h1>
        <div className="prose-lab mt-5 max-w-2xl text-base">
          <p>
            The pipeline runs once per token. Its output is a five-dimensional OCEAN
            vector stored against the token id — the canonical personality object that
            every future interaction references rather than regenerates.
          </p>
        </div>
      </section>

      {/* the five steps */}
      <Section label="The pipeline">
        <div className="-mt-7">
          <Step n="01" title="Trait extraction">
            <p>
              Every ERC-721 contract exposes a <code className="font-mono text-[13px] text-foreground">tokenURI</code>{" "}
              function returning metadata JSON with the token&apos;s attributes. ARPI
              pulls this for any given token.
            </p>
            <p>
              For collections with fully on-chain data, additional signals are
              available — pixel density, spatial distribution, edit history, burn
              count. These are incorporated where present.
            </p>
          </Step>

          <Step n="02" title="Embedding-based OCEAN scoring">
            <p>
              A sentence transformer scores each trait against the five OCEAN
              dimensions. Each dimension has two poles defined by anchor phrases
              written to occupy distinct regions of embedding space.
            </p>
            <p>
              For each trait label, the model computes cosine similarity between the
              trait&apos;s embedding and the high-pole centroid, and between the
              trait&apos;s embedding and the low-pole centroid. The difference between
              those two scores is the trait&apos;s contribution to that dimension.
            </p>
            <p>
              Trait scoring is therefore grounded in distributional semantics rather
              than human intuition. &ldquo;Sword&rdquo; scores low on agreeableness not
              because someone decided that, but because its embedding neighbours in the
              pretrained model already carry the association from the training corpus.
            </p>
          </Step>

          <Step n="03" title="Rarity-weighted aggregation">
            <p>
              Trait scores are aggregated across all of a token&apos;s attributes,
              weighted by rarity. A trait shared by 5% of a collection pulls harder on
              the personality vector than one shared by 80%. The result is a
              five-dimensional OCEAN vector specific to that token.
            </p>
          </Step>

          <Step n="04" title="Canonical personality storage">
            <p>
              The vector is computed once and stored against the token id. It is never
              recomputed unless the token&apos;s traits change — which for most
              collections never happens. This is the canonical personality object.
            </p>
          </Step>

          <Step n="05" title="Language model expression">
            <p>
              The language model receives the canonical vector as a character sheet in
              the system prompt. Its job is to perform the character, not invent one.
              Two requests to the same agent produce the same personality because the
              personality lives outside the language model.
            </p>
          </Step>
        </div>
      </Section>

      {/* anchor phrases */}
      <Section
        label="Anchor phrases — current version"
        title="The measurement instrument, published in full."
      >
        <Lede>
          <p className="mb-8">
            Anchor phrases define what the instrument measures. They are averaged into
            pole centroids before any trait is scored, which means the choice of
            phrasing is itself a research variable — see{" "}
            <a
              href="/research#anchor-sensitivity"
              className="text-foreground underline underline-offset-4"
            >
              anchor phrase sensitivity
            </a>
            .
          </p>
        </Lede>

        <div className="space-y-px overflow-hidden rounded-[var(--radius)] border border-border bg-border">
          {DIMENSIONS.map((d) => (
            <div key={d.key} className="bg-background p-5 sm:p-6">
              <div className="mb-4 flex items-baseline gap-3">
                <span className="font-pixel-square text-lg text-foreground">{d.letter}</span>
                <h3 className="font-pixel-square text-[15px] text-foreground">{d.name}</h3>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="label mb-2.5">High pole</p>
                  <ul className="space-y-1.5">
                    {d.high.map((p) => (
                      <li
                        key={p}
                        className="text-[13.5px] leading-relaxed text-muted-foreground"
                      >
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="label mb-2.5">Low pole</p>
                  <ul className="space-y-1.5">
                    {d.low.map((p) => (
                      <li
                        key={p}
                        className="text-[13.5px] leading-relaxed text-muted-foreground"
                      >
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <PillLink href="/research" variant="secondary">
            What we are testing next →
          </PillLink>
        </div>
      </Section>
    </main>
  );
}
