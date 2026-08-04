import assert from "node:assert/strict";
import test from "node:test";
import {
  csvUploadMapper,
  parseCsvUploadError,
  selectCsvCompetency,
} from "../csvUploadMapper.ts";

test("csvUploadMapper maps snake case competency at the API boundary", () => {
  const response = csvUploadMapper({
    input: {
      essay_competency: {
        reading: "81",
        content_understanding: 82,
        prompt_understanding: 83,
        structure: 84,
        expression: 85,
        comment: "논리적 흐름이 안정적입니다.",
        chart_preference: 3,
      },
    },
    csv_import: {
      file_name: "scores.csv",
      encoding: "cp949",
      imported_row_count: 1,
      updated_fields: ["reading"],
    },
  });

  assert.deepEqual(selectCsvCompetency(response), {
    reading: 81,
    contentUnderstanding: 82,
    promptUnderstanding: 83,
    structure: 84,
    expression: 85,
    comment: "논리적 흐름이 안정적입니다.",
  });
  assert.equal("chartPreference" in selectCsvCompetency(response), false);
  assert.equal(response.analysisRunId, null);
});

test("csvUploadMapper maps a camel case competency comment", () => {
  const response = csvUploadMapper({
    input: {
      essayCompetency: {
        reading: 91,
        contentUnderstanding: 92,
        promptUnderstanding: 93,
        structure: 94,
        expression: 95,
        comment: "근거를 더 구체화하면 좋겠습니다.",
      },
    },
    csvImport: {
      fileName: "one-off-summary.csv",
      encoding: "utf-8",
      importedRowCount: 1,
      updatedFields: ["comment"],
    },
  });

  assert.equal(
    selectCsvCompetency(response).comment,
    "근거를 더 구체화하면 좋겠습니다.",
  );
});

test("csvUploadMapper keeps an absent comment separate from score validation", () => {
  const response = csvUploadMapper({
    input: {
      essayCompetency: {
        reading: 71,
        contentUnderstanding: 72,
        promptUnderstanding: 73,
        structure: 74,
        expression: 75,
      },
    },
    csvImport: {
      fileName: "scores-only.csv",
      encoding: "utf-8",
      importedRowCount: 1,
      updatedFields: [],
    },
  });

  assert.deepEqual(selectCsvCompetency(response), {
    reading: 71,
    contentUnderstanding: 72,
    promptUnderstanding: 73,
    structure: 74,
    expression: 75,
    comment: null,
  });
});

test("parseCsvUploadError reads the common backend error envelope", () => {
  assert.deepEqual(
    parseCsvUploadError({
      success: false,
      error: {
        code: "CSV_ENCODING_UNSUPPORTED",
        message: "unsupported",
        details: { encoding: "utf-16" },
      },
    }),
    {
      code: "CSV_ENCODING_UNSUPPORTED",
      message: "unsupported",
      details: { encoding: "utf-16" },
    },
  );
});
