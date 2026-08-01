/// <reference types="node" />

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { shouldRefreshAccessToken } from "../../utils/authRetry.ts";

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const source = (path: string) => readFileSync(resolve(sourceRoot, path), "utf8");

test("report detail uses the authenticated API client and Bearer header policy", () => {
  const reports = source("api/reports.ts");
  const client = source("api/axios.ts");

  assert.match(reports, /api\.get<unknown>/);
  assert.match(reports, /requireReportAccessToken\(\)/);
  assert.match(client, /Authorization = `Bearer \$\{token\}`/);
});

test("direct report route waits for auth hydration before mounting", () => {
  const app = source("App.tsx");
  const route = source("components/ProtectedRoute.tsx");

  assert.match(app, /<Route path="\/result\/:reportId" element={<Result \/>} \/>/);
  assert.ok(app.indexOf("/result/:reportId") > app.indexOf("<Route element={<ProtectedRoute />}>"));
  assert.match(route, /if \(isLoading\) return null/);
});

test("expired and INVALID_ACCESS_TOKEN errors refresh at most once", () => {
  const error = (status: number, data: unknown) =>
    ({ response: { status, data } });

  assert.equal(shouldRefreshAccessToken(error(401, {}), false), true);
  assert.equal(
    shouldRefreshAccessToken(error(403, { code: "INVALID_ACCESS_TOKEN" }), false),
    true,
  );
  assert.equal(shouldRefreshAccessToken(error(401, {}), true), false);
});

test("report contract 409 never triggers authentication refresh", () => {
  const error = {
    response: { status: 409, data: { code: "REPORT_CANONICAL_PROJECTION_INCOMPLETE" } },
  };

  assert.equal(shouldRefreshAccessToken(error, false), false);
});

test("refresh failure clears auth and redirects while successful refresh replaces header", () => {
  const client = source("api/axios.ts");

  assert.match(client, /clearAuthStorage\(\)/);
  assert.match(client, /window\.location\.href = "\/login"/);
  assert.match(client, /originalRequest\.headers\.Authorization = `Bearer \$\{newAccessToken\}`/);
  assert.match(client, /originalRequest\._retry = true/);
});
