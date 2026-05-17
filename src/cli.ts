#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { auditDiff } from "./audit.js";
import { heuristicScorer } from "./heuristics.js";
import { composeScorers, llmScorer } from "./llm.js";
import { anthropicCallLLM } from "./adapters/anthropic.js";
import type { Scorer } from "./scorer.js";

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

function printHelp(): void {
  process.stdout.write(`aiaudit — score a diff for AI-generated content

Usage:
  aiaudit < diff.patch
  aiaudit --file path/to/diff.patch
  aiaudit --json < diff.patch
  aiaudit --llm < diff.patch        # uses ANTHROPIC_API_KEY

Options:
  --file PATH    Read diff from file instead of stdin
  --json         Emit machine-readable JSON
  --llm          Add LLM scorer (requires ANTHROPIC_API_KEY)
  --model NAME   Override LLM model (default: claude-haiku-4-5)
  --help         Show this message
`);
}

interface Args {
  file?: string;
  json: boolean;
  llm: boolean;
  model?: string;
}

function parseArgs(argv: string[]): Args | "help" {
  const args: Args = { json: false, llm: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") return "help";
    if (a === "--json") args.json = true;
    else if (a === "--llm") args.llm = true;
    else if (a === "--model") args.model = argv[++i];
    else if (a === "--file" || a === "-f") args.file = argv[++i];
  }
  return args;
}

async function buildScorer(args: Args): Promise<Scorer> {
  if (!args.llm) return heuristicScorer;
  const call = await anthropicCallLLM({ model: args.model });
  return composeScorers([heuristicScorer, llmScorer({ callLLM: call })]);
}

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed === "help") {
    printHelp();
    return;
  }

  const diff = parsed.file ? readFileSync(parsed.file, "utf-8") : await readStdin();
  if (!diff.trim()) {
    process.stderr.write("aiaudit: no diff provided on stdin or --file\n");
    process.exit(2);
  }

  const scorer = await buildScorer(parsed);
  const result = await auditDiff(diff, scorer);

  if (parsed.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    return;
  }

  const pct = (result.aggregateScore * 100).toFixed(0);
  process.stdout.write(
    `aiaudit: ${result.totalHunks} hunks, aggregate AI-likelihood ${pct}%\n`,
  );
  for (const s of result.topSuspects) {
    if (s.score === 0) continue;
    const sp = (s.score * 100).toFixed(0);
    process.stdout.write(
      `  ${s.hunk.file}:${s.hunk.startLine}  ${sp}%  ${s.signals.join(", ")}\n`,
    );
  }
}

main().catch((err) => {
  process.stderr.write(`aiaudit: ${err.message ?? err}\n`);
  process.exit(1);
});
