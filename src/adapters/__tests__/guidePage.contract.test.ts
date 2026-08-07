/// <reference types="node" />
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("guide route, navigation, SDK and analysis CTA are wired", () => {
  const app = readFileSync(new URL("../../App.tsx", import.meta.url), "utf8");
  const sidebar = readFileSync(new URL("../../components/organisms/Sidebar.tsx", import.meta.url), "utf8");
  const guide = readFileSync(new URL("../../pages/Guide/GuidePage.tsx", import.meta.url), "utf8");
  const html = readFileSync(new URL("../../../index.html", import.meta.url), "utf8");

  assert.match(app, /path="\/guide"/);
  assert.match(sidebar, /name: "사용법", path: "\/guide", isNew: true/);
  assert.match(sidebar, />\s*New\s*</);
  assert.match(html, /https:\/\/script\.supademo\.com\/supademo\.js/);
  assert.match(guide, /window\.Supademo\.open\(DEMO_ID\)/);
  assert.match(guide, /if \(!window\.Supademo\?\.open\)/);
  assert.match(guide, /navigate\("\/home"\)/);
});
