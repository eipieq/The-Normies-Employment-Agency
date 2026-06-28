import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function veniceModel() {
  const venice = createOpenAICompatible({
    name: "venice",
    baseURL: "https://api.venice.ai/api/v1",
    apiKey: process.env.VENICE_API_KEY!,
  });
  return venice("claude-opus-4-7");
}
