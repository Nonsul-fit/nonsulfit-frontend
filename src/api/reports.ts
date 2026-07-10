import { reportListMapper } from "../adapters/reportListMapper";
import { reportV2Mapper } from "../adapters/reportV2Mapper";
import type { NormalizedReportList } from "../contracts/reportList";
import type { ReportMappingResult } from "../contracts/reportResponse";
import api from "./axios";

export async function fetchReportList(params?: {
  page?: number;
  pageSize?: number;
}): Promise<NormalizedReportList> {
  const response = await api.get<unknown>("/reports", { params });
  return reportListMapper(response.data);
}

export async function fetchReportDetail(
  reportId: string,
): Promise<ReportMappingResult> {
  const response = await api.get<unknown>(
    `/reports/${encodeURIComponent(reportId)}`,
  );

  return reportV2Mapper(response.data);
}
