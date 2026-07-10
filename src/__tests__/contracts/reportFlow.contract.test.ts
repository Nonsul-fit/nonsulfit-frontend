/// <reference types="node" />

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { reportV2Mapper } from "../../adapters/reportV2Mapper.ts";
import type { ReportPayloadV2 } from "../../types/reportPayloadV2.ts";

const currentDir = dirname(fileURLToPath(import.meta.url));
const sourceRoot = resolve(currentDir, "../..");
const fixtureRoot = resolve(sourceRoot, "fixtures/contracts");

const readFixture = (name: string): unknown =>
  JSON.parse(readFileSync(resolve(fixtureRoot, name), "utf8"));

const assertMapped = (name: string): ReportPayloadV2 => {
  const result = reportV2Mapper(readFixture(name));
  assert.notEqual(result.status, "failure");
  assert.ok(result.data);
  return result.data;
};

const renderSnapshot = (report: ReportPayloadV2) =>
  report.recommendedPrograms.map((program) => ({
    programId: program.programId,
    universityName: program.universityName,
    departmentName: program.departmentName,
    displayBucket: program.displayBucket,
    finalScore: program.finalScore,
    successRateEstimate: program.successRateEstimate,
  }));

test("regression_snake_case_and_camel_case_fixtures_yield_identical_ui_result", () => {
  assert.deepEqual(
    renderSnapshot(assertMapped("report-v2.camel.json")),
    renderSnapshot(assertMapped("report-v2.snake.json")),
  );
});

test("regression_reportV2Mapper_does_not_double_wrap_generatedReportV2", () => {
  const report = assertMapped("report-v2.camel.json") as unknown as Record<
    string,
    unknown
  >;

  assert.equal("generatedReportV2" in report, false);
  assert.equal("generated_report_v2" in report, false);
});

test("regression_category_change_does_not_move_card_position", () => {
  const risky = reportV2Mapper({
    recommendedPrograms: [
      {
        programId: "program-a",
        universityName: "테스트대",
        departmentName: "경영학과",
        category: "RISKY",
        finalScore: 90,
      },
    ],
    portfolioStrategy: {
      safety: { programIds: ["program-a"] },
      match: { programIds: [] },
      reach: { programIds: [] },
    },
  });
  const safe = reportV2Mapper({
    recommendedPrograms: [
      {
        programId: "program-a",
        universityName: "테스트대",
        departmentName: "경영학과",
        category: "SAFE",
        finalScore: 90,
      },
    ],
    portfolioStrategy: {
      safety: { programIds: ["program-a"] },
      match: { programIds: [] },
      reach: { programIds: [] },
    },
  });

  assert.equal(risky.data?.recommendedPrograms[0]?.displayBucket, "stable");
  assert.equal(safe.data?.recommendedPrograms[0]?.displayBucket, "stable");
});

test("regression_frontend_never_slices_recommendation_results", () => {
  const report = assertMapped("report-v2.camel.json");
  const source = [
    "pages/Result/Result.tsx",
    "hooks/useNonsulResult.ts",
    "components/molecules/result/UnivTabs.tsx",
  ]
    .map((relativePath) => readFileSync(resolve(sourceRoot, relativePath), "utf8"))
    .join("\n");

  assert.equal(report.recommendedPrograms.length, 3);
  assert.equal(source.includes("selectedLimit"), false);
  assert.equal(/\.slice\(\s*0\s*,\s*limit\s*\)/.test(source), false);
});

test("regression_displayBucket_uses_stable_target_reach_not_safety_match", () => {
  const report = assertMapped("report-v2.camel.json");
  const displayBuckets = report.recommendedPrograms.map(
    (program) => program.displayBucket,
  );

  assert.deepEqual(displayBuckets, ["stable", "target", "reach"]);
  assert.equal(displayBuckets.includes("safety" as never), false);
  assert.equal(displayBuckets.includes("match" as never), false);
});

test("regression_finalScore_never_rendered_with_percent_sign", () => {
  const source = [
    "components/organisms/result/EvaluationReport.tsx",
    "components/organisms/result/UnivDetailSummary.tsx",
  ]
    .map((relativePath) => readFileSync(resolve(sourceRoot, relativePath), "utf8"))
    .join("\n");

  assert.equal(/finalScore[\s\S]{0,160}%/.test(source), false);
  assert.equal(/%[\s\S]{0,160}finalScore/.test(source), false);
});

test("regression_estimatedChance_never_shown_as_admission_probability", () => {
  const source = [
    "adapters/legacyResultMapper.ts",
    "components/organisms/result/EvaluationReport.tsx",
    "components/organisms/result/UnivDetailSummary.tsx",
    "pages/Result/mockResultData.ts",
  ]
    .map((relativePath) => readFileSync(resolve(sourceRoot, relativePath), "utf8"))
    .join("\n");

  assert.equal(source.includes("합격 확률"), false);
  assert.equal(source.includes("합격확률"), false);
});
