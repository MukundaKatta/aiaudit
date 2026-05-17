import type { Hunk } from "./diff.js";
import type { HunkScore, Scorer } from "./scorer.js";

const AI_GIVEAWAYS = [
  /\bI'll\b/,
  /\bLet me\b/,
  /\bHere'?s? (?:the|a|an) /i,
  /\b(?:certainly|absolutely|definitely)[,!]/i,
  /\bAs an AI\b/i,
  /\bI (?:apologize|cannot|can'?t)\b/,
];

const COMMENT_PREFIXES = ["//", "#", "/*", "*", "<!--"];

const AVG_HUMAN_COMMENT_RATIO = 0.08;
const AVG_HUMAN_LINE_LENGTH = 68;

export const heuristicScorer: Scorer = {
  name: "heuristic-v0",
  async score(hunk: Hunk): Promise<HunkScore> {
    const added = hunk.added.filter((l) => l.trim().length > 0);
    if (added.length === 0) {
      return { hunk, score: 0, confidence: 0, signals: [] };
    }

    const signals: string[] = [];
    let score = 0;

    const commentLines = added.filter((l) =>
      COMMENT_PREFIXES.some((p) => l.trimStart().startsWith(p)),
    );
    const commentRatio = commentLines.length / added.length;
    if (commentRatio > AVG_HUMAN_COMMENT_RATIO * 3) {
      score += 0.25;
      signals.push(`high comment ratio (${(commentRatio * 100).toFixed(0)}%)`);
    }

    const avgLen =
      added.reduce((s, l) => s + l.length, 0) / Math.max(added.length, 1);
    if (avgLen > AVG_HUMAN_LINE_LENGTH * 1.4) {
      score += 0.15;
      signals.push(`long lines (avg ${avgLen.toFixed(0)} chars)`);
    }

    const joined = added.join("\n");
    const giveaways = AI_GIVEAWAYS.filter((re) => re.test(joined));
    if (giveaways.length > 0) {
      score += Math.min(0.5, giveaways.length * 0.2);
      signals.push(`AI phrasing in ${giveaways.length} pattern(s)`);
    }

    const uniqueLines = new Set(added.map((l) => l.trim()));
    const dupeRatio = 1 - uniqueLines.size / added.length;
    if (dupeRatio > 0.3 && added.length > 5) {
      score += 0.1;
      signals.push(`repetitive lines (${(dupeRatio * 100).toFixed(0)}% dup)`);
    }

    const confidence = Math.min(1, added.length / 20);
    return {
      hunk,
      score: Math.min(1, score),
      confidence,
      signals,
    };
  },
};
