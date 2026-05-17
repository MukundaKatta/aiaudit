import type { CallLLM } from "../llm.js";
export interface AnthropicCallOptions {
    apiKey?: string;
    model?: string;
    maxTokens?: number;
}
export declare function anthropicCallLLM(opts?: AnthropicCallOptions): Promise<CallLLM>;
//# sourceMappingURL=anthropic.d.ts.map