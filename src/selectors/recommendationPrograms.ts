import type {
  PortfolioStrategySection,
  RecommendedProgramItem,
} from "../types/reportPayloadV2";
import { orderProgramsByDisplayBucket } from "../utils/orderProgramsByDisplayBucket";

type DisplayBucketFilter = "stable" | "target" | "reach" | "all";
type PortfolioBucketKey = "safety" | "match" | "reach";

const portfolioBucketByDisplayBucket: Record<
  Exclude<DisplayBucketFilter, "all">,
  PortfolioBucketKey
> = { stable: "safety", target: "match", reach: "reach" };

export function selectDisplayProgramsByBucket(
  programs: RecommendedProgramItem[],
  portfolio: PortfolioStrategySection,
  bucket: DisplayBucketFilter,
): RecommendedProgramItem[] {
  if (!["stable", "target", "reach", "all"].includes(bucket)) {
    throw new Error("bucket must be stable, target, reach, or all");
  }

  const orderedPrograms = orderProgramsByDisplayBucket(programs);
  if (bucket === "all") return orderedPrograms;

  const portfolioBucket = portfolio[portfolioBucketByDisplayBucket[bucket]];
  const portfolioProgramIds = new Set(portfolioBucket?.programIds ?? []);
  return portfolioProgramIds.size > 0
    ? orderedPrograms.filter(({ programId }) => portfolioProgramIds.has(programId))
    : orderedPrograms.filter((program) => program.displayBucket === bucket);
}

export function getFirstNonEmptyBucket(
  programs: RecommendedProgramItem[],
  portfolio: PortfolioStrategySection,
  priorityOrder: Exclude<DisplayBucketFilter, "all">[],
): Exclude<DisplayBucketFilter, "all"> | undefined {
  return priorityOrder.find(
    (bucket) => selectDisplayProgramsByBucket(programs, portfolio, bucket).length > 0,
  );
}
