import { test } from "node:test";
import assert from "node:assert/strict";
import { auditDiff } from "../src/audit.ts";

test("auditDiff: parses + scores end-to-end", async () => {
  const diff = `diff --git a/foo.ts b/foo.ts
@@ -0,0 +1,3 @@
+// Certainly! Here's the helper function:
+function helper() { return 42; }
+
`;
  const result = await auditDiff(diff);
  assert.equal(result.totalHunks, 1);
  assert.ok(result.aggregateScore > 0);
  assert.equal(result.scoredHunks.length, 1);
});

test("auditDiff: empty diff yields zero score", async () => {
  const result = await auditDiff("");
  assert.equal(result.totalHunks, 0);
  assert.equal(result.aggregateScore, 0);
});
