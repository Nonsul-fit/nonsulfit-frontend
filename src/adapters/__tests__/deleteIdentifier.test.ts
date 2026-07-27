import assert from "node:assert/strict";
import test from "node:test";
import { selectDeleteReportIdentifier } from "../../types/identifiers.ts";

test("delete identifier prefers UUID reportId", () => {
  assert.equal(
    selectDeleteReportIdentifier({
      reportId: "7d5f65c4-a038-4b94-a8a2-b896449a9ddd",
      publicId: 31,
    }),
    "7d5f65c4-a038-4b94-a8a2-b896449a9ddd",
  );
});

test("delete identifier falls back to legacy publicId", () => {
  assert.equal(
    selectDeleteReportIdentifier({ reportId: null, publicId: 31 }),
    31,
  );
});
