import type { CallLLM } from "../llm.js";

export interface AnthropicCallOptions {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
}

export async function anthropicCallLLM(
  opts: AnthropicCallOptions = {},
): Promise<CallLLM> {
  const apiKey = opts.apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Export it or pass apiKey explicitly.",
    );
  }

  const mod = (await import("@anthropic-ai/sdk").catch(() => null)) as
    | typeof import("@anthropic-ai/sdk")
    | null;
  if (!mod) {
    throw new Error(
      "@anthropic-ai/sdk is not installed. Run: npm install @anthropic-ai/sdk",
    );
  }

  const client = new mod.default({ apiKey });
  const model = opts.model ?? "claude-haiku-4-5";
  const maxTokens = opts.maxTokens ?? 200;

  return async (prompt: string): Promise<string> => {
    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("");
    return text;
  };
}
