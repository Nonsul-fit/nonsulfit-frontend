import { useEffect, useState } from "react";
import { fetchReportDetail } from "../api/reports";
import type { ReportMappingResult } from "../contracts/reportResponse";
import type {
  PortfolioStrategySection,
  RecommendedProgramItem,
} from "../types/reportPayloadV2";

type NormalizedProgram = RecommendedProgramItem;
type NormalizedPortfolio = PortfolioStrategySection;
type DisplayBucketFilter = "stable" | "target" | "reach" | "all";
type PortfolioBucketKey = "safety" | "match" | "reach";

const portfolioBucketByDisplayBucket: Record<
  Exclude<DisplayBucketFilter, "all">,
  PortfolioBucketKey
> = {
  stable: "safety",
  target: "match",
  reach: "reach",
};

export function selectDisplayProgramsByBucket(
  programs: NormalizedProgram[],
  portfolio: NormalizedPortfolio,
  bucket: DisplayBucketFilter,
): NormalizedProgram[] {
  if (
    bucket !== "stable" &&
    bucket !== "target" &&
    bucket !== "reach" &&
    bucket !== "all"
  ) {
    throw new Error("bucket must be stable, target, reach, or all");
  }

  if (bucket === "all") {
    return programs.filter(() => true);
  }

  const portfolioBucket = portfolio[portfolioBucketByDisplayBucket[bucket]];
  const portfolioProgramIds = new Set(portfolioBucket?.programIds ?? []);

  if (portfolioProgramIds.size > 0) {
    return programs.filter((program) => portfolioProgramIds.has(program.programId));
  }

  return programs.filter((program) => program.displayBucket === bucket);
}

export function getFirstNonEmptyBucket(
  programs: NormalizedProgram[],
  portfolio: NormalizedPortfolio,
  priorityOrder: Exclude<DisplayBucketFilter, "all">[],
): Exclude<DisplayBucketFilter, "all"> | undefined {
  return priorityOrder.find(
    (bucket) =>
      selectDisplayProgramsByBucket(programs, portfolio, bucket).length > 0,
  );
}

export function useNonsulResult(reportId: string): {
  result: ReportMappingResult | null;
  isLoading: boolean;
  networkError: unknown | null;
} {
  const [result, setResult] = useState<ReportMappingResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [networkError, setNetworkError] = useState<unknown | null>(null);

  useEffect(() => {
    let ignore = false;

    const fetchBackendData = async () => {
      setIsLoading(true);
      setNetworkError(null);

      try {
        if (!reportId) {
          if (!ignore) {
            setResult(null);
          }
          return;
        }

        const reportResult = await fetchReportDetail(reportId);

        if (!ignore) {
          setResult(reportResult);
        }
      } catch (error) {
        if (!ignore) {
          setResult(null);
          setNetworkError(error);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    void fetchBackendData();

    return () => {
      ignore = true;
    };
  }, [reportId]);

  return { result, isLoading, networkError };
}
