import { useState, useEffect } from "react";
import { getResultData } from "../types/nonsulService";
import api from "../api/axios";
import type { FilterType } from "../components/molecules/result/ResultHeader";

// 🔑 1. 세 번째 인자로 limit(기본값 4)을 받을 수 있도록 매개변수 확장!
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

        // 🔑 2. 고정되어 있던 "6"을 지우고 유저가 선택한 limit 개수를 숫자로 전달!
        const response = (await getResultData(
          targetId,
          backendCategory,
          String(limit),
        )) as any;

        console.log(
          "📍 [useNonsulResult] 요청 정보 -> ID:",
          targetId,
          " | 카테고리:",
          backendCategory,
        );
        console.log("🔥 승효님 백엔드가 준 진짜 데이터:", response);

        // 🔑 3. 혹시 모를 오버플로우 방지 및 확실한 개수 제어를 위해 .slice(0, limit) 처리
        const backendList = (response.result || []).slice(0, limit);

        if (backendList.length === 0) {
          setUniversityList([]);
          return;
        }

        let riskyCount = 0;
        let moderateCount = 0;
        let safeCount = 0;

        const mappedList = backendList.map((item: any, idx: number) => {
          const convertedReading = (item.reading || 0) / 20;
          const convertedContent = (item.contentComprehension || 0) / 20;
          const convertedPrompt = (item.understanding || 0) / 20;
          const convertedStructure = (item.structure || 0) / 20;
          const convertedExpress = (item.express || 0) / 20;

          const prog = item.program || {};

          let itemTag = "추천";
          if (item.category === "RISKY") {
            riskyCount++;
            itemTag = `상향 ${riskyCount}`;
          } else if (item.category === "MODERATE") {
            moderateCount++;
            itemTag = `적정 ${moderateCount}`;
          } else if (item.category === "SAFE") {
            safeCount++;
            itemTag = `하향 ${safeCount}`;
          }

          return {
            id: String(prog.program_id || idx),
            tag: itemTag,
            university: prog.university || "미정 대학",
            campus: prog.campus || "본교",
            summary: {
              track: "논술전형",
              difficultyCode: "MID",
              difficultyLabel: "중",
              selectionMethodText: `논술 ${prog.evaluationWeight?.essayWeight || 100}% + 교과 ${prog.evaluationWeight?.schoolRecordWeight || 0}%`,
              essayRatio: prog.evaluationWeight?.essayWeight || 100,
              naesinRatio: prog.evaluationWeight?.schoolRecordWeight || 0,
              csatRequirement:
                prog.csatRequirement?.requirementText || "수능최저 없음",
              examDateText: prog.examDate || "대학 홈페이지 참조",
              latestCompetitionRate: prog.competitionRateLatest || 0,
              passProbability: item.estimatedChance || 65,
              myTotalScore: item.totalScore || 82,
              cutoffScore: 75,
              isCsatComplied: true,
            },
            radarChartData: [
              { subject: "독해력", score: convertedReading },
              { subject: "내용이해력", score: convertedContent },
              { subject: "문제이해력", score: convertedPrompt },
              { subject: "구성력", score: convertedStructure },
              { subject: "표현력", score: convertedExpress },
            ],
            explanations: {
              comment: prog.comment || "AI 분석 리포트 생성이 완료되었습니다.",
              notes: item.portfolioReason ? [item.portfolioReason] : [],
              recommendationReason:
                item.overallEvaluationText ||
                "수민님의 학업 지표를 기반으로 선정된 리포트입니다.",
              selectionReason:
                item.overallEvaluationText ||
                "수민님의 학업 지표를 기반으로 선정된 리포트입니다.",
              essayFeedback:
                prog.comment ||
                "전반적인 문장 요약력과 구조화 능력이 안정적입니다.",
              entranceStrategy:
                item.strategy ||
                "제한 시간 내에 정형화된 정답 템플릿을 빠르게 도출하는 훈련이 필요합니다.",
              departmentRecommendation:
                item.recommendDepartment || "추천 학과 지원 선호",
            },
            departments: [
              {
                department: item.recommendDepartment || "추천 학과",
                fieldGroup: "general",
                latestRate: prog.competitionRateLatest || 0,
                historyRates: { "2026": prog.competitionRateLatest || 0 },
              },
            ],
          };
        });

        setUniversityList(mappedList);
      } catch (e) {
        console.error("결과 리포트 연동 실패:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBackendData();
  }, [id, filter, limit]); // 🔑 4. 의존성 배열에 limit을 추가하여 개수 선택 시 실시간 재호출 보장!

  return { universityList, isLoading };
};
