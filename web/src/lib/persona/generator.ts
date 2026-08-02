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
  examples: z.array(z.object({ user: z.string(), assistant: z.string() })).min(2).max(4),
});

const JSON_INSTRUCTIONS = `
respond with ONLY a valid JSON object matching this exact shape:
{
  "jobTitle": string,
  "oneLiner": string,
  "workStyle": string,
  "strengths": string[],
  "blindSpots": string[],
  "systemPrompt": string,
  "examples": [{ "user": string, "assistant": string }]
}

the "examples" field: 3 short conversation exchanges that demonstrate exactly how this character speaks.
each exchange should feel like a real moment — specific, in voice, no filler. the assistant turn should be 1-4 sentences max.
no markdown, no code fences, no prose. just the JSON object.`;

export async function generatePersona(dossier: Dossier): Promise<Persona> {
  let text: string;
  try {
    ({ text } = await generateText({
      model: veniceModel(),
      system: agencyBrief(dossier.collection),
      prompt: `${dossier.prompt}${JSON_INSTRUCTIONS}`,
      temperature: 0,
    }));
  } catch (err) {
    console.error("[agency:error] persona:generate venice_error", {
      collection: dossier.collection,
      error: String(err),
    });
    throw err;
  }

  try {
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    return personaSchema.parse(JSON.parse(cleaned));
  } catch (err) {
    console.error("[agency:error] persona:generate parse_error", {
      collection: dossier.collection,
      preview: text.slice(0, 300),
      error: String(err),
    });
    throw err;
  }
}
