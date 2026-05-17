import type { Hunk } from "./diff.js";
import type { HunkScore, Scorer } from "./scorer.js";

export type CallLLM = (prompt: string) => Promise<string>;

export interface LLMScorerOptions {
  callLLM: CallLLM;
  name?: string;
  maxAddedLines?: number;
}

const PROMPT_TEMPLATE = `You are an expert code reviewer detecting AI-generated code.

Score the following code hunk on the likelihood it was written by an AI assistant (Copilot, Cursor, Claude, ChatGPT). Consider phrasing, comment style, naming conventions, over-explanation, and structural patterns that humans rarely produce.

Return a single JSON object on one line:
{"score": <0-1 float>, "reason": "<one short sentence>"}

File: {{FILE}}
Hunk (added lines only):
\`\`\`
{{HUNK}}
\`\`\`

JSON:`;

const JSON_OBJECT = /\{[\s\S]*?\}/;

interface LLMResponse {
  score: number;
  reason: string;
}

function parseResponse(raw: string): LLMResponse {
  const match = JSON_OBJECT.exec(raw);
  if (!match) {
    throw new Error(`LLM did not return JSON: ${raw.slice(0, 100)}`);
  }
  const parsed = JSON.parse(match[0]) as Partial<LLMResponse>;
  const score = typeof parsed.score === "number" ? parsed.score : NaN;
  if (!Number.isFinite(score) || score < 0 || score > 1) {
    throw new Error(`LLM score out of range: ${parsed.score}`);
  }
  return { score, reason: parsed.reason ?? "" };
}

export function llmScorer(opts: LLMScorerOptions): Scorer {
  const maxLines = opts.maxAddedLines ?? 200;
  const name = opts.name ?? "llm";

  return {
    name,
    async score(hunk: Hunk): Promise<HunkScore> {
      const added = hunk.added.filter((l) => l.trim().length > 0);
      if (added.length === 0) {
        return { hunk, score: 0, confidence: 0, signals: [] };
      }
      if (added.length > maxLines) {
        return {
          hunk,
          score: 0,
          confidence: 0,
          signals: [`skipped (over ${maxLines}-line cap)`],
        };
      }

      const prompt = PROMPT_TEMPLATE.replace("{{FILE}}", hunk.file).replace(
        "{{HUNK}}",
        added.join("\n"),
      );

      const raw = await opts.callLLM(prompt);
      const { score, reason } = parseResponse(raw);

      return {
        hunk,
        score,
        confidence: Math.min(1, added.length / 10),
        signals: reason ? [reason] : [],
      };
    },
  };
}

export function composeScorers(scorers: Scorer[]): Scorer {
  return {
    name: `composite(${scorers.map((s) => s.name).join("+")})`,
    async score(hunk: Hunk): Promise<HunkScore> {
      const results = await Promise.all(scorers.map((s) => s.score(hunk)));
      const totalConf = results.reduce((s, r) => s + r.confidence, 0);
      if (totalConf === 0) {
        return { hunk, score: 0, confidence: 0, signals: [] };
      }
      const weighted =
        results.reduce((s, r) => s + r.score * r.confidence, 0) / totalConf;
      const signals = results.flatMap((r) =>
        r.signals.map((s) => `[${results.indexOf(r)}] ${s}`),
      );
      return {
        hunk,
        score: weighted,
        confidence: Math.min(1, totalConf / results.length),
        signals,
      };
    },
  };
}
