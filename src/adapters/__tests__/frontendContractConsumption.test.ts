/// <reference types="node" />

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { reportV2Mapper } from "../reportV2Mapper.ts";
import { getPlacementReasonText } from "../../presenters/recommendationPresentation.ts";

const currentDir = dirname(fileURLToPath(import.meta.url));
const sourceRoot = resolve(currentDir, "../..");

const canonicalProgram = (
  programId: string,
  selectionRank: number,
  placementReason: string | null = null,
) => ({
  programId,
  selectionRank,
  universityName: `${programId} 대학`,
  departmentName: "학과",
  displayBucket: "target",
  originalApplicationPosition: null,
  originalDisplayBucket: null,
  placementReason,
  category: "MODERATE",
});

const mapPrograms = (programs: Record<string, unknown>[]) =>
  reportV2Mapper({
    generatedReportV2: {
      reportVersion: "v2",
      recommendedPrograms: programs,
      portfolioStrategy: {
        safety: { programIds: [] },
        match: { programIds: programs.map((program) => program.programId) },
        reach: { programIds: [] },
      },
    },
  });

test("required-but-nullable rendering test", () => {
  const result = mapPrograms([canonicalProgram("program-null", 1)]);

  assert.equal(result.status, "success");
  assert.equal(
    getPlacementReasonText(result.data?.recommendedPrograms[0]?.placementReason ?? null),
    "선정 이유 정보가 없습니다.",
  );
});

test("canonical fields mapper preservation test", () => {
  const source = {
    ...canonicalProgram("program-a", 4, "백엔드가 결정한 배치 사유"),
    originalApplicationPosition: "reach",
    originalDisplayBucket: "stable",
  };
  const result = mapPrograms([source]);
  const mapped = result.data?.recommendedPrograms[0];

  assert.equal(mapped?.programId, "program-a");
  assert.equal(mapped?.selectionRank, 4);
  assert.equal(mapped?.originalApplicationPosition, "reach");
  assert.equal(mapped?.originalDisplayBucket, "stable");
  assert.equal(mapped?.placementReason, "백엔드가 결정한 배치 사유");
});

test("generatedReportV2 SSOT test", () => {
  const resultPage = readFileSync(
    resolve(sourceRoot, "pages/Result/Result.tsx"),
    "utf8",
  );

  assert.match(resultPage, /const generatedReportV2 = result\?\.data \?\? null/);
  assert.equal(resultPage.includes(".result"), false);
  assert.equal(resultPage.includes("mockResultData"), false);
});

test("recommendation ordering test", () => {
  const result = mapPrograms([
    canonicalProgram("program-third", 3),
    canonicalProgram("program-first", 1),
    canonicalProgram("program-second", 2),
  ]);

  assert.deepEqual(
    result.data?.recommendedPrograms.map((program) => program.programId),
    ["program-third", "program-first", "program-second"],
  );
});

test("stale cache replacement test", () => {
  const hook = readFileSync(
    resolve(sourceRoot, "hooks/useNonsulResult.ts"),
    "utf8",
  );
  const resetIndex = hook.indexOf("setResult(null);");
  const requestIndex = hook.indexOf("await fetchReportDetail(reportId)");

  assert.ok(resetIndex >= 0);
  assert.ok(requestIndex > resetIndex);
  assert.match(hook, /\}, \[reportId\]\);/);
});

test("null 값에서 렌더링 예외가 발생하지 않는 테스트", () => {
  assert.doesNotThrow(() => getPlacementReasonText(null));
  assert.equal(getPlacementReasonText("원문"), "원문");
});

test("missing canonical key is not treated as null", () => {
  const incomplete = canonicalProgram("program-missing", 1) as Record<
    string,
    unknown
  >;
  delete incomplete.placementReason;
  const result = mapPrograms([
    incomplete,
  ]);

  assert.equal(result.status, "failure");
  assert.equal(result.data, null);
});
