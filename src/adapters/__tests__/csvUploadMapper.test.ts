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
  });
  assert.equal("chartPreference" in selectCsvCompetency(response), false);
  assert.equal(response.analysisRunId, null);
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
