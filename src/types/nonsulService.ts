import api from "../api/axios";
import { submitAnalysisInput } from "../api/analysis";
import type { AnalysisInputPayload } from "../contracts/analysisInput";

export interface UniversityReport {
  id: number;
  category: string;
  totalScore: number;
  estimatedChance: number;
  reading: number | null;
  contentComprehension: number | null;
  structure: number | null;
  express: number | null;
  understanding: number | null;
  maxReading: number | null;
  maxContentComprehension: number | null;
  maxStructure: number | null;
  maxExpress: number | null;
  maxUnderstanding: number | null;
  program: {
    id: string;
    university: string;
    campus: string;
    comment: string | null;
    examDate: string;
  } | null;
}

export interface ResultResponse {
  result: UniversityReport[];
}

export interface SaveInputDataResponse {
  analysisRunId: string;
}

export type AnalysisStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export interface AnalysisStatusResponse {
  status: AnalysisStatus;
  errorMessage?: string;
  reportId?: string | number;
}

export interface ReportListItem {
  reportId: string | number;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const getInputData = async () => {
  const response = await api.get("/nonsulfit/input");
  return response.data;
};

export const saveInputData = async (
  inputData: AnalysisInputPayload,
): Promise<SaveInputDataResponse> => submitAnalysisInput(inputData);

export const checkAnalysisStatus = async (
  analysisRunId: string,
): Promise<AnalysisStatusResponse> => {
  const response = await api.get<AnalysisStatusResponse>(
    `/nonsulfit/analyses/${encodeURIComponent(analysisRunId)}/status`,
    {
      params: {
        _t: Date.now(),
      },
    },
  );
  return response.data;
};

export const getReports = async (): Promise<unknown> => {
  const response = await api.get<unknown>("/reports");
  return response.data;
};

export const getReportData = async (
  reportId: string | number,
): Promise<unknown> => {
  const response = await api.get<unknown>(
    `/reports/${encodeURIComponent(String(reportId))}`,
  );
  return response.data;
};
