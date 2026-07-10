import type { ReportPayloadV2 } from "../types/reportPayloadV2";

export interface ReportDetailResponseDto {
  generatedReportV2?: unknown;
  generated_report_v2?: unknown;
}

export interface ReportMappingError {
  path: string;
  message: string;
}

export type ReportMappingResult =
  | { status: "success"; data: ReportPayloadV2; errors: [] }
  | { status: "partial"; data: ReportPayloadV2; errors: ReportMappingError[] }
  | { status: "failure"; data: null; errors: ReportMappingError[] };
