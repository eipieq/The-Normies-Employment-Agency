import type { Metadata } from "next";
import { Section, Lede } from "@/components/primitives";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Open research questions at ARPI Lab: validation, anchor phrase sensitivity, persona stability under adversarial prompting, cross-modal consistency, and inter-rater reliability.",
};

const QUESTIONS = [
  {
    id: "validation",
    n: "01",
    title: "Validation study",
    body: [
      "The first research question is whether embedding-based trait scoring produces personality vectors that holders find accurate, compared to manually weighted tables or pure language model assignment.",
      "Design: compute personality vectors three ways for the same token, show holders the resulting descriptions blind, ask which fits best. If embedding-based scoring wins consistently, the methodology has empirical support. If it does not, the failure mode tells us what to fix.",
    ],
    status: "Designing",
  },
  {
    id: "anchor-sensitivity",
    n: "02",
    title: "Anchor phrase sensitivity",
    body: [
      "How much does the choice of anchor phrases shift the output? Running the pipeline with two different anchor sets and measuring variance across a collection tells us whether the measurement instrument is stable, or whether it is secretly just reflecting phrase choices back.",
      "This is the most important thing to know before building anything serious on top of the methodology.",
    ],
    status: "Priority",
  },
  {
    id: "adversarial",
    n: "03",
    title: "Persona stability under adversarial prompting",
    body: [
      "A holder may try to convince their agent it is a different character, or push the conversation in directions that break the assigned persona.",
      "Measuring how well the grounding layer resists this across prompt strategies — and improving it systematically — connects to the broader literature on persona consistency in language models.",
    ],
    status: "Open",
  },
  {
    id: "cross-modal",
    n: "04",
    title: "Cross-modal consistency",
    body: [
      "For image-based collections there are two data streams: trait metadata and the image itself. Do they tell the same personality story?",
      "An Azuki with visually aggressive features but gentle trait tags creates a conflict. How that conflict is resolved — which signal takes precedence, and under what conditions — is an open question.",
    ],
    status: "Open",
  },
  {
    id: "inter-rater",
    n: "05",
    title: "Inter-rater reliability",
    body: [
      "If trait scoring involves human judgment at any stage, how consistent are scores across raters? Measuring and reducing that variance is a classical psychometrics problem applied to a new domain.",
    ],
    status: "Open",
  },
];

export default function ResearchPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-5xl px-5 pt-14 pb-10 sm:px-8 sm:pt-20">
        <p className="label mb-4">Research agenda</p>
        <h1 className="max-w-3xl font-pixel-square text-2xl leading-tight text-foreground sm:text-4xl">
          What we do not know yet.
        </h1>
        <div className="prose-lab mt-5 max-w-2xl text-base">
          <p>
            The methodology is a claim, and a claim needs testing. These are the open
            questions that determine whether attribute-rooted personality inference
            holds up — listed with what we would have to observe to conclude it does
            not.
          </p>
        </div>
      </section>

      <Section label="Open questions">
        <div className="-mt-7 divide-y divide-border border-t border-border">
          {QUESTIONS.map((q) => (
            <article
              key={q.id}
              id={q.id}
              className="grid scroll-mt-24 gap-3 py-8 sm:grid-cols-[4rem_1fr] sm:gap-8"
            >
              <p className="font-mono text-[13px] text-muted-foreground sm:pt-1">{q.n}</p>
              <div>
                <div className="mb-2.5 flex flex-wrap items-center gap-3">
                  <h2 className="font-pixel-square text-base text-foreground">{q.title}</h2>
                  <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[10.5px] tracking-wide text-muted-foreground uppercase">
                    {q.status}
                  </span>
                </div>
                <div className="prose-lab max-w-2xl text-[15px]">
                  {q.body.map((p) => (
                    <p key={p.slice(0, 40)}>{p}</p>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section label="Why publish this">
        <Lede>
          <p>
            A lab that only publishes results it likes is a marketing department. The
            questions above are listed with their failure conditions on purpose: if
            anchor phrase choice turns out to dominate the output, the instrument is
            measuring the phrasing rather than the trait, and that finding matters more
            than any product built on top of it.
          </p>
        </Lede>
      </Section>
    </main>
  );
}
