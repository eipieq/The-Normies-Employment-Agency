import { generateText } from "ai";
import { z } from "zod";
import type { NormieFeatures } from "../normies";
import { AGENCY_BRIEF } from "./brief";
import type { Persona } from "./types";
import { veniceModel } from "../venice";

const personaSchema = z.object({
  jobTitle: z.string(),
  oneLiner: z.string(),
  workStyle: z.string(),
  strengths: z.array(z.string()).min(2).max(4),
  blindSpots: z.array(z.string()).min(2).max(4),
  systemPrompt: z.string(),
});

// venice's openai-compatible endpoint doesn't support structured outputs or tool calls.
// we ask for raw JSON and parse + validate against the zod schema ourselves.
const JSON_INSTRUCTIONS = `
respond with ONLY a valid JSON object matching this exact shape:
{
  "jobTitle": string,
  "oneLiner": string,
  "workStyle": string,
  "strengths": string[],
  "blindSpots": string[],
  "systemPrompt": string
}
no markdown, no code fences, no prose. just the JSON object.`;

function buildUserMessage(f: NormieFeatures): string {
  const traits = f.traits.attributes
    .map((a) => `${a.trait_type}: ${a.value}`)
    .join("\n");

  const agentSection = f.agent
    ? `registered name: ${f.agent.name}\nregistered type: ${f.agent.type}`
    : "not erc-8004 registered. invent a name that fits.";

  return `## normie #${f.tokenId} dossier

### agent registration
${agentSection}

### traits
${traits}

### pixel analysis
density: ${(f.density * 100).toFixed(1)}% (${f.density > 0.4 ? "heavy" : f.density < 0.25 ? "sparse" : "medium"})
top mass: ${(f.distribution.topMass * 100).toFixed(1)}%
bottom mass: ${(f.distribution.bottomMass * 100).toFixed(1)}%
center mass: ${(f.distribution.centerMass * 100).toFixed(1)}%
edge mass: ${(f.distribution.edgeMass * 100).toFixed(1)}%

### archetype
category: ${f.archetype.category}
formality: ${f.archetype.formality}
perception: ${f.archetype.perception}
demeanor: ${f.archetype.demeanor}
energy: ${f.archetype.energy}${f.archetype.tags.length > 0 ? `\nflavor tags: ${f.archetype.tags.join(", ")}` : ""}

### canvas history
versions: ${f.history.versionCount}
total pixel churn: ${f.history.totalChurn}
transformer diversity: ${f.history.transformerDiversity}
virgin (never edited): ${f.history.isVirgin}

generate the persona object for this normie.${JSON_INSTRUCTIONS}`;
}

export async function generatePersona(f: NormieFeatures): Promise<Persona> {
  const { text } = await generateText({
    model: veniceModel(),
    system: AGENCY_BRIEF,
    prompt: buildUserMessage(f),
    temperature: 0,
  });

  // strip any code fences the model wraps around the JSON despite instructions
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
  const parsed = JSON.parse(cleaned);
  return personaSchema.parse(parsed);
}
