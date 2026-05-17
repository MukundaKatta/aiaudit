import { type HunkScore, type Scorer } from "./scorer.js";
export interface AuditResult {
    totalHunks: number;
    scoredHunks: HunkScore[];
    aggregateScore: number;
    topSuspects: HunkScore[];
}
export declare function auditDiff(diff: string, scorer?: Scorer): Promise<AuditResult>;
