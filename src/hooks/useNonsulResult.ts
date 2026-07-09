import { useState, useEffect } from "react";
import { getReportData } from "../types/nonsulService";
import type { FilterType } from "../components/molecules/result/ResultHeader";
import { mapReportPayloadV2 } from "../adapters/reportV2Mapper";
import type {
  RecommendedProgramItem,
  ReportPayloadV2,
} from "../types/reportPayloadV2";

type PortfolioBucketKey = "safety" | "match" | "reach";

const filterBucketKey: Record<FilterType, PortfolioBucketKey> = {
  하향: "safety",
  적정: "match",
  상향: "reach",
};

const toRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

const displayBucketByFilter: Record<FilterType, "stable" | "target" | "reach"> =
  {
    하향: "stable",
    적정: "target",
    상향: "reach",
  };

const unwrapReportPayload = (payload: unknown): unknown => {
  const record = toRecord(payload);
  return (
    record?.generatedReportV2 ??
    record?.generated_report_v2 ??
    record?.report ??
    record?.data ??
    payload
  );
};

export const useNonsulResult = (
  reportId: string | undefined,
  filter: FilterType,
  limit: number = 4,
) => {
  const [recommendedPrograms, setRecommendedPrograms] = useState<
    RecommendedProgramItem[]
  >([]);
  const [generatedReportV2, setGeneratedReportV2] =
    useState<ReportPayloadV2 | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const fetchBackendData = async () => {
      setIsLoading(true);
      try {
        if (!reportId) {
          if (!ignore) {
            setRecommendedPrograms([]);
            setGeneratedReportV2(null);
          }
          return;
        }

        const reportResponse = await getReportData(reportId);
        const generatedReport = mapReportPayloadV2(
          unwrapReportPayload(reportResponse),
        );
        const selectedBucket = generatedReport.portfolioStrategy[
          filterBucketKey[filter]
        ] ?? { programIds: [] };
        const selectedProgramIds = new Set(selectedBucket.programIds);
        const selectedPrograms =
          selectedProgramIds.size > 0
            ? generatedReport.recommendedPrograms.filter((program) =>
                selectedProgramIds.has(program.programId),
              )
            : generatedReport.recommendedPrograms.filter(
                (program) =>
                  program.displayBucket === displayBucketByFilter[filter],
              );

        console.log(
          "📍 [useNonsulResult] 요청 정보 -> ID:",
          reportId,
          " | 필터:",
          filter,
        );
        console.log("🔥 승효님 백엔드가 준 진짜 데이터:", reportResponse);

        if (!ignore) {
          setGeneratedReportV2(generatedReport);
          setRecommendedPrograms(selectedPrograms.slice(0, limit));
        }
      } catch (e) {
        console.error("결과 리포트 연동 실패:", e);
        if (!ignore) {
          setRecommendedPrograms([]);
          setGeneratedReportV2(null);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    fetchBackendData();

    return () => {
      ignore = true;
    };
  }, [reportId, filter, limit]);

  return { recommendedPrograms, generatedReportV2, isLoading };
};
