#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { auditDiff } from "./audit.js";

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

Options:
  --file PATH    Read diff from file instead of stdin
  --json         Emit machine-readable JSON
  --help         Show this message
`);
}

interface Args {
  file?: string;
  json: boolean;
}

function parseArgs(argv: string[]): Args | "help" {
  const args: Args = { json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") return "help";
    if (a === "--json") args.json = true;
    else if (a === "--file" || a === "-f") args.file = argv[++i];
  }
  return args;
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

  const result = await auditDiff(diff);

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
