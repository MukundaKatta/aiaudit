import { test } from "node:test";
import assert from "node:assert/strict";
import { heuristicScorer } from "../src/heuristics.ts";
import type { Hunk } from "../src/diff.ts";

function mkHunk(added: string[]): Hunk {
  return { file: "x.ts", startLine: 1, added, removed: [] };
}

test("heuristicScorer: empty hunk -> zero score", async () => {
  const s = await heuristicScorer.score(mkHunk([]));
  assert.equal(s.score, 0);
  assert.equal(s.confidence, 0);
});

test("heuristicScorer: AI giveaway phrasing bumps score", async () => {
  const s = await heuristicScorer.score(
    mkHunk([
      "// Certainly! Here's the implementation:",
      "function foo() { return 42; }",
    ]),
  );
  assert.ok(s.score > 0.15, `expected score > 0.15, got ${s.score}`);
  assert.ok(s.signals.some((sig) => sig.includes("AI phrasing")));
});

test("heuristicScorer: plain human-looking code scores low", async () => {
  const s = await heuristicScorer.score(
    mkHunk(["function add(a, b) {", "  return a + b;", "}"]),
  );
  assert.ok(s.score < 0.2, `expected score < 0.2, got ${s.score}`);
});
