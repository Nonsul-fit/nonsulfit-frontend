/// <reference types="node" />

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { AnalysisStatusContractError } from "../../contracts/analysisStatus.ts";
import { analysisStatusMapper } from "../analysisStatusMapper.ts";

const currentDir = dirname(fileURLToPath(import.meta.url));
const fixtureRoot = resolve(currentDir, "../../fixtures/contracts");

const readFixture = (name: string): unknown =>
  JSON.parse(readFileSync(resolve(fixtureRoot, name), "utf8"));

test("analysisStatusMapper_accepts_processing", () => {
  const status = analysisStatusMapper(readFixture("analysis-status.processing.json"));

  assert.equal(status.status, "PROCESSING");
  assert.equal(status.reportId, null);
});

test("analysisStatusMapper_separates_report_id_and_public_id", () => {
  const status = analysisStatusMapper(readFixture("analysis-status.completed.json"));

  assert.equal(status.reportId, "7d5f65c4-a038-4b94-a8a2-b896449a9ddd");
  assert.equal(status.publicId, 31);
});

test("analysisStatusMapper_rejects_completed_without_report_id", () => {
  assert.throws(
    () =>
      analysisStatusMapper({
        analysisRunId: "05a709b2-aa3e-4339-8577-c94828cbdccc",
        status: "COMPLETED",
      }),
    AnalysisStatusContractError,
  );
});

test("analysisStatusMapper_rejects_unknown_status_value", () => {
  assert.throws(
    () =>
      analysisStatusMapper({
        analysisRunId: "05a709b2-aa3e-4339-8577-c94828cbdccc",
        status: "UNKNOWN",
      }),
    AnalysisStatusContractError,
  );
});

test("analysisStatusMapper_normalizes_unexpected_reportId_before_completion_to_null_with_warning", () => {
  const status = analysisStatusMapper(readFixture("analysis-status.pending.json"));

  assert.equal(status.reportId, null);
  assert.deepEqual(status.contractWarnings, [
    "unexpected_reportId_before_completion",
  ]);
});
