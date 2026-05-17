import { test } from "node:test";
import assert from "node:assert/strict";
import { llmScorer, composeScorers } from "../src/llm.ts";
import { heuristicScorer } from "../src/heuristics.ts";
import type { Hunk } from "../src/diff.ts";

function mkHunk(added: string[]): Hunk {
  return { file: "x.ts", startLine: 1, added, removed: [] };
}

test("llmScorer: empty hunk returns zero", async () => {
  const scorer = llmScorer({
    callLLM: async () => '{"score": 0.9, "reason": "should not be called"}',
  });
  const s = await scorer.score(mkHunk([]));
  assert.equal(s.score, 0);
  assert.equal(s.confidence, 0);
});

test("llmScorer: parses JSON response", async () => {
  const scorer = llmScorer({
    callLLM: async () =>
      'Here is my analysis: {"score": 0.85, "reason": "boilerplate"}',
  });
  const s = await scorer.score(mkHunk(["function foo() { return 1; }"]));
  assert.equal(s.score, 0.85);
  assert.deepEqual(s.signals, ["boilerplate"]);
});

test("llmScorer: rejects out-of-range score", async () => {
  const scorer = llmScorer({
    callLLM: async () => '{"score": 1.7, "reason": "too high"}',
  });
  await assert.rejects(
    scorer.score(mkHunk(["foo"])),
    /score out of range/,
  );
});

test("llmScorer: rejects non-JSON response", async () => {
  const scorer = llmScorer({
    callLLM: async () => "I think it is 0.8 likely AI",
  });
  await assert.rejects(
    scorer.score(mkHunk(["foo"])),
    /did not return JSON/,
  );
});

test("llmScorer: respects maxAddedLines cap", async () => {
  let called = false;
  const scorer = llmScorer({
    maxAddedLines: 3,
    callLLM: async () => {
      called = true;
      return '{"score": 0.5, "reason": "x"}';
    },
  });
  const s = await scorer.score(
    mkHunk(["a", "b", "c", "d", "e"]),
  );
  assert.equal(called, false);
  assert.equal(s.score, 0);
  assert.ok(s.signals[0].includes("skipped"));
});

test("composeScorers: confidence-weighted average", async () => {
  const fakeLLM = llmScorer({
    callLLM: async () => '{"score": 0.9, "reason": "ai vibes"}',
  });
  const composite = composeScorers([heuristicScorer, fakeLLM]);
  const s = await composite.score(
    mkHunk([
      "// Certainly! Here is the function:",
      "function add(a, b) { return a + b; }",
    ]),
  );
  assert.ok(s.score > 0, `expected nonzero, got ${s.score}`);
  assert.ok(s.signals.length > 0);
});
