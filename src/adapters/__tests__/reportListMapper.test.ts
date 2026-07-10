/// <reference types="node" />

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import type { NormalizedReportList } from "../../contracts/reportList.ts";
import { reportListMapper } from "../reportListMapper.ts";

const currentDir = dirname(fileURLToPath(import.meta.url));
const fixtureRoot = resolve(currentDir, "../../fixtures/contracts");

const readFixture = (name: string): unknown =>
  JSON.parse(readFileSync(resolve(fixtureRoot, name), "utf8"));

const comparable = (list: NormalizedReportList) => ({
  items: list.items.map((item) => ({
    ...item,
    createdAt: item.createdAt?.toISOString() ?? null,
  })),
  pagination: list.pagination,
});

test("reportListMapper_normalizes_top_level_array_payload_directly", () => {
  const list = reportListMapper(readFixture("report-list.array.json"));

  assert.equal(list.items[0]?.reportId, "report-1");
  assert.equal(list.items[0]?.createdAt?.toISOString(), "2026-07-10T04:30:00.000Z");
});

test("reportListMapper_accepts_items_envelope", () => {
  const list = reportListMapper(readFixture("report-list.items.json"));

  assert.equal(list.items[0]?.reportId, "report-1");
  assert.deepEqual(list.pagination, {
    page: 1,
    pageSize: 10,
    totalCount: 1,
    hasNext: false,
  });
});

test("reportListMapper_accepts_reports_envelope", () => {
  const list = reportListMapper(readFixture("report-list.reports.json"));

  assert.equal(list.items[0]?.reportId, "report-1");
});

test("reportListMapper_accepts_result_envelope", () => {
  const list = reportListMapper(readFixture("report-list.result.json"));

  assert.equal(list.items[0]?.reportId, "report-1");
  assert.equal(list.items[0]?.title, "첫 번째 분석");
});

test("reportListMapper_prefers_reports_over_result_and_items_when_multiple_keys_present", () => {
  const list = reportListMapper({
    reports: [{ reportId: "reports-first", createdAt: "2026-07-10T04:30:00.000Z" }],
    result: [{ reportId: "result-second", createdAt: "2026-07-10T04:30:00.000Z" }],
    items: [{ reportId: "items-third", createdAt: "2026-07-10T04:30:00.000Z" }],
  });

  assert.deepEqual(
    list.items.map((item) => item.reportId),
    ["reports-first"],
  );
});

test("reportListMapper_preserves_existing_item_fields", () => {
  const list = reportListMapper(readFixture("report-list.array.json"));

  assert.equal(list.items[0]?.title, "첫 번째 분석");
  assert.equal(list.items[0]?.updatedAt, "2026-07-10T05:30:00.000Z");
  assert.equal(list.items[0]?.status, "COMPLETED");
});

test("reportListMapper_handles_invalid_iso_date", () => {
  const list = reportListMapper([
    { reportId: "invalid-date", createdAt: "not-a-date" },
  ]);

  assert.equal(list.items[0]?.createdAt, null);
});

test("reportListMapper_equivalent_envelopes_are_deterministic", () => {
  const array = reportListMapper(readFixture("report-list.array.json"));
  const items = reportListMapper(readFixture("report-list.items.json"));
  const reports = reportListMapper(readFixture("report-list.reports.json"));
  const result = reportListMapper(readFixture("report-list.result.json"));

  assert.deepEqual(comparable(array).items, comparable(items).items);
  assert.deepEqual(comparable(array).items, comparable(reports).items);
  assert.deepEqual(comparable(array).items, comparable(result).items);
  assert.deepEqual(comparable(array), comparable(reportListMapper(readFixture("report-list.array.json"))));
});
