import type { Metadata } from "next";
import { Section, Lede, Card, PillLink } from "@/components/primitives";
import { AGENCY_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Output — The Employment Agency",
  description:
    "The Employment Agency is the first product built on the ARPI methodology: NFT tokens assigned a job title, work style, and personality derived from on-chain data.",
};

export default function OutputPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-5xl px-5 pt-14 pb-10 sm:px-8 sm:pt-20">
        <p className="label mb-4">First applied output</p>
        <h1 className="max-w-3xl font-pixel-square text-2xl leading-tight text-foreground sm:text-4xl">
          The Employment Agency
        </h1>
        <div className="prose-lab mt-5 max-w-2xl text-base">
          <p>
            Any supported NFT token, run through the ARPI pipeline, comes out with a
            job title, a work style, and a personality description derived from its
            on-chain data. Holders then interact with their token as a conversational
            agent performing that character.
          </p>
        </div>
        <div className="mt-7">
          <PillLink href={AGENCY_URL} external>
            Visit The Employment Agency ↗
          </PillLink>
        </div>
      </section>

      <Section label="What it demonstrates" title="Three claims, one product.">
        <div className="grid gap-5 sm:grid-cols-3">
          <Card label="Claim 01" title="Accuracy">
            <p>
              That the methodology produces personalities holders recognise as fitting
              their token.
            </p>
          </Card>
          <Card label="Claim 02" title="Stability">
            <p>
              That the character holds across repeated interactions, rather than
              drifting between sessions.
            </p>
          </Card>
          <Card label="Claim 03" title="Sufficiency">
            <p>
              That on-chain attribute data is rich enough to support meaningful
              personality inference at all.
            </p>
          </Card>
        </div>
      </Section>

      <Section label="Collections">
        <div className="grid gap-5 sm:grid-cols-2">
          <Card label="Launch collection" title="Normies">
            <p>
              The richest attribute data of any available collection: pixel density,
              spatial distribution of filled pixels, edit history, burn count — signals
              unavailable from trait metadata alone.
            </p>
            <p>
              The employment framing fits naturally. Normies already carry an
              absurdist, understated quality that the job-title format amplifies.
            </p>
          </Card>
          <Card label="Second collection" title="Azuki">
            <p>
              Added after Normies reached initial traction. The pipeline is
              collection-agnostic — the only collection-specific step is building the
              trait weight table, which runs once per collection.
            </p>
            <p>
              Azuki&apos;s 469 traits across 13 categories give the scoring system more
              material to work with than most collections.
            </p>
          </Card>
        </div>
      </Section>

      <Section label="Where the personality lives" title="Outside the model, on purpose.">
        <Lede>
          <p>
            The agency stores a canonical persona per token and passes it to the
            language model as a character sheet. The model never authors the
            personality — it voices one that was already computed. That separation is
            the whole point: it is what makes the same token behave like the same
            entity across every conversation.
          </p>
          <p>
            Ownership is verified on-chain before the gated profile and chat unlock, so
            the agent a holder talks to is bound to a token they actually hold.
          </p>
        </Lede>
        <div className="mt-8 flex flex-wrap gap-3">
          <PillLink href="/methodology" variant="secondary">
            How the persona is computed →
          </PillLink>
        </div>
      </Section>
    </main>
  );
}
