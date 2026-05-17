import type { Scorer } from "./scorer.js";
export type CallLLM = (prompt: string) => Promise<string>;
export interface LLMScorerOptions {
    callLLM: CallLLM;
    name?: string;
    maxAddedLines?: number;
}
export declare function llmScorer(opts: LLMScorerOptions): Scorer;
export declare function composeScorers(scorers: Scorer[]): Scorer;
