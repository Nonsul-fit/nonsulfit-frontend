/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";
import { mapReportPayloadV2 } from "../reportV2Mapper.ts";

const getBucketProgramIds = (category: string) => {
  const report = mapReportPayloadV2({
    result: [
      {
        id: "program-a",
        category,
        displayBucket: "stable",
        program: {
          id: "program-a",
          university: "테스트대",
        },
      },
    ],
  });

  return {
    safety: report.portfolioStrategy.safety.programIds,
    match: report.portfolioStrategy.match.programIds,
    reach: report.portfolioStrategy.reach.programIds,
  };
};

test("Recommendation card placement uses displayBucket, not category", () => {
  assert.deepEqual(getBucketProgramIds("RISKY"), {
    safety: ["program-a"],
    match: [],
    reach: [],
  });

  assert.deepEqual(getBucketProgramIds("SAFE"), {
    safety: ["program-a"],
    match: [],
    reach: [],
  });
});
