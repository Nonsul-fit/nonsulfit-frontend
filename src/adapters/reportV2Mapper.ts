import type {
  DisplayBucket,
  PortfolioBucketName,
  PortfolioBucketStrategy,
  ProgramCategory,
  RecommendedProgramItem,
  ReportPayloadV2,
} from "../types/reportPayloadV2";
import type {
  ReportMappingError,
  ReportMappingResult,
} from "../contracts/reportResponse";

type MutableReportMappingError = ReportMappingError;

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

const portfolioDisplayBucket: Record<PortfolioBucketName, DisplayBucket> = {
  safety: "stable",
  match: "target",
  reach: "reach",
};

const portfolioNames: PortfolioBucketName[] = ["safety", "match", "reach"];

export function extractReportV2Body(rawResponse: unknown): unknown {
  const response = toRecord(rawResponse);
  return (
    response?.generatedReportV2 ??
    response?.generated_report_v2 ??
    rawResponse
  );
}

export function reportV2Mapper(rawBody: unknown): ReportMappingResult {
  const body = extractReportV2Body(rawBody);

  if (isLegacyResult(body)) {
    return { status: "success", data: mapLegacyResultToReportPayloadV2(body), errors: [] };
  }

  const source = toRecord(body);
  if (!source) {
    return {
      status: "failure",
      data: null,
      errors: [{ path: "$", message: "report body must be an object" }],
    };
  }

  const errors: MutableReportMappingError[] = [];
  const portfolioStrategy = normalizePortfolioStrategy(
    read(source, "portfolioStrategy"),
    errors,
  );
  const portfolioDisplayByProgramId =
    createPortfolioDisplayLookup(portfolioStrategy);
  const recommendedPrograms = normalizeRecommendedPrograms(
    read(source, "recommendedPrograms"),
    portfolioDisplayByProgramId,
    errors,
  );

  if (!Array.isArray(read(source, "recommendedPrograms"))) {
    errors.push({
      path: "recommendedPrograms",
      message: "recommendedPrograms must be an array",
    });
  }

  if (recommendedPrograms.length === 0 && errors.length > 0) {
    return { status: "failure", data: null, errors };
  }

  const data = normalizeReportPayloadV2(({
    reportVersion: String(read(source, "reportVersion") ?? "v2"),
    studentSummary: objectOrEmpty(read(source, "studentSummary")),
    recommendationSummary: objectOrEmpty(read(source, "recommendationSummary")),
    recommendedPrograms,
    portfolioStrategy,
    tierSummary: objectOrEmpty(read(source, "tierSummary")),
    consultantSummary: objectOrEmpty(read(source, "consultantSummary")),
    patternSummary: objectOrEmpty(read(source, "patternSummary")),
    caseStatisticsSummary: objectOrEmpty(read(source, "caseStatisticsSummary")),
    riskSummary: objectOrEmpty(read(source, "riskSummary")),
    nextActions: arrayOrEmpty(read(source, "nextActions")),
    warnings: arrayOrEmpty(read(source, "warnings")),
    metadata: objectOrEmpty(read(source, "metadata")),
  } as unknown) as ReportPayloadV2);

  return errors.length > 0
    ? { status: "partial", data, errors }
    : { status: "success", data, errors: [] };
}

export const mapReportPayloadV2 = (reportPayload: unknown): ReportPayloadV2 => {
  const result = reportV2Mapper(reportPayload);
  if (result.status === "failure") {
    return mapLegacyResultToReportPayloadV2(reportPayload);
  }

  return result.data;
};

const normalizeReportPayloadV2 = (payload: ReportPayloadV2): ReportPayloadV2 => ({
  ...payload,
  studentSummary: payload.studentSummary ?? {},
  recommendationSummary: payload.recommendationSummary ?? {},
  recommendedPrograms: payload.recommendedPrograms ?? [],
  tierSummary: {
    ...payload.tierSummary,
    tiers: payload.tierSummary?.tiers ?? [],
  },
  consultantSummary: {
    ...payload.consultantSummary,
    keyInsights: payload.consultantSummary?.keyInsights ?? [],
    strategyNotes: payload.consultantSummary?.strategyNotes ?? [],
  },
  patternSummary: {
    ...payload.patternSummary,
    matchedPatterns: payload.patternSummary?.matchedPatterns ?? [],
  },
  caseStatisticsSummary: {
    ...payload.caseStatisticsSummary,
    statistics: payload.caseStatisticsSummary?.statistics ?? [],
  },
  warnings: payload.warnings ?? [],
  nextActions: payload.nextActions ?? [],
  riskSummary: {
    ...payload.riskSummary,
    flaggedProgramIds: payload.riskSummary?.flaggedProgramIds ?? [],
    reasons: payload.riskSummary?.reasons ?? [],
  },
  portfolioStrategy: {
    safety: normalizeBucketStrategy(payload.portfolioStrategy?.safety),
    match: normalizeBucketStrategy(payload.portfolioStrategy?.match),
    reach: normalizeBucketStrategy(payload.portfolioStrategy?.reach),
  },
  metadata: payload.metadata ?? {},
});

