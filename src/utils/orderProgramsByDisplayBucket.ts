import type { RecommendedProgramItem } from "../types/reportPayloadV2";

export const DISPLAY_BUCKET_ORDER = {
  reach: 0,
  target: 1,
  stable: 2,
} as const;

const compareNullableNumbers = (
  left: number | null | undefined,
  right: number | null | undefined,
  direction: "asc" | "desc",
): number => {
  const leftMissing = left == null || !Number.isFinite(left);
  const rightMissing = right == null || !Number.isFinite(right);

  if (leftMissing !== rightMissing) return leftMissing ? 1 : -1;
  if (leftMissing || rightMissing || left === right) return 0;
  return direction === "asc" ? left - right : right - left;
};

export const orderProgramsByDisplayBucket = (
  programs: readonly RecommendedProgramItem[],
): RecommendedProgramItem[] =>
  [...programs].sort((left, right) => {
    const bucketDifference =
      DISPLAY_BUCKET_ORDER[left.displayBucket] -
      DISPLAY_BUCKET_ORDER[right.displayBucket];
    if (bucketDifference !== 0) return bucketDifference;

    const rankDifference = compareNullableNumbers(
      left.selectionRank,
      right.selectionRank,
      "asc",
    );
    if (rankDifference !== 0) return rankDifference;

    const scoreDifference = compareNullableNumbers(
      left.finalScore,
      right.finalScore,
      "desc",
    );
    if (scoreDifference !== 0) return scoreDifference;

    return left.programId < right.programId
      ? -1
      : left.programId > right.programId
        ? 1
        : 0;
  });
