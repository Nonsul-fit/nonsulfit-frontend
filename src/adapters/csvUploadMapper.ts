import type {
  CsvCompetencyValues,
  CsvUploadError,
  CsvUploadResponse,
} from "../contracts/csvUpload";

const REQUIRED_FIELDS = [
  "reading",
  "contentUnderstanding",
  "promptUnderstanding",
  "structure",
  "expression",
] as const;

export class CsvUploadContractError extends Error {}

export function csvUploadMapper(raw: unknown): CsvUploadResponse {
  const root = toRecord(raw);
  const input = toRecord(root?.input);
  const competency =
    toRecord(input?.essayCompetency) ?? toRecord(input?.essay_competency);
  const csvImport = toRecord(root?.csvImport) ?? toRecord(root?.csv_import);

  if (!root || !input || !competency || !csvImport) {
    throw new CsvUploadContractError("CSV upload response is invalid");
  }

  const mappedCompetency = Object.fromEntries(
    REQUIRED_FIELDS.map((field) => [
      field,
      toNullableNumber(read(competency, field)),
    ]),
  ) as CsvUploadResponse["input"]["essayCompetency"];

  return {
    input: { essayCompetency: mappedCompetency },
    csvImport: {
      fileName: toString(read(csvImport, "fileName")),
      encoding: toString(csvImport.encoding),
      importedRowCount: toNumber(read(csvImport, "importedRowCount")),
      updatedFields: Array.isArray(read(csvImport, "updatedFields"))
        ? (read(csvImport, "updatedFields") as unknown[]).filter(
            (value): value is string => typeof value === "string",
          )
        : [],
    },
    analysis: null,
    analysisRunId: null,
    status: null,
  };
}

export function selectCsvCompetency(
  response: CsvUploadResponse,
): CsvCompetencyValues {
  const competency = response.input.essayCompetency;
  if (
    !competency ||
    REQUIRED_FIELDS.some((field) => competency[field] === null)
  ) {
    throw new CsvUploadContractError("CSV competency scores are incomplete");
  }
  return competency as CsvCompetencyValues;
}

export function parseCsvUploadError(raw: unknown): CsvUploadError | null {
  const root = toRecord(raw);
  const error = toRecord(root?.error);
  if (!error || typeof error.code !== "string") return null;
  return {
    code: error.code,
    message: typeof error.message === "string" ? error.message : "",
    details: toRecord(error.details) ?? {},
  };
}

const read = (record: Record<string, unknown>, camelKey: string): unknown =>
  record[camelKey] ??
  record[camelKey.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)];
const toRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
const toNullableNumber = (value: unknown): number | null => {
  const number = typeof value === "string" ? Number(value) : value;
  return typeof number === "number" && Number.isFinite(number) ? number : null;
};
const toNumber = (value: unknown): number => toNullableNumber(value) ?? 0;
const toString = (value: unknown): string =>
  typeof value === "string" ? value : "";
