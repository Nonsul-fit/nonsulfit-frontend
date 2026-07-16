/// <reference types="node" />

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import type { ReportPayloadV2 } from "../../types/reportPayloadV2.ts";
import {
  extractReportV2Body,
  mapReportPayloadV2,
  reportV2Mapper,
} from "../reportV2Mapper.ts";

const currentDir = dirname(fileURLToPath(import.meta.url));
const fixtureRoot = resolve(currentDir, "../../fixtures/contracts");

const readFixture = (name: string): unknown =>
  JSON.parse(readFileSync(resolve(fixtureRoot, name), "utf8"));

const assertSuccess = (raw: unknown): ReportPayloadV2 => {
  const result = reportV2Mapper(raw);
  assert.notEqual(result.status, "failure");
  assert.ok(result.data);
  return result.data;
};

const sectionKeys = [
  "reportVersion",
  "studentSummary",
  "recommendationSummary",
  "recommendedPrograms",
  "portfolioStrategy",
  "tierSummary",
  "consultantSummary",
  "patternSummary",
  "caseStatisticsSummary",
  "studentCompetency",
  "warnings",
  "metadata",
] as const;

test("reportV2Mapper_normalizes_camel_case_payload", () => {
  const data = assertSuccess(readFixture("report-v2.camel.json"));

  assert.equal(data.reportVersion, "v2");
  assert.equal(data.recommendedPrograms[0]?.programId, "program-stable");
  assert.equal(data.recommendedPrograms[0]?.successRateEstimate, 0.63);
});

test("reportV2Mapper_normalizes_snake_case_payload", () => {
  const data = assertSuccess(readFixture("report-v2.snake.json"));

  assert.equal(data.recommendedPrograms[0]?.programId, "program-stable");
  assert.equal(data.recommendedPrograms[0]?.universityName, "가나대");
  assert.deepEqual(data.portfolioStrategy.safety.programIds, ["program-stable"]);
});

test("reportV2Mapper_does_not_double_wrap_generatedReportV2", () => {
  const data = assertSuccess(readFixture("report-v2.camel.json"));

  assert.equal("generatedReportV2" in data, false);
  assert.equal(
    "generatedReportV2" in Object(extractReportV2Body(readFixture("report-v2.camel.json"))),
    false,
  );
});

test("reportV2Mapper_maps_top_level_student_competency_snapshot", () => {
  const raw = readFixture("report-v2.camel.json") as Record<string, unknown>;
  raw.studentCompetency = {
    reading: 80,
    content_understanding: 75,
    prompt_understanding: null,
    structure: 70,
    expression: 74,
  };
  const data = assertSuccess(raw);

  assert.deepEqual(data.studentCompetency, raw.studentCompetency);
});

test("reportV2Mapper_keeps_partial_null_values_distinct_from_zero", () => {
  const raw = readFixture("report-v2.camel.json") as Record<string, unknown>;
  raw.studentCompetency = {
    reading: 0,
    content_understanding: null,
    prompt_understanding: 78,
    structure: null,
    expression: 74,
  };
  const competency = assertSuccess(raw).studentCompetency;

  assert.equal(competency.reading, 0);
  assert.equal(competency.content_understanding, null);
  assert.equal(competency.structure, null);
});

test("reportV2Mapper_distinguishes_empty_student_competency", () => {
  const raw = readFixture("report-v2.camel.json") as Record<string, unknown>;
  raw.studentCompetency = {};

  assert.deepEqual(assertSuccess(raw).studentCompetency, {});
});

test("reportV2Mapper_preserves_all_existing_v2_sections", () => {
  const data = assertSuccess(readFixture("report-v2.camel.json"));

  assert.deepEqual(Object.keys(data).sort(), [...sectionKeys].sort());
});

test("reportV2Mapper_maps_safety_match_reach_to_stable_target_reach", () => {
  const data = assertSuccess(readFixture("report-v2.camel.json"));
  const buckets = Object.fromEntries(
    data.recommendedPrograms.map((program) => [
      program.programId,
      program.displayBucket,
    ]),
  );

  assert.deepEqual(buckets, {
    "program-stable": "stable",
    "program-target": "target",
    "program-reach": "reach",
  });
});

test("reportV2Mapper_successRateEstimate_is_null_not_undefined_when_missing", () => {
  const data = assertSuccess(readFixture("report-v2.camel.json"));

  assert.equal(data.recommendedPrograms[1]?.successRateEstimate, null);
});

test("reportV2Mapper_accepts_portfolio_object_shape", () => {
  const data = assertSuccess(readFixture("report-v2.portfolio-object.json"));

  assert.equal(data.recommendedPrograms[0]?.displayBucket, "stable");
});

test("reportV2Mapper_accepts_legacy_portfolio_array_shape", () => {
  const data = assertSuccess(readFixture("report-v2.portfolio-array.json"));

  assert.equal(data.recommendedPrograms[0]?.displayBucket, "target");
});

test("reportV2Mapper_skips_invalid_program_returns_partial_status", () => {
  const result = reportV2Mapper(readFixture("report-v2.partial-invalid.json"));

  assert.equal(result.status, "partial");
  assert.equal(result.data?.recommendedPrograms.length, 1);
  assert.equal(result.data?.recommendedPrograms[0]?.programId, "valid-program");
  assert.equal(result.errors.length, 1);
});

test("reportV2Mapper_never_uses_category_as_primary_display_bucket", () => {
  const data = mapReportPayloadV2({
    result: [
      {
        id: "program-a",
        category: "RISKY",
        displayBucket: "stable",
        program: {
          id: "program-a",
          university: "테스트대",
        },
      },
    ],
  });

  assert.deepEqual(data.portfolioStrategy.safety.programIds, ["program-a"]);

  const canonical = assertSuccess({
    recommendedPrograms: [
      {
        programId: "category-safe",
        universityName: "카테고리대",
        departmentName: "법학과",
        category: "SAFE",
        finalScore: 88,
      },
    ],
    portfolioStrategy: {
      safety: { programIds: [] },
      match: { programIds: ["category-safe"] },
      reach: { programIds: [] },
    },
  });

  assert.equal(canonical.recommendedPrograms[0]?.displayBucket, "target");
});

test("reportV2Mapper_camel_and_snake_produce_identical_output", () => {
  const camel = assertSuccess(readFixture("report-v2.camel.json"));
  const snake = assertSuccess(readFixture("report-v2.snake.json"));

  assert.deepEqual(camel, snake);
});

test("reportV2Mapper_is_deterministic_and_preserves_partial_order", () => {
  const raw = readFixture("report-v2.partial-invalid.json");
  const first = reportV2Mapper(raw);
  const second = reportV2Mapper(raw);

  assert.deepEqual(first, second);
  assert.deepEqual(
    first.data?.recommendedPrograms.map((program) => program.programId),
    ["valid-program"],
  );
});
