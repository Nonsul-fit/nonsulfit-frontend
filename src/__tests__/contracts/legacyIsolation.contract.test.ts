/// <reference types="node" />

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const sourceRoot = resolve(currentDir, "../..");

const readSource = (relativePath: string): string =>
  readFileSync(resolve(sourceRoot, relativePath), "utf8");

test("legacyApi_exposes_all_five_compatibility_operations", () => {
  const legacySource = readSource("adapters/legacyApi.ts");

  assert.equal(/getStatus\s*:/.test(legacySource), true);
  assert.equal(/getResultList\s*:/.test(legacySource), true);
  assert.equal(/getResultDetail\s*:/.test(legacySource), true);
  assert.equal(/getChatHistory\s*:/.test(legacySource), true);
  assert.equal(/sendChatMessage\s*:/.test(legacySource), true);
});

test("regression_legacy_endpoint_never_called_in_primary_flow", () => {
  const primarySources = [
    "api/analysis.ts",
    "api/reports.ts",
    "api/chat.ts",
    "pages/Loading/LoadingPage.tsx",
    "pages/Result/Result.tsx",
    "pages/Result/ResultList.tsx",
    "components/organisms/ChatBtn.tsx",
  ].map(readSource);
  const combined = primarySources.join("\n");

  assert.equal(combined.includes("/nonsulfit/status"), false);
  assert.equal(combined.includes("/nonsulfit/result"), false);
  assert.equal(combined.includes("/nonsulfit/chat"), false);
});

test("regression_publicId_never_used_in_new_report_api_calls", () => {
  const reportApi = readSource("api/reports.ts");
  const chatApi = readSource("api/chat.ts");

  assert.equal(reportApi.includes("publicId"), false);
  assert.equal(chatApi.includes("publicId"), false);
});

test("legacy endpoints exist only in legacyApi module among api and primary UI", () => {
  const legacySource = readSource("adapters/legacyApi.ts");

  assert.equal(legacySource.includes("/nonsulfit/status"), true);
  assert.equal(legacySource.includes("/nonsulfit/result"), true);
  assert.equal(legacySource.includes("/nonsulfit/chat"), true);
});
