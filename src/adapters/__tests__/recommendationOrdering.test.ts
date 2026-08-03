/// <reference types="node" />

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { RecommendedProgramItem } from "../../types/reportPayloadV2.ts";
import { orderProgramsByDisplayBucket } from "../../utils/orderProgramsByDisplayBucket.ts";

const program = (
  programId: string,
  displayBucket: "reach" | "target" | "stable",
  selectionRank: number | null,
  finalScore: number | undefined,
  category = "MODERATE",
): RecommendedProgramItem => ({
  programId,
  universityName: `${programId} 대학`,
  departmentName: "학과",
  displayBucket,
  selectionRank,
  finalScore,
  category,
  originalApplicationPosition: null,
  originalDisplayBucket: null,
  placementReason: null,
});

const ids = (programs: RecommendedProgramItem[]) =>
  programs.map(({ programId }) => programId);

test("orders mixed programs reach, target, stable with two programs each", () => {
  const result = orderProgramsByDisplayBucket([
    program("stable-2", "stable", 2, 80),
    program("target-2", "target", 2, 80),
    program("reach-2", "reach", 2, 80),
    program("stable-1", "stable", 1, 90),
    program("target-1", "target", 1, 90),
    program("reach-1", "reach", 1, 90),
  ]);

  assert.deepEqual(ids(result), [
    "reach-1", "reach-2", "target-1", "target-2", "stable-1", "stable-2",
  ]);
});

test("within a bucket selectionRank ASC takes priority", () => {
  const result = orderProgramsByDisplayBucket([
    program("rank-2", "target", 2, 100),
    program("rank-1", "target", 1, 1),
  ]);
  assert.deepEqual(ids(result), ["rank-1", "rank-2"]);
});

test("null ranks use finalScore DESC and then programId ASC", () => {
  const result = orderProgramsByDisplayBucket([
    program("z", "reach", null, 80),
    program("b", "reach", null, 90),
    program("a", "reach", null, 90),
  ]);
  assert.deepEqual(ids(result), ["a", "b", "z"]);
});

test("ordering is immutable and preserves category and displayBucket", () => {
  const source = [
    program("stable", "stable", null, 70, "SAFE"),
    program("reach", "reach", null, 90, "RISKY"),
  ];
  const snapshot = structuredClone(source);
  const result = orderProgramsByDisplayBucket(source);

  assert.deepEqual(source, snapshot);
  assert.notEqual(result, source);
  assert.deepEqual(
    result.map(({ programId, category, displayBucket }) => ({
      programId, category, displayBucket,
    })),
    [
      { programId: "reach", category: "RISKY", displayBucket: "reach" },
      { programId: "stable", category: "SAFE", displayBucket: "stable" },
    ],
  );
});

test("portfolio programIds order never overrides card ordering", () => {
  const selector = readFileSync(
    new URL("../../selectors/recommendationPrograms.ts", import.meta.url),
    "utf8",
  );
  const orderIndex = selector.indexOf("orderProgramsByDisplayBucket(programs)");
  const membershipIndex = selector.indexOf("portfolioProgramIds.has(programId)");

  assert.ok(orderIndex >= 0);
  assert.ok(membershipIndex > orderIndex);
  assert.equal(selector.includes("programIds.map"), false);
});

test("different API insertion orders produce the same result", () => {
  const first = [
    program("stable", "stable", null, 70),
    program("reach", "reach", null, 90),
    program("target", "target", null, 80),
  ];
  const second = [first[2], first[0], first[1]];

  assert.deepEqual(
    ids(orderProgramsByDisplayBucket(first)),
    ids(orderProgramsByDisplayBucket(second)),
  );
});
