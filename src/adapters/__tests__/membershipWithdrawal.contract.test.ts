/// <reference types="node" />
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("membership withdrawal uses DELETE auth/me without response parsing", () => {
  const authApi = source("../../api/auth.ts");
  assert.match(authApi, /api\.delete\("\/auth\/me", \{ transformResponse: \[\] \}\)/);
  assert.equal(authApi.includes("response.json"), false);
});

test("membership withdrawal clears session in required order", () => {
  const page = source("../../pages/MyPage/MyPage.tsx");
  const calls = ["clearAuthStorage();", "resetAuthState();", "queryClient.clear();", "clearAuthorizationHeader();", 'navigate("/login", { replace: true });'];
  const indexes = calls.map((call) => page.indexOf(call));
  assert.ok(indexes.every((index) => index >= 0));
  assert.deepEqual(indexes, [...indexes].sort((a, b) => a - b));
});

test("membership withdrawal blocks duplicates and clears 401 sessions", () => {
  const page = source("../../pages/MyPage/MyPage.tsx");
  assert.match(page, /if \(isSubmitting\) return/);
  assert.match(page, /status === 401/);
  assert.match(page, /disabled=\{isSubmitting\}/);
});

test("mypage is protected", () => {
  const app = source("../../App.tsx");
  const protectedStart = app.indexOf('<Route element={<ProtectedRoute />}>');
  const myPage = app.indexOf('<Route path="/mypage" element={<MyPage />} />');
  const protectedEnd = app.indexOf("</Route>", myPage);
  assert.ok(protectedStart >= 0 && myPage > protectedStart && protectedEnd > myPage);
});
