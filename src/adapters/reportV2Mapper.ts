import type {
  DisplayBucket,
  PortfolioBucketStrategy,
  ProgramCategory,
  RecommendedProgramItem,
  ReportPayloadV2,
} from "../types/reportPayloadV2";

interface LegacyProgram {
  id?: string | number;
  program_id?: string | number;
  university?: string;
  campus?: string;
  comment?: string | null;
  examDate?: string;
  csatRequirement?: {
    requirementText?: string;
  };
  evaluationWeight?: {
    essayWeight?: number;
    schoolRecordWeight?: number;
  };
  competitionRateLatest?: number;
}

interface LegacyResultItem {
  id?: string | number;
  displayBucket?: unknown;
  category?: ProgramCategory;
  totalScore?: number;
  reading?: number | null;
  contentComprehension?: number | null;
  understanding?: number | null;
  structure?: number | null;
  express?: number | null;
  portfolioReason?: string;
  overallEvaluationText?: string;
  strategy?: string;
  recommendDepartment?: string;
  program?: LegacyProgram | null;
}

export const mapReportPayloadV2 = (
  reportPayload: unknown,
): ReportPayloadV2 => {
  const payload = toRecord(reportPayload);
  const generatedReportV2 =
    payload?.generatedReportV2 ?? payload?.generated_report_v2 ?? payload;

  if (isReportPayloadV2(generatedReportV2)) {
    return normalizeReportPayloadV2(generatedReportV2);
  }

  return mapLegacyResultToReportPayloadV2(payload);
};

const isReportPayloadV2 = (payload: unknown): payload is ReportPayloadV2 =>
  Array.isArray(toRecord(payload)?.recommendedPrograms) &&
  !!toRecord(payload)?.portfolioStrategy;

const normalizeReportPayloadV2 = (payload: ReportPayloadV2): ReportPayloadV2 => ({
  ...payload,
  recommendedPrograms: payload.recommendedPrograms ?? [],
  portfolioStrategy: {
    safety: normalizeBucketStrategy(payload.portfolioStrategy?.safety),
    match: normalizeBucketStrategy(payload.portfolioStrategy?.match),
    reach: normalizeBucketStrategy(payload.portfolioStrategy?.reach),
  },
});

const normalizeBucketStrategy = (
  bucket?: Partial<PortfolioBucketStrategy>,
): PortfolioBucketStrategy => ({
  ...bucket,
  programIds: bucket?.programIds ?? [],
});

const bucketLabel: Record<DisplayBucket, string> = {
  stable: "하향",
  target: "적정",
  reach: "상향",
};

const mapLegacyResultToReportPayloadV2 = (response: unknown): ReportPayloadV2 => {
  const responseRecord = toRecord(response);
  const backendList = Array.isArray(responseRecord?.result)
    ? (responseRecord.result as LegacyResultItem[])
    : [];
  const bucketCounts: Record<DisplayBucket, number> = {
    stable: 0,
    target: 0,
    reach: 0,
  };

  const recommendedPrograms = backendList.map(
    (item: LegacyResultItem, idx: number): RecommendedProgramItem => {
      const program = item.program ?? {};
      const displayBucket = toDisplayBucket(item.displayBucket);
      bucketCounts[displayBucket] += 1;

      const programId = String(
        program.id ?? program.program_id ?? item.id ?? idx,
      );
      const universityName = program.university ?? "미정 대학";
      const departmentName = item.recommendDepartment ?? "추천 학과";

      return {
        programId,
        universityName,
        departmentName,
        displayBucket,
        category: (item.category ?? "MODERATE") as ProgramCategory,
        finalScore: item.totalScore,
        rationale:
          item.overallEvaluationText ??
          "학생의 학업 지표를 기반으로 선정된 추천입니다.",
        highlights: item.portfolioReason ? [item.portfolioReason] : [],
        metadata: {
          tag: `${bucketLabel[displayBucket]} ${bucketCounts[displayBucket]}`,
          campus: program.campus ?? "본교",
          comment:
            program.comment ?? "AI 분석 리포트 생성이 완료되었습니다.",
          examDateText: program.examDate ?? "대학 홈페이지 참조",
          csatRequirement:
            program.csatRequirement?.requirementText ?? "수능최저 없음",
          essayRatio: program.evaluationWeight?.essayWeight ?? 100,
          schoolRecordRatio:
            program.evaluationWeight?.schoolRecordWeight ?? 0,
          competitionRateLatest: program.competitionRateLatest ?? 0,
          competencyScores: {
            reading: toRadarScore(item.reading),
            contentComprehension: toRadarScore(item.contentComprehension),
            understanding: toRadarScore(item.understanding),
            structure: toRadarScore(item.structure),
            express: toRadarScore(item.express),
          },
          strategy:
            item.strategy ??
            "제한 시간 내에 정형화된 답안 구조를 빠르게 도출하는 훈련이 필요합니다.",
        },
      };
    },
  );

  return {
    reportVersion: "2.0-legacy-compat",
    studentSummary: {},
    recommendationSummary: {
      totalRecommendedCount: recommendedPrograms.length,
      bucketCounts: {
        stable: bucketCounts.stable,
        target: bucketCounts.target,
        reach: bucketCounts.reach,
      },
    },
    recommendedPrograms,
    portfolioStrategy: {
      safety: makeBucketStrategy("하향 지원권", "stable", recommendedPrograms),
      match: makeBucketStrategy("적정 지원권", "target", recommendedPrograms),
      reach: makeBucketStrategy("상향 지원권", "reach", recommendedPrograms),
    },
    tierSummary: { tiers: [] },
    consultantSummary: { keyInsights: [], strategyNotes: [] },
    patternSummary: { matchedPatterns: [] },
    caseStatisticsSummary: { statistics: [] },
    riskSummary: { flaggedProgramIds: [], reasons: [] },
    nextActions: [],
    warnings: [],
    metadata: { source: "legacy-compat" },
  };
};

const toDisplayBucket = (value: unknown): DisplayBucket => {
  if (value === "stable" || value === "target" || value === "reach") {
    return value;
  }

  return "target";
};

const toRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

const makeBucketStrategy = (
  title: string,
  displayBucket: DisplayBucket,
  programs: RecommendedProgramItem[],
): PortfolioBucketStrategy => {
  const programIds = programs
    .filter((program) => program.displayBucket === displayBucket)
    .map((program) => program.programId);

  return {
    title,
    programIds,
    recommendedCount: programIds.length,
  };
};

const toRadarScore = (score: unknown): number => (Number(score) || 0) / 20;
