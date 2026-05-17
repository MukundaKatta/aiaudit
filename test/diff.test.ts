import { test } from "node:test";
import assert from "node:assert/strict";
import { parseDiff } from "../src/diff.ts";

test("parseDiff: single file, single hunk", () => {
  const diff = `diff --git a/foo.ts b/foo.ts
index abc..def 100644
--- a/foo.ts
+++ b/foo.ts
@@ -1,3 +1,4 @@
 const a = 1;
+const b = 2;
 const c = 3;
-const d = 4;
`;
  const hunks = parseDiff(diff);
  assert.equal(hunks.length, 1);
  assert.equal(hunks[0].file, "foo.ts");
  assert.deepEqual(hunks[0].added, ["const b = 2;"]);
  assert.deepEqual(hunks[0].removed, ["const d = 4;"]);
});

test("parseDiff: multi-file diff", () => {
  const diff = `diff --git a/a.ts b/a.ts
@@ -1 +1 @@
-old
+new
diff --git a/b.ts b/b.ts
@@ -1 +1,2 @@
 keep
+added
`;
  const hunks = parseDiff(diff);
  assert.equal(hunks.length, 2);
  assert.equal(hunks[0].file, "a.ts");
  assert.equal(hunks[1].file, "b.ts");
  assert.deepEqual(hunks[1].added, ["added"]);
});

test("parseDiff: empty diff returns empty array", () => {
  assert.deepEqual(parseDiff(""), []);
});
