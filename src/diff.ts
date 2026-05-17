export interface Hunk {
  file: string;
  startLine: number;
  added: string[];
  removed: string[];
}

const FILE_HEADER = /^diff --git a\/(.+?) b\/(.+)$/;
const HUNK_HEADER = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/;

export function parseDiff(diff: string): Hunk[] {
  const hunks: Hunk[] = [];
  const lines = diff.split("\n");

  let currentFile = "";
  let current: Hunk | null = null;

  for (const line of lines) {
    const fileMatch = FILE_HEADER.exec(line);
    if (fileMatch) {
      if (current) hunks.push(current);
      current = null;
      currentFile = fileMatch[2];
      continue;
    }

    const hunkMatch = HUNK_HEADER.exec(line);
    if (hunkMatch) {
      if (current) hunks.push(current);
      current = {
        file: currentFile,
        startLine: Number(hunkMatch[1]),
        added: [],
        removed: [],
      };
      continue;
    }

    if (!current) continue;
    if (line.startsWith("+") && !line.startsWith("+++")) {
      current.added.push(line.slice(1));
    } else if (line.startsWith("-") && !line.startsWith("---")) {
      current.removed.push(line.slice(1));
    }
  }

  if (current) hunks.push(current);
  return hunks;
}
