import { mapReportPayloadV2 } from "./reportV2Mapper";
import type { ReportPayloadV2 } from "../types/reportPayloadV2";

export function legacyResultMapper(raw: unknown): ReportPayloadV2 {
  return mapReportPayloadV2(raw);
}

export const mapLegacyResultToUniversityList = (response: any): any[] => {
  const backendList = response.result || [];

  if (backendList.length === 0) {
    return [];
  }

  let riskyCount = 0;
  let moderateCount = 0;
  let safeCount = 0;

  return backendList.map((item: any, idx: number) => {
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
        suitabilityScore: item.estimatedChance || 65,
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
};
