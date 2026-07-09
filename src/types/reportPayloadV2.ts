// SOURCE: task prompt summary, pending REPORT_PAYLOAD_V2_CONTRACT.md verification

export type DisplayBucket = "stable" | "target" | "reach";

export type ProgramCategory = "SAFE" | "MODERATE" | "RISKY" | (string & {});

export type WarningCode =
  | "SECTION_FALLBACK_USED"
  | "INSUFFICIENT_TOTAL_CANDIDATES"
  | "INSUFFICIENT_ORIGINAL_BUCKET"
  | "INSUFFICIENT_STABLE"
  | "INSUFFICIENT_TARGET"
  | "INSUFFICIENT_REACH";

export interface SectionFallbackFields {
  sectionFallback?: boolean;
  fallbackReason?: string;
}

export interface ReportPayloadV2 {
  reportVersion: string;
  studentSummary: StudentSummarySection;
  recommendationSummary: RecommendationSummarySection;
  recommendedPrograms: RecommendedProgramItem[];
  portfolioStrategy: PortfolioStrategySection;
  tierSummary: TierSummarySection;
  consultantSummary: ConsultantSummarySection;
  patternSummary: PatternSummarySection;
  caseStatisticsSummary: CaseStatisticsSummarySection;
  riskSummary: RiskSummarySection;
  nextActions: NextActionItem[];
  warnings: ReportWarning[];
  metadata: ReportMetadataSection;
}

export interface StudentSummarySection extends SectionFallbackFields {
  studentName?: string;
  academicTrack?: string;
  grade?: string;
  region?: string;
  applicationCount?: number;
  interests?: string[];
  strengths?: string[];
  constraints?: string[];
}

export interface RecommendationSummarySection extends SectionFallbackFields {
  headline?: string;
  description?: string;
  totalRecommendedCount?: number;
  bucketCounts?: Partial<Record<DisplayBucket, number>>;
  categoryCounts?: Partial<Record<ProgramCategory, number>>;
}

export interface RecommendedProgramItem extends SectionFallbackFields {
  programId: string;
  universityName: string;
  departmentName: string;
  displayBucket: DisplayBucket;
  category: ProgramCategory;
  finalScore?: number;
  successRateEstimate?: number | null;
  rationale?: string;
  highlights?: string[];
  cautions?: string[];
  metadata?: Record<string, unknown>;
}

export interface PortfolioStrategySection extends SectionFallbackFields {
  safety: PortfolioBucketStrategy;
  match: PortfolioBucketStrategy;
  reach: PortfolioBucketStrategy;
}

export interface PortfolioBucketStrategy extends SectionFallbackFields {
  title?: string;
  summary?: string;
  programIds: string[];
  recommendedCount?: number;
}

export interface TierSummarySection extends SectionFallbackFields {
  summary?: string;
  tiers: TierSummaryItem[];
}

export interface TierSummaryItem {
  tierName: string;
  programIds: string[];
  count?: number;
  note?: string;
}

export interface ConsultantSummarySection extends SectionFallbackFields {
  overallComment?: string;
  keyInsights: string[];
  strategyNotes: string[];
}

export interface PatternSummarySection extends SectionFallbackFields {
  summary?: string;
  matchedPatterns: MatchedPatternItem[];
}

export interface MatchedPatternItem {
  patternId?: string;
  patternName: string;
  description?: string;
  relatedProgramIds?: string[];
}

export interface CaseStatisticsSummarySection extends SectionFallbackFields {
  summary?: string;
  sampleSize?: number;
  statistics: CaseStatisticItem[];
}

export interface CaseStatisticItem {
  label: string;
  value: number | string;
  unit?: string;
  note?: string;
}

export interface RiskSummarySection extends SectionFallbackFields {
  overview?: string;
  flaggedProgramIds: string[];
  reasons: RiskReasonItem[];
}

export interface RiskReasonItem {
  riskProgramId?: string;
  riskFactor: string;
  riskDetail?: string;
  riskSeverity?: "low" | "medium" | "high" | (string & {});
}

export interface NextActionItem {
  actionId?: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | (string & {});
  dueDate?: string;
}

export interface ReportWarning {
  code: WarningCode;
  warningTitle?: string;
  warningDetail?: string;
  affectedSection?: keyof Omit<ReportPayloadV2, "warnings">;
}

export interface ReportMetadataSection extends SectionFallbackFields {
  reportId?: string;
  analysisRunId?: string;
  generatedAt?: string;
  algorithmVersion?: string;
  source?: string;
  dataVersion?: string;
}
