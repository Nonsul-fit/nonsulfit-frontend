import type {
  NormalizedReportList,
  ReportListItem,
} from "../contracts/reportList";

export function reportListMapper(raw: unknown): NormalizedReportList {
  const rawItems = selectRawItems(raw);
  const payload = toRecord(raw);

  return {
    items: rawItems.flatMap((item) => normalizeItem(item)),
    pagination: payload ? normalizePagination(payload) : null,
  };
}

const selectRawItems = (raw: unknown): unknown[] => {
  if (Array.isArray(raw)) return raw;

  const record = toRecord(raw);
  if (!record) return [];

  if (Array.isArray(record.reports)) return record.reports;
  if (Array.isArray(record.result)) return record.result;
  if (Array.isArray(record.items)) return record.items;

  return [];
};

const normalizeItem = (item: unknown): ReportListItem[] => {
  const record = toRecord(item);
  if (!record) return [];

  const reportId = toRequiredString(read(record, "reportId") ?? record.id);
  if (!reportId) return [];

  return [
    {
      ...normalizeKeys(record),
      reportId,
      publicId: toNullableNumber(read(record, "publicId")),
      title: toNullableString(read(record, "title")) ?? `분석 리스트 ${reportId}번`,
      createdAt: toNullableDate(read(record, "createdAt")),
    },
  ];
};

const normalizePagination = (
  payload: Record<string, unknown>,
): NormalizedReportList["pagination"] => {
  const pagination = toRecord(read(payload, "pagination")) ?? payload;
  const page = toNullableNumber(read(pagination, "page"));
  const pageSize = toNullableNumber(read(pagination, "pageSize"));
  const totalCount = toNullableNumber(read(pagination, "totalCount"));

  if (page === null || pageSize === null || totalCount === null) {
    return null;
  }

  return {
    page,
    pageSize,
    totalCount,
    hasNext: toBoolean(read(pagination, "hasNext")) ?? page * pageSize < totalCount,
  };
};

const toNullableDate = (value: unknown): Date | null => {
  if (typeof value !== "string" || value.trim() === "") return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const read = (
  record: Record<string, unknown> | null | undefined,
  camelKey: string,
): unknown => record?.[camelKey] ?? record?.[toSnakeCase(camelKey)];

const toSnakeCase = (value: string): string =>
  value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const toCamelCase = (value: string): string =>
  value.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());

const normalizeKeys = (record: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(record).map(([key, value]) => [toCamelCase(key), value]),
  );

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
  if (typeof value === "string" && value.length > 0) return value;
  return null;
};

const toNullableNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || value.trim() === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toBoolean = (value: unknown): boolean | null => {
  if (typeof value === "boolean") return value;
  return null;
};
