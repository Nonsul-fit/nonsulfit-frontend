import { reportListMapper } from "../adapters/reportListMapper";
import { reportV2Mapper } from "../adapters/reportV2Mapper";
import type { NormalizedReportList } from "../contracts/reportList";
import type { ReportMappingResult } from "../contracts/reportResponse";
import type { DeleteReportIdentifier, ReportId } from "../types/identifiers";
import api from "./axios";
import axios from "axios";

export async function fetchReportList(params?: {
  page?: number;
  pageSize?: number;
}): Promise<NormalizedReportList> {
  const response = await api.get<unknown>("/reports", { params });
  return reportListMapper(response.data);
}

export async function fetchReportDetail(
  reportId: ReportId,
): Promise<ReportMappingResult> {
  const response = await api.get<unknown>(
    `/reports/${encodeURIComponent(reportId)}`,
  );

  return reportV2Mapper(response.data);
}

export async function deleteReport(
  identifier: DeleteReportIdentifier,
): Promise<void> {
  await api.delete(`/reports/${encodeURIComponent(String(identifier))}`, {
    transformResponse: [],
  });
}

export function getDeleteReportErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data =
      error.response?.data &&
      typeof error.response.data === "object" &&
      !Array.isArray(error.response.data)
        ? (error.response.data as Record<string, unknown>)
        : null;
    const apiError =
      data?.error && typeof data.error === "object"
        ? (data.error as Record<string, unknown>)
        : null;
    if (error.response?.status === 404 || apiError?.code === "REPORT_NOT_FOUND") {
      return "이미 삭제되었거나 확인할 수 없는 리포트입니다.";
    }
    if (error.response?.status === 401) return "로그인이 필요합니다.";
  }
  return "리포트를 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}
