export interface Hunk {
    file: string;
    startLine: number;
    added: string[];
    removed: string[];
}
export declare function parseDiff(diff: string): Hunk[];
