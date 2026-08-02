#!/usr/bin/env npx tsx
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText } from "ai";
import * as readline from "readline";

const VENICE_API_KEY = process.env.VENICE_API_KEY!;
const AGENCY_URL = process.env.AGENCY_URL ?? "http://localhost:3000";

const [collection, tokenId] = process.argv.slice(2);

if (!collection || !tokenId) {
  console.error("usage: tsx cli.ts <collection> <token_id>");
  console.error("  e.g. tsx cli.ts azuki 321");
  process.exit(1);
}

if (!VENICE_API_KEY) {
  console.error("VENICE_API_KEY is required");
  process.exit(1);
}

type Message = { role: "user" | "assistant"; content: string };

async function fetchPersona() {
  const res = await fetch(`${AGENCY_URL}/api/dev/persona?collection=${collection}&id=${tokenId}`);
  if (!res.ok) throw new Error(`persona fetch failed: ${res.status} — is dev server running at ${AGENCY_URL}?`);
  return res.json() as Promise<{
    label: string; jobTitle: string; oneLiner: string;
    systemPrompt: string; examples: { user: string; assistant: string }[];
  }>;
}

function buildSystemPrompt(persona: Awaited<ReturnType<typeof fetchPersona>>) {
  const examplesBlock = persona.examples.length > 0
    ? `\n\n---\nVOICE EXAMPLES — how you speak (not prior conversations):\n` +
      persona.examples.map((ex, i) => `[${i + 1}] User: ${ex.user}\n    You: ${ex.assistant}`).join("\n")
    : "";
  return persona.systemPrompt + examplesBlock;
}

function venice() {
  return createOpenAICompatible({
    name: "venice",
    baseURL: "https://api.venice.ai/api/v1",
    apiKey: VENICE_API_KEY,
  })("claude-opus-4-5");
}

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) return "";
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data.trim()));
  });
}

async function main() {
  // Collect piped stdin and optional inline prompt from last arg
  const args = process.argv.slice(4); // after collection + tokenId
  const inlinePrompt = args.join(" ").trim();
  const piped = await readStdin();

  process.stdout.write("fetching persona...\r");
  const persona = await fetchPersona();
  const systemPrompt = buildSystemPrompt(persona);
  const history: Message[] = [];

  process.stdout.write(`\x1b[2K`);
  console.log(`\x1b[1m${persona.jobTitle}\x1b[0m — ${persona.label} #${tokenId}`);
  console.log(`\x1b[2m${persona.oneLiner}\x1b[0m`);
  console.log(`\x1b[2m${"─".repeat(60)}\x1b[0m`);

  async function send(userMessage: string) {
    history.push({ role: "user", content: userMessage });
    process.stdout.write(`\n\x1b[1m${persona.label} #${tokenId}:\x1b[0m `);

    const result = streamText({
      model: venice(),
      system: systemPrompt,
      messages: history.map((m) => ({ role: m.role, content: m.content })),
      maxOutputTokens: 1024,
    });

    let full = "";
    for await (const chunk of result.textStream) {
      process.stdout.write(chunk);
      full += chunk;
    }
    history.push({ role: "assistant", content: full });
    process.stdout.write("\n\n");
  }

  // If piped content, inject it as first message (with optional inline prompt as the question)
  if (piped) {
    const prompt = inlinePrompt || "review this";
    const userMessage = `${prompt}\n\n\`\`\`\n${piped}\n\`\`\``;
    console.log(`\x1b[34myou:\x1b[0m ${prompt} [+ piped content]\n`);
    await send(userMessage);
  }

  // If no piped content and inline prompt, send it directly as a one-shot
  if (!piped && inlinePrompt) {
    console.log(`\x1b[34myou:\x1b[0m ${inlinePrompt}\n`);
    await send(inlinePrompt);
  }

  // Drop into interactive REPL (unless stdin was piped — then exit after response)
  if (piped && !process.stdin.isTTY) {
    process.exit(0);
  }

  console.log(`\x1b[2mtype your message. ctrl+c to exit.\x1b[0m\n`);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const ask = () => {
    rl.question("\x1b[34myou:\x1b[0m ", async (input) => {
      input = input.trim();
      if (!input) { ask(); return; }
      await send(input);
      ask();
    });
  };

  ask();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
