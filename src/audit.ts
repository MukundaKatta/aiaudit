import { parseDiff } from "./diff.js";
import { heuristicScorer } from "./heuristics.js";
import { scoreHunks, type HunkScore, type Scorer } from "./scorer.js";

export interface AuditResult {
  totalHunks: number;
  scoredHunks: HunkScore[];
  aggregateScore: number;
  topSuspects: HunkScore[];
}

export async function auditDiff(
  diff: string,
  scorer: Scorer = heuristicScorer,
): Promise<AuditResult> {
  const hunks = parseDiff(diff);
  const scored = await scoreHunks(hunks, scorer);

  const weighted = scored.reduce(
    (acc, s) => {
      acc.num += s.score * s.confidence;
      acc.den += s.confidence;
      return acc;
    },
    { num: 0, den: 0 },
  );
  const aggregate = weighted.den > 0 ? weighted.num / weighted.den : 0;

  const topSuspects = [...scored]
    .sort((a, b) => b.score * b.confidence - a.score * a.confidence)
    .slice(0, 5);

  return {
    totalHunks: hunks.length,
    scoredHunks: scored,
    aggregateScore: aggregate,
    topSuspects,
  };
}
