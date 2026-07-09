/// <reference types="node" />

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const forbiddenAdmissionProbabilityPhrases = [
  ["합격", "확률"].join(" "),
  ["합격", "확률"].join(""),
  ["예상", "합격", "확률"].join(" "),
];

const scoreSemanticFields = [
  "finalScore",
  "estimatedChance",
  ["pass", "Probability"].join(""),
  "suitabilityScore",
];

const currentDir = dirname(fileURLToPath(import.meta.url));
const sourceRoot = resolve(currentDir, "../..");

const readSource = (relativePath: string): string =>
  readFileSync(resolve(sourceRoot, relativePath), "utf8");

const sourceFiles = [
  "adapters/legacyResultMapper.ts",
  "components/organisms/result/EvaluationReport.tsx",
  "components/organisms/result/UnivDetailSummary.tsx",
  "pages/Result/mockResultData.ts",
];

test("Score Semantics Critical regression: result UI never renders admission probability copy", () => {
  const combinedSource = sourceFiles.map(readSource).join("\n");

  for (const phrase of forbiddenAdmissionProbabilityPhrases) {
    assert.equal(
      combinedSource.includes(phrase),
      false,
      `Forbidden admission probability phrase found: ${phrase}`,
    );
  }
});

test("Score Semantics Critical regression: legacy score fields are not rendered with percent units", () => {
  const resultComponentSnapshot = [
    readSource("components/organisms/result/EvaluationReport.tsx"),
    readSource("components/organisms/result/UnivDetailSummary.tsx"),
  ].join("\n");

  for (const field of scoreSemanticFields) {
    const fieldThenPercent = new RegExp(`${field}[\\s\\S]{0,160}%`);
    const percentThenField = new RegExp(`%[\\s\\S]{0,160}${field}`);

    assert.equal(
      fieldThenPercent.test(resultComponentSnapshot),
      false,
      `Score Semantics Critical issue recurred: ${field} appears near a percent unit.`,
    );
    assert.equal(
      percentThenField.test(resultComponentSnapshot),
      false,
      `Score Semantics Critical issue recurred: percent unit appears near ${field}.`,
    );
  }
});
