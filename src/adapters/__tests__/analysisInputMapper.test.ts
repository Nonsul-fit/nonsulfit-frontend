/// <reference types="node" />

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import type {
  AnalysisInputPayload,
  NonsulFormState,
} from "../../contracts/analysisInput.ts";
import { AnalysisInputValidationError } from "../../contracts/analysisInput.ts";
import {
  mapFormToAnalysisInput,
  validateAnalysisInput,
} from "../analysisInputMapper.ts";

const currentDir = dirname(fileURLToPath(import.meta.url));
const fixtureRoot = resolve(currentDir, "../../fixtures/contracts");

const readFixture = (name: string): AnalysisInputPayload =>
  JSON.parse(readFileSync(resolve(fixtureRoot, name), "utf8"));

const createValidForm = (): NonsulFormState => ({
  studentInfo: {
    status: "재학생",
    track: "인문사회 계열",
    major: "경영학과",
    targetRegion: "서울",
    applicationCount: "6",
    gender: "남자",
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

test("analysisInputMapper_maps_application_count", () => {
  assert.deepEqual(
    mapFormToAnalysisInput(createValidForm()),
    readFixture("analysis-input.valid.json"),
  );
});

test("analysisInputMapper_normalizes_gender_to_unknown_when_empty", () => {
  const form = createValidForm();
  form.studentInfo.gender = "";

  assert.equal(mapFormToAnalysisInput(form).student.gender, "UNKNOWN");
});

test("analysisInputMapper_maps_csat_exam_type_correctly", () => {
  const form = createValidForm();
  form.academicInfo.mockExams = [
    {
      examType: "수능",
      year: "2026",
      korean: { grade: "1", percentile: "", standardScore: "" },
      math: { grade: "", percentile: "", standardScore: "" },
      english: "",
      inquiry1: "",
      inquiry2: "",
    },
  ];

  assert.equal(mapFormToAnalysisInput(form).testGrades[0]?.examType, "CSAT");
});

test("analysisInputMapper_preserves_percentile_and_standard_score_when_present", () => {
  const exam = mapFormToAnalysisInput(createValidForm()).testGrades[0];

  assert.equal(exam?.koreanPercentile, 88);
  assert.equal(exam?.koreanStandardScore, 128);
  assert.equal(exam?.mathPercentile, 75);
  assert.equal(exam?.mathStandardScore, 122);
});

test("analysisInputMapper_omits_empty_exam_grades", () => {
  const form = createValidForm();
  form.academicInfo.mockExams = [
    {
      examType: "6모",
      year: "2026",
      korean: { grade: "2", percentile: "", standardScore: "" },
      math: { grade: "", percentile: "", standardScore: "" },
      english: "",
      inquiry1: "",
      inquiry2: "",
    },
  ];

  assert.deepEqual(mapFormToAnalysisInput(form).testGrades[0], {
    examType: "MOCK",
    year: 2026,
    month: 6,
    koreanGrade: 2,
    isRepresentative: true,
  });
});

test("analysisInputMapper_rejects_zero_school_grade", () => {
  assert.throws(
    () => validateAnalysisInput(readFixture("analysis-input.invalid-zero-grade.json")),
    AnalysisInputValidationError,
  );
});

test("analysisInputMapper_marks_one_representative_when_exams_exist", () => {
  const form = createValidForm();
  form.academicInfo.mockExams = [
    ...form.academicInfo.mockExams!,
    {
      examType: "9모",
      year: "2026",
      korean: { grade: "3", percentile: "", standardScore: "" },
      math: { grade: "", percentile: "", standardScore: "" },
      english: "",
      inquiry1: "",
      inquiry2: "",
    },
  ];

  assert.equal(
    mapFormToAnalysisInput(form).testGrades.filter(
      (exam) => exam.isRepresentative,
    ).length,
    1,
  );
});

test("analysisInputMapper_allows_zero_representative_when_exam_list_empty", () => {
  assert.deepEqual(
    validateAnalysisInput(readFixture("analysis-input.minimum.json")).testGrades,
    [],
  );
});

test("analysisInputMapper_rejects_unknown_academic_value", () => {
  const form = createValidForm();
  form.studentInfo.track = "예체능 계열";

  assert.throws(
    () => mapFormToAnalysisInput(form),
    AnalysisInputValidationError,
  );
});

test("analysisInputMapper_is_pure_and_deterministic", () => {
  const form = createValidForm();
  const before = structuredClone(form);
  const first = mapFormToAnalysisInput(form);
  const second = mapFormToAnalysisInput(form);

  assert.deepEqual(form, before);
  assert.deepEqual(first, second);
});
