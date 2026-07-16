/// <reference types="node" />

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import type { AnalysisInputPayload } from "../../contracts/analysisInput.ts";
import { analysisStatusMapper } from "../../adapters/analysisStatusMapper.ts";
import { mapFormToAnalysisInput } from "../../adapters/analysisInputMapper.ts";

const currentDir = dirname(fileURLToPath(import.meta.url));
const sourceRoot = resolve(currentDir, "../..");
const fixtureRoot = resolve(sourceRoot, "fixtures/contracts");

const readFixture = <T>(name: string): T =>
  JSON.parse(readFileSync(resolve(fixtureRoot, name), "utf8")) as T;

test("analysis flow maps input fixture and stores analysisRunId without legacy status fallback", () => {
  const input = readFixture<AnalysisInputPayload>("analysis-input.valid.json");
  const completed = analysisStatusMapper(
    readFixture("analysis-status.completed.json"),
  );

  const mapped = mapFormToAnalysisInput({
    studentInfo: {
      status: "재학생",
      track: "인문사회 계열",
      major: "경영학과",
      targetRegion: "서울",
      applicationCount: "6",
      gender: "남자",
    },
    essayInfo: {
      reading: "80",
      content_understanding: "75",
      prompt_understanding: "78",
      structure: "70",
      expression: "74",
      chart_score: 3,
      english_passage_score: 2,
      math_question_score: 1,
      feedback: "논리적 흐름이 좋습니다.",
    },
    academicInfo: {
      gpaCore: "3.2",
      gpaAll: "3.5",
      mockExams: [
        {
          examType: "6모",
          year: "2026",
          korean: { grade: "2", percentile: "88", standardScore: "128" },
          math: { grade: "3", percentile: "75", standardScore: "122" },
          english: "2",
          inquiry1: "2",
          inquiry2: "3",
        },
      ],
    },
  });

  assert.deepEqual(mapped, input);
  assert.deepEqual(mapped.essayCompetency, {
    reading: 80,
    contentUnderstanding: 75,
    promptUnderstanding: 78,
    structure: 70,
    expression: 74,
    chartPreference: 3,
    englishPreference: 2,
    mathPreference: 1,
    comment: "논리적 흐름이 좋습니다.",
  });
  assert.equal(completed.status, "COMPLETED");
  assert.equal(completed.reportId, "7d5f65c4-a038-4b94-a8a2-b896449a9ddd");
});

test("regression_polling_continues_during_processing", () => {
  const processing = analysisStatusMapper(
    readFixture("analysis-status.processing.json"),
  );

  assert.equal(processing.status, "PROCESSING");
  assert.equal(processing.reportId, null);
});

test("primary analysis polling source does not contain legacy status endpoint", () => {
  const analysisApi = readFileSync(resolve(sourceRoot, "api/analysis.ts"), "utf8");
  const pollingHook = readFileSync(
    resolve(sourceRoot, "hooks/useAnalysisPolling.ts"),
    "utf8",
  );

  assert.equal(analysisApi.includes("/nonsulfit/status"), false);
  assert.equal(pollingHook.includes("/nonsulfit/status"), false);
});
