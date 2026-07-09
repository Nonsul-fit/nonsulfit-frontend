import { useState, useEffect } from "react";
import { getResultData } from "../types/nonsulService";
import api from "../api/axios";
import type { FilterType } from "../components/molecules/result/ResultHeader";
import { mapLegacyResultToUniversityList } from "../adapters/legacyResultMapper";

export const useNonsulResult = (
  id: string | undefined,
  filter: FilterType,
  limit: number = 4,
) => {
  const [universityList, setUniversityList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBackendData = async () => {
      setIsLoading(true);
      try {
        let targetId = id;

        if (!targetId) {
          const listResponse = await api.get("/nonsulfit/result");
          const reports = listResponse.data?.result || [];

          if (reports.length === 0) {
            setUniversityList([]);
            setIsLoading(false);
            return;
          }

          const maxId = Math.max(...reports.map((r: any) => Number(r.id)));
          targetId = String(maxId);
        }

        let backendCategory = "RISKY";
        if (filter === "적정") backendCategory = "MODERATE";
        if (filter === "하향") backendCategory = "SAFE";

        const response = (await getResultData(
          targetId,
          backendCategory,
        )) as any;

        console.log(
          "📍 [useNonsulResult] 요청 정보 -> ID:",
          targetId,
          " | 카테고리:",
          backendCategory,
        );
        console.log("🔥 승효님 백엔드가 준 진짜 데이터:", response);

        setUniversityList(mapLegacyResultToUniversityList(response));
      } catch (e) {
        console.error("결과 리포트 연동 실패:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBackendData();
  }, [id, filter, limit]);

  return { universityList, isLoading };
};