const normalizeRecommendedPrograms = (
  value: unknown,
  portfolioDisplayByProgramId: Map<string, DisplayBucket>,
  errors: MutableReportMappingError[],
): RecommendedProgramItem[] => {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item, index) => {
    const program = toRecord(item);
    if (!program) {
      errors.push({
        path: `recommendedPrograms.${index}`,
        message: "program must be an object",
      });
      return [];
    }

    const programId = toRequiredString(read(program, "programId"));
    const universityName = toRequiredString(read(program, "universityName"));
    const departmentName = toRequiredString(read(program, "departmentName"));

    if (!programId || !universityName || !departmentName) {
      errors.push({
        path: `recommendedPrograms.${index}`,
        message: "programId, universityName, and departmentName are required",
      });
      return [];
    }

    return [
      {
        ...objectOrEmpty(program),
        programId,
        universityName,
        departmentName,
        displayBucket:
          toDisplayBucket(read(program, "displayBucket")) ??
          portfolioDisplayByProgramId.get(programId) ??
          toDisplayBucket(read(objectOrEmpty(program.metadata), "displayBucket")) ??
          "target",
        category: toCategory(program.category),
        finalScore: toNumber(read(program, "finalScore")) ?? 0,
        successRateEstimate:
          toNumber(read(program, "successRateEstimate")) ?? null,
      } as RecommendedProgramItem,
    ];
  });
};

const normalizePortfolioStrategy = (
  value: unknown,
  errors: MutableReportMappingError[],
): ReportPayloadV2["portfolioStrategy"] => {
  if (Array.isArray(value)) {
    return normalizePortfolioArray(value, errors);
  }

  const strategy = toRecord(value);
  if (!strategy) {
    errors.push({
      path: "portfolioStrategy",
      message: "portfolioStrategy must be an object or array",
    });
    return emptyPortfolioStrategy();
  }

  return {
    safety: normalizeBucketStrategy(toRecord(read(strategy, "safety")) ?? {}),
    match: normalizeBucketStrategy(toRecord(read(strategy, "match")) ?? {}),
    reach: normalizeBucketStrategy(toRecord(read(strategy, "reach")) ?? {}),
  };
};

const normalizePortfolioArray = (
  value: unknown[],
  errors: MutableReportMappingError[],
): ReportPayloadV2["portfolioStrategy"] => {
  const strategy = emptyPortfolioStrategy();

  value.forEach((item, index) => {
    const bucket = toRecord(item);
    const name = toPortfolioName(
      bucket?.name ?? bucket?.bucket ?? bucket?.bucketName,
    );

    if (!bucket || !name) {
      errors.push({
        path: `portfolioStrategy.${index}`,
        message: "portfolio bucket name is invalid",
      });
      return;
    }

    strategy[name] = normalizeBucketStrategy(bucket);
  });

  return strategy;
};

const normalizeBucketStrategy = (
  bucket?: Partial<PortfolioBucketStrategy>,
): PortfolioBucketStrategy => ({
  ...objectOrEmpty(bucket),
  programIds: arrayOrEmpty(read(objectOrEmpty(bucket), "programIds")).map(String),
});

const createPortfolioDisplayLookup = (
  portfolioStrategy: ReportPayloadV2["portfolioStrategy"],
): Map<string, DisplayBucket> => {
  const lookup = new Map<string, DisplayBucket>();

  for (const name of portfolioNames) {
    for (const programId of portfolioStrategy[name].programIds) {
      if (!lookup.has(programId)) {
        lookup.set(programId, portfolioDisplayBucket[name]);
      }
    }
  }

  return lookup;
};

const emptyPortfolioStrategy = (): ReportPayloadV2["portfolioStrategy"] => ({
  safety: { programIds: [] },
  match: { programIds: [] },
  reach: { programIds: [] },
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
      const displayBucket = toDisplayBucket(item.displayBucket) ?? "target";
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
        successRateEstimate: null,
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

const isLegacyResult = (body: unknown): boolean =>
  Array.isArray(toRecord(body)?.result);

const read = (
  record: Record<string, unknown> | null | undefined,
  camelKey: string,
): unknown => record?.[camelKey] ?? record?.[toSnakeCase(camelKey)];

const toSnakeCase = (value: string): string =>
  value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const toDisplayBucket = (value: unknown): DisplayBucket | undefined => {
  if (value === "stable" || value === "target" || value === "reach") {
    return value;
  }

  return undefined;
};

const toPortfolioName = (value: unknown): PortfolioBucketName | undefined => {
  if (value === "safety" || value === "match" || value === "reach") {
    return value;
  }

  return undefined;
};

const toCategory = (value: unknown): ProgramCategory => {
  if (typeof value === "string") return value as ProgramCategory;
  return "MODERATE";
};

const toRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const objectOrEmpty = (value: unknown): Record<string, unknown> => {
  const record = toRecord(value);
  return record ? (normalizeKeys(record) as Record<string, unknown>) : {};
};

const arrayOrEmpty = (value: unknown): unknown[] =>
  Array.isArray(value) ? value.map(normalizeKeys) : [];

const normalizeKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(normalizeKeys);

  const record = toRecord(value);
  if (!record) return value;

  return Object.fromEntries(
    Object.entries(record).map(([key, item]) => [
      toCamelCase(key),
      normalizeKeys(item),
    ]),
  );
};

const toCamelCase = (value: string): string =>
  value.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());

const toRequiredString = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.length > 0) return value;
  if (typeof value === "number") return String(value);
  return undefined;
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || value.trim() === "") return undefined;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

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
