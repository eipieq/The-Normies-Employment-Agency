import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import { z } from "zod";

const VENICE_API_KEY = process.env.VENICE_API_KEY!;
const AGENCY_URL = process.env.AGENCY_URL ?? "http://localhost:3000";

if (!VENICE_API_KEY) {
  process.stderr.write("VENICE_API_KEY is required\n");
  process.exit(1);
}

type Message = { role: "user" | "assistant"; content: string };

type PersonaResponse = {
  collection: string;
  tokenId: number;
  label: string;
  jobTitle: string;
  oneLiner: string;
  systemPrompt: string;
  examples: { user: string; assistant: string }[];
};

// Cache personas and histories per "collection:tokenId"
const personaCache = new Map<string, PersonaResponse>();
const historyCache = new Map<string, Message[]>();

async function fetchPersona(collection: string, tokenId: string): Promise<PersonaResponse> {
  const key = `${collection}:${tokenId}`;
  if (personaCache.has(key)) return personaCache.get(key)!;

  const url = `${AGENCY_URL}/api/dev/persona?collection=${collection}&id=${tokenId}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch persona for ${collection} #${tokenId}: ${res.status} — is the dev server running at ${AGENCY_URL}?`);
  }
  const persona = await res.json() as PersonaResponse;
  personaCache.set(key, persona);
  return persona;
}

function buildSystemPrompt(persona: PersonaResponse): string {
  const examplesBlock = persona.examples.length > 0
    ? `\n\n---\nVOICE EXAMPLES — how you speak (not prior conversations):\n` +
      persona.examples.map((ex, i) => `[${i + 1}] User: ${ex.user}\n    You: ${ex.assistant}`).join("\n")
    : "";
  return persona.systemPrompt + examplesBlock;
}

function veniceModel() {
  const venice = createOpenAICompatible({
    name: "venice",
    baseURL: "https://api.venice.ai/api/v1",
    apiKey: VENICE_API_KEY,
  });
  return venice("claude-opus-4-5");
}

async function main() {
  const server = new Server(
    { name: "the-employment-agency", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "ask_character",
        description:
          "Chat with any NFT character from The Employment Agency. " +
          "Each character has a unique persona derived from their on-chain traits. " +
          "Use this to get a specific character's perspective on your work, code, or ideas.",
        inputSchema: {
          type: "object",
          properties: {
            collection: {
              type: "string",
              enum: ["normies", "azuki"],
              description: "The NFT collection",
            },
            token_id: {
              type: "string",
              description: "The token ID (e.g. '321')",
            },
            message: {
              type: "string",
              description: "Your message to the character",
            },
          },
          required: ["collection", "token_id", "message"],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    if (req.params.name !== "ask_character") {
      return { content: [{ type: "text", text: "Unknown tool" }], isError: true };
    }

    const { collection, token_id, message } = z.object({
      collection: z.string(),
      token_id: z.string(),
      message: z.string(),
    }).parse(req.params.arguments);

    const persona = await fetchPersona(collection, token_id);
    const systemPrompt = buildSystemPrompt(persona);

    const key = `${collection}:${token_id}`;
    if (!historyCache.has(key)) historyCache.set(key, []);
    const history = historyCache.get(key)!;

    history.push({ role: "user", content: message });

    const { text } = await generateText({
      model: veniceModel(),
      system: systemPrompt,
      messages: history.map((m) => ({ role: m.role, content: m.content })),
      maxOutputTokens: 1024,
    });

    history.push({ role: "assistant", content: text });

    return {
      content: [{ type: "text", text: `**${persona.jobTitle}** (${persona.label} #${token_id})\n\n${text}` }],
    };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`MCP server error: ${err}\n`);
  process.exit(1);
});
