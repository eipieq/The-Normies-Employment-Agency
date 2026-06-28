import { generateText } from "ai";
import { z } from "zod";
import type { Dossier } from "../collections/types";
import { agencyBrief } from "./brief";
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

export async function generatePersona(dossier: Dossier): Promise<Persona> {
  const { text } = await generateText({
    model: veniceModel(),
    system: agencyBrief(dossier.collection),
    prompt: `${dossier.prompt}${JSON_INSTRUCTIONS}`,
    temperature: 0,
  });

  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
  const parsed = JSON.parse(cleaned);
  return personaSchema.parse(parsed);
}
