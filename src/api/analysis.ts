import api from "./axios";
import type { AnalysisInputPayload } from "../contracts/analysisInput";
import type { AnalysisStatus } from "../contracts/analysisStatus";
import { analysisStatusMapper } from "../adapters/analysisStatusMapper";
import type {
  AnalysisRunId,
  PublicReportId,
  ReportId,
} from "../types/identifiers";

export interface AnalysisSubmissionResult {
  analysisRunId: AnalysisRunId;
}

export interface AnalysisSession {
  analysisRunId: AnalysisRunId;
  status: AnalysisStatus;
  reportId: ReportId | null;
  publicId: PublicReportId | null;
}

export class AnalysisRunIdMissingError extends Error {
  constructor() {
    super("analysisRunId is missing from analysis submission response");
    this.name = "AnalysisRunIdMissingError";
  }
}

export const ANALYSIS_RUN_ID_STORAGE_KEY = "nonsulfit.analysisRunId";

export async function submitAnalysisInput(
  payload: AnalysisInputPayload,
): Promise<AnalysisSubmissionResult> {
  const response = await api.put<unknown>("/nonsulfit/input", payload);
  const result = parseAnalysisSubmissionResult(response.data);

  sessionStorage.setItem(ANALYSIS_RUN_ID_STORAGE_KEY, result.analysisRunId);

  return result;
}

export async function fetchAnalysisStatus(
  analysisRunId: AnalysisRunId,
): Promise<AnalysisSession> {
  const response = await api.get<unknown>(
    `/nonsulfit/analyses/${encodeURIComponent(analysisRunId)}/status`,
  );
  const status = analysisStatusMapper(response.data);

  return {
    analysisRunId: status.analysisRunId,
    status: status.status,
    reportId: status.reportId,
    publicId: status.publicId,
  };
}

const parseAnalysisSubmissionResult = (
  response: unknown,
): AnalysisSubmissionResult => {
  const record = toRecord(response);
  const analysisRunId = record?.analysisRunId;

  if (typeof analysisRunId !== "string" || analysisRunId.length === 0) {
    throw new AnalysisRunIdMissingError();
  }

  return { analysisRunId };
};

const toRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
