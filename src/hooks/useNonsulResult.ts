import { useState, useEffect } from "react";
import { getResultData } from "../types/nonsulService";
import api from "../api/axios";
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

const legacyRequestBuckets = [
  { requestBucket: "SAFE", displayBucket: "stable" },
  { requestBucket: "MODERATE", displayBucket: "target" },
  { requestBucket: "RISKY", displayBucket: "reach" },
] as const;

const toRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

export const useNonsulResult = (
  id: string | undefined,
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
        let targetId = id;

        if (!targetId) {
          const listResponse = await api.get("/nonsulfit/result");
          const listResponseData = toRecord(listResponse.data);
          const reports = Array.isArray(listResponseData?.result)
            ? listResponseData.result
            : [];

          if (reports.length === 0) {
            if (!ignore) {
              setRecommendedPrograms([]);
              setGeneratedReportV2(null);
            }
            setIsLoading(false);
            return;
          }

          const maxId = Math.max(
            ...reports.map((report) => Number(toRecord(report)?.id)),
          );
          targetId = String(maxId);
        }

        const legacyResponses = await Promise.all(
          legacyRequestBuckets.map(({ requestBucket }) =>
            getResultData(targetId, requestBucket, String(limit)),
          ),
        );
        const reportV2Response = legacyResponses.find(
          (response) => !!toRecord(response)?.generatedReportV2,
        );
        const generatedReport = mapReportPayloadV2(
          reportV2Response ?? {
            result: legacyResponses.flatMap((response, idx) => {
              const responseRecord = toRecord(response);
              return Array.isArray(responseRecord?.result)
                ? responseRecord.result.map((item) => ({
                    ...(toRecord(item) ?? {}),
                    displayBucket: legacyRequestBuckets[idx].displayBucket,
                  }))
                : [];
            }),
          },
        );
        const selectedBucket = generatedReport.portfolioStrategy[
          filterBucketKey[filter]
        ] ?? { programIds: [] };
        const selectedProgramIds = new Set(selectedBucket.programIds);
        const selectedPrograms = generatedReport.recommendedPrograms.filter(
          (program) => selectedProgramIds.has(program.programId),
        );

        console.log(
          "📍 [useNonsulResult] 요청 정보 -> ID:",
          targetId,
          " | 필터:",
          filter,
        );
        console.log("🔥 승효님 백엔드가 준 진짜 데이터:", legacyResponses);

        if (!ignore) {
          setGeneratedReportV2(generatedReport);
          setRecommendedPrograms(selectedPrograms);
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
  }, [id, filter, limit]);

  return { recommendedPrograms, generatedReportV2, isLoading };
};
