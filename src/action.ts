import { execSync } from "node:child_process";
import * as core from "@actions/core";
import * as github from "@actions/github";
import { auditDiff, type AuditResult } from "./audit.js";
import { heuristicScorer } from "./heuristics.js";
import { composeScorers, llmScorer } from "./llm.js";
import { anthropicCallLLM } from "./adapters/anthropic.js";
import type { Scorer } from "./scorer.js";

const COMMENT_MARKER = "<!-- aiaudit:comment -->";

function getDiff(base: string, head: string): string {
  try {
    return execSync(`git diff ${base}...${head}`, {
      encoding: "utf-8",
      maxBuffer: 50 * 1024 * 1024,
    });
  } catch (err) {
    throw new Error(
      `git diff ${base}...${head} failed: ${(err as Error).message}`,
    );
  }
}

async function buildScorer(useLLM: boolean, model: string): Promise<Scorer> {
  if (!useLLM) return heuristicScorer;
  const call = await anthropicCallLLM({ model });
  return composeScorers([heuristicScorer, llmScorer({ callLLM: call })]);
}

function renderComment(result: AuditResult): string {
  const pct = (result.aggregateScore * 100).toFixed(0);
  const bar = "█".repeat(Math.round(result.aggregateScore * 20)).padEnd(20, "░");

  const rows = result.topSuspects
    .filter((s) => s.score > 0)
    .map((s) => {
      const sp = (s.score * 100).toFixed(0);
      const file = `\`${s.hunk.file}:${s.hunk.startLine}\``;
      return `| ${file} | ${sp}% | ${s.signals.join("; ") || "—"} |`;
    });

  const table = rows.length
    ? `| Location | Score | Signals |\n|---|---|---|\n${rows.join("\n")}`
    : "_No suspicious hunks detected._";

  return `${COMMENT_MARKER}
## 🤖 aiaudit — AI content audit

**Aggregate AI-likelihood: ${pct}%** \`${bar}\`
**Hunks analyzed: ${result.totalHunks}**

${table}

<sub>Heuristic scorer + (optionally) Claude. Calibrate for your codebase before acting on numbers.</sub>`;
}

async function upsertComment(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  prNumber: number,
  body: string,
): Promise<void> {
  const { data: comments } = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number: prNumber,
    per_page: 100,
  });

  const existing = comments.find((c) => c.body?.includes(COMMENT_MARKER));
  if (existing) {
    await octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: existing.id,
      body,
    });
    core.info(`Updated comment ${existing.id}`);
  } else {
    const { data: created } = await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body,
    });
    core.info(`Created comment ${created.id}`);
  }
}

async function run(): Promise<void> {
  try {
    const base = core.getInput("base", { required: true });
    const head = core.getInput("head", { required: true });
    const shouldComment = core.getBooleanInput("comment");
    const useLLM = core.getBooleanInput("use_llm");
    const model = core.getInput("model") || "claude-haiku-4-5";
    const token = core.getInput("github_token");

    core.info(`Diffing ${base}...${head}`);
    const diff = getDiff(base, head);
    if (!diff.trim()) {
      core.info("Empty diff, nothing to audit.");
      core.setOutput("aggregate_score", "0");
      return;
    }

    const scorer = await buildScorer(useLLM, model);
    const result = await auditDiff(diff, scorer);

    const pct = (result.aggregateScore * 100).toFixed(0);
    core.info(`aiaudit: ${result.totalHunks} hunks, aggregate ${pct}%`);
    core.setOutput("aggregate_score", result.aggregateScore.toFixed(4));
    core.setOutput("total_hunks", String(result.totalHunks));

    if (!shouldComment) return;
    if (!token) {
      core.warning("comment=true but no github_token provided; skipping.");
      return;
    }

    const ctx = github.context;
    const pr = ctx.payload.pull_request;
    if (!pr) {
      core.warning("Not a pull_request event; skipping comment.");
      return;
    }

    const octokit = github.getOctokit(token);
    await upsertComment(
      octokit,
      ctx.repo.owner,
      ctx.repo.repo,
      pr.number,
      renderComment(result),
    );
  } catch (err) {
    core.setFailed(`aiaudit: ${(err as Error).message}`);
  }
}

run();
