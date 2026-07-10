import type {
  AnalysisSessionStatus,
  AnalysisStatus,
} from "../contracts/analysisStatus";
import { AnalysisStatusContractError } from "../contracts/analysisStatus.ts";

const statusValues: AnalysisStatus[] = [
  "PENDING",
  "PROCESSING",
  "RUNNING",
  "COMPLETED",
  "FAILED",
];

const incompleteStatuses: AnalysisStatus[] = [
  "PENDING",
  "PROCESSING",
  "RUNNING",
  "FAILED",
];

export function analysisStatusMapper(raw: unknown): AnalysisSessionStatus {
  const record = toRecord(raw);
  if (!record) {
    throw new AnalysisStatusContractError("analysis status must be an object");
  }

  const status = toStatus(read(record, "status"));
  const analysisRunId = toRequiredString(read(record, "analysisRunId"));
  const rawReportId = read(record, "reportId");
  const reportId = toNullableString(rawReportId);
  const contractWarnings: string[] = [];

  if (!analysisRunId) {
    throw new AnalysisStatusContractError("analysisRunId is required");
  }

  if (status === "COMPLETED" && !reportId) {
    throw new AnalysisStatusContractError("reportId is required when completed");
  }

  if (incompleteStatuses.includes(status) && reportId) {
    contractWarnings.push("unexpected_reportId_before_completion");
  }

  return {
    analysisRunId,
    status,
    reportId: status === "COMPLETED" ? reportId : null,
    publicId: toNullableNumber(read(record, "publicId")),
    contractWarnings,
  };
}

const toStatus = (value: unknown): AnalysisStatus => {
  if (statusValues.includes(value as AnalysisStatus)) {
    return value as AnalysisStatus;
  }

  throw new AnalysisStatusContractError("status is invalid");
};

const read = (
  record: Record<string, unknown> | null | undefined,
  camelKey: string,
): unknown => record?.[camelKey] ?? record?.[toSnakeCase(camelKey)];

const toSnakeCase = (value: string): string =>
  value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const toRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const toRequiredString = (value: unknown): string | null => {
  if (typeof value === "string" && value.length > 0) return value;
  if (typeof value === "number") return String(value);
  return null;
};

const toNullableString = (value: unknown): string | null => {
  if (value === null || value === undefined || value === "") return null;
  return toRequiredString(value);
};

const toNullableNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || value.trim() === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};
