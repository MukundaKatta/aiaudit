import type { Hunk } from "./diff.js";

export interface HunkScore {
  hunk: Hunk;
  score: number;
  confidence: number;
  signals: string[];
}

export interface Scorer {
  name: string;
  score(hunk: Hunk): Promise<HunkScore>;
}

export async function scoreHunks(
  hunks: Hunk[],
  scorer: Scorer,
): Promise<HunkScore[]> {
  return Promise.all(hunks.map((h) => scorer.score(h)));
}
