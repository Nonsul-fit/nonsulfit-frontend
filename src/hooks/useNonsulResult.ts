import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getResultData } from "../types/nonsulService";
import api from "../api/axios";
import type { FilterType } from "../components/molecules/result/ResultHeader";

export const useNonsulResult = (filter: FilterType) => {
  const { id: urlId } = useParams<{ id: string }>(); // 주소창에서 ID 가로채기
  const [universityList, setUniversityList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBackendData = async () => {
      setIsLoading(true);
      try {
        let targetId = urlId;

        if (!targetId) {
          const listResponse = await api.get("/nonsulfit/result");
          const reports = listResponse.data?.result || [];

          if (reports.length === 0) {
            setUniversityList([]);
            setIsLoading(false);
            return;
          }

          // 존재하는 리포트 ID들 중 가장 숫자가 큰 것(즉, 방금 생성된 최신 리포트)을 골라냅니다.
          const maxId = Math.max(...reports.map((r: any) => Number(r.id)));
          targetId = String(maxId);
        }

        let backendCategory = "RISKY";
        if (filter === "적정") backendCategory = "MODERATE";
        if (filter === "하향") backendCategory = "SAFE";

        // 💡 알아낸 최신 targetId를 조립해서 상세 데이터를 완벽하게 호출합니다!
        const response = (await getResultData(
          targetId,
          backendCategory,
          "6",
        )) as any;
        const backendList = response.result || [];

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
        setIsLoading(false); // 💥 어떤 상황이 오든 무조건 로딩 바를 꺼줍니다!
      }
    };

    fetchBackendData();
  }, [filter, urlId]);

  return { universityList, isLoading };
};
