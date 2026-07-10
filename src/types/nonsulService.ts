import api from "../api/axios";
import { submitAnalysisInput } from "../api/analysis";
import {
  fetchChatHistory as fetchReportChatHistory,
  sendChatMessage as sendReportChatMessage,
} from "../api/chat";
import { fetchReportDetail, fetchReportList } from "../api/reports";
import type { AnalysisInputPayload } from "../contracts/analysisInput";
import type { ChatMessageViewModel } from "../contracts/chat";
import type { NormalizedReportList } from "../contracts/reportList";
import type { ReportMappingResult } from "../contracts/reportResponse";

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

export const getReports = async (): Promise<NormalizedReportList> =>
  fetchReportList();

export const getReportData = async (
  reportId: string,
): Promise<ReportMappingResult> => fetchReportDetail(reportId);

export const getChatHistory = async (
  reportId: string,
): Promise<ChatMessageViewModel[]> => fetchReportChatHistory(reportId);

export const postChatMessage = async (
  reportId: string,
  content: string,
): Promise<ChatMessageViewModel> => sendReportChatMessage(reportId, content);
