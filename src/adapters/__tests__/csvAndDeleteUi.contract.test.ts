import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("CSV upload uses the authenticated client, exact route, file field and no analysis", () => {
  const api = source("api/csvInput.ts");
  assert.match(api, /body\.append\("file", file\)/);
  assert.match(api, /api\.post<unknown>\("\/api\/v1\/nonsulfit\/input\/csv"/);
  assert.match(api, /headers: \{ "Content-Type": undefined \}/);
  assert.match(api, /triggerAnalysis: false/);
});

test("step2 keeps preference fields outside CSV response synchronization", () => {
  const page = source("pages/Step/Step02.tsx");
  assert.match(page, /content_understanding: String\(values\.contentUnderstanding\)/);
  assert.match(page, /prompt_understanding: String\(values\.promptUnderstanding\)/);
  assert.doesNotMatch(page, /chart_score: String\(values/);
  assert.match(page, /uploadStatus === "uploading"/);
  assert.match(page, /accept="\.csv,text\/csv"/);
});

test("report delete uses the exact route and disables response parsing", () => {
  const api = source("api/reports.ts");
  assert.match(api, /api\.delete\(`\/reports\/\$\{encodeURIComponent/);
  assert.match(api, /transformResponse: \[\]/);
});

test("delete UI always opens a confirmation modal before invoking deletion", () => {
  const list = source("pages/Result/ResultList.tsx");
  const detail = source("pages/Result/Result.tsx");
  const modal = source("components/molecules/result/DeleteReportModal.tsx");
  assert.match(list, /setDeleteTarget\(report\)/);
  assert.match(detail, /setIsDeleteModalOpen\(true\)/);
  assert.match(modal, /삭제한 리포트와 관련 상담 내역은 복구할 수 없습니다/);
  assert.match(modal, /isDeleting \? "삭제 중\.\.\." : "영구 삭제"/);
});
