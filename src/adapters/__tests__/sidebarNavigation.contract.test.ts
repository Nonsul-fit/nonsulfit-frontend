/// <reference types="node" />
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("sidebar exposes mypage after the existing three menus", () => {
  const sidebar = readFileSync(
    new URL("../../components/organisms/Sidebar.tsx", import.meta.url),
    "utf8",
  );
  const labels = ["성적 입력", "분석 리포트", "모의 테스트", "마이페이지"];
  const indexes = labels.map((label) => sidebar.indexOf(label));

  assert.ok(indexes.every((index) => index >= 0));
  assert.deepEqual(indexes, [...indexes].sort((left, right) => left - right));
  assert.match(sidebar, /\{ name: "마이페이지", path: "\/mypage" \}/);
  assert.match(sidebar, /className=\{\(\{ isActive \}\) =>/);
});
