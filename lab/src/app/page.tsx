import { Section, Lede, Card, PillLink } from "@/components/primitives";
import { AGENCY_URL } from "@/lib/site";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {/* hero */}
      <section className="mx-auto w-full max-w-5xl px-5 pt-16 pb-14 sm:px-8 sm:pt-24 sm:pb-20">
        <p className="label mb-5">Attribute-Rooted Personality Inference</p>
        <h1 className="max-w-3xl font-pixel-square text-3xl leading-[1.15] text-foreground sm:text-5xl">
          Personality should be derived, not invented.
        </h1>
        <div className="prose-lab mt-6 max-w-2xl text-base sm:text-lg">
          <p>
            ARPI Lab is a research lab focused on one problem: how do you derive a
            stable, grounded personality from structured attribute data, and express
            it consistently through a conversational agent?
          </p>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <PillLink href="/methodology">Read the methodology</PillLink>
          <PillLink href="/research" variant="secondary">
            Research agenda
          </PillLink>
        </div>
      </section>

      {/* thesis in the name */}
      <Section label="The thesis" title="The name carries the claim.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Card label="Attribute-Rooted" title="Computed from attributes">
            <p>
              Personality is calculated from structured data the token already
              carries. It is not written by a language model on request.
            </p>
          </Card>
          <Card label="Personality Inference" title="A derived signal">
            <p>
              The output is inferred, not invented. Same input, same personality —
              every time, for as long as the source data holds.
            </p>
          </Card>
        </div>
        <Lede>
          <p className="mt-8">
            Most AI personality systems today are neither. They let the model
            improvise a character on every request, so no two interactions produce
            the same entity. ARPI Lab treats that as a solvable engineering and
            research problem, not an acceptable limitation.
          </p>
        </Lede>
      </Section>

      {/* the core problem */}
      <Section label="The core problem" title="Two failure modes, one root cause.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Card label="Failure 01" title="Instability">
            <p>
              Ask the same agent the same question twice and you get two different
              personalities. The language model is doing all the work, generating the
              character fresh from a prompt each time. There is no canonical version.
              Two requests, two entities.
            </p>
          </Card>
          <Card label="Failure 02" title="Arbitrariness">
            <p>
              Even when a character is defined once, the definition is usually written
              by a human making subjective choices. There is no principled method. The
              system cannot explain why a trait maps to a dimension, and cannot be
              replicated for a new collection without starting over.
            </p>
          </Card>
        </div>
        <Lede>
          <p className="mt-8">
            Both failures share a root cause: the personality is being{" "}
            <em className="not-italic text-foreground">invented</em> rather than{" "}
            <em className="not-italic text-foreground">derived</em>. The fix is to
            separate personality generation from personality expression. The language
            model should never invent the personality. It should only voice one that
            was already determined elsewhere, by a method that is reproducible,
            explicable, and consistent.
          </p>
        </Lede>
      </Section>

      {/* methodology summary */}
      <Section label="The methodology" title="Five steps, one canonical personality.">
        <ol className="grid gap-px overflow-hidden rounded-[var(--radius)] border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["01", "Trait extraction", "Pull tokenURI metadata and any richer on-chain signals the collection exposes."],
            ["02", "Embedding-based OCEAN scoring", "Score each trait against five personality dimensions using distributional semantics."],
            ["03", "Rarity-weighted aggregation", "Rare traits pull harder on the vector than common ones."],
            ["04", "Canonical storage", "Compute once, store against the token id, never regenerate."],
            ["05", "Language model expression", "The model performs the character. It does not author it."],
          ].map(([n, title, body]) => (
            <li key={n} className="bg-background p-5">
              <p className="font-mono text-[13px] text-muted-foreground">{n}</p>
              <h3 className="mt-2 font-pixel-square text-[15px] text-foreground">{title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
          <li className="flex items-center bg-background p-5">
            <PillLink href="/methodology" variant="secondary">
              Full methodology →
            </PillLink>
          </li>
        </ol>
      </Section>

      {/* applied output */}
      <Section label="First applied output" title="The Employment Agency">
        <Lede>
          <p>
            The first product built on the ARPI methodology. It takes any supported
            NFT token, runs it through the pipeline, and assigns a job title, work
            style, and personality description derived from its on-chain data. Holders
            interact with their token as a conversational agent performing the
            assigned character.
          </p>
          <p>
            It demonstrates three things at once: that the methodology produces
            personalities holders find accurate, that the character is stable across
            repeated interactions, and that on-chain attribute data is rich enough to
            support meaningful personality inference.
          </p>
        </Lede>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Card label="Launch collection" title="Normies">
            <p>
              The richest attribute data available: pixel density, spatial
              distribution, edit history, burn count — signals no trait metadata
              carries. The employment framing also fits the collection&apos;s existing
              absurdist, understated quality.
            </p>
          </Card>
          <Card label="Second collection" title="Azuki">
            <p>
              The pipeline is collection-agnostic. The only collection-specific step is
              building the trait weight table, which runs once. Azuki&apos;s 469 traits
              across 13 categories give the scoring system more material than most.
            </p>
          </Card>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <PillLink href={AGENCY_URL} external>
            Visit The Employment Agency ↗
          </PillLink>
          <PillLink href="/output" variant="secondary">
            How it works
          </PillLink>
        </div>
      </Section>

      {/* positioning */}
      <Section label="Positioning" title="The methodology is the asset.">
        <Lede>
          <p>
            ARPI Lab is not a chatbot company and not an NFT product studio. It is a
            research lab that treats personality inference as a technical problem with
            a principled solution, and builds products that demonstrate that solution
            working in the real world.
          </p>
          <p>
            The employment agency is proof of concept. The methodology is the asset.
            The research findings are the contribution.
          </p>
          <p>
            NFTs are the starting domain because the data is public, immutable, and
            already rich with semantic content — the right place to develop and
            validate the approach. If the methodology proves out, the same pipeline
            applies anywhere structured attribute data exists: game characters,
            synthetic agents, digital identities.
          </p>
        </Lede>
      </Section>
    </main>
  );
}
