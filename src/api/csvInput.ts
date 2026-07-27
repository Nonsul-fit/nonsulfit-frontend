import axios from "axios";
import {
  csvUploadMapper,
  parseCsvUploadError,
} from "../adapters/csvUploadMapper";
import type { CsvUploadResponse } from "../contracts/csvUpload";
import api from "./axios";

export async function uploadCsvInput(file: File): Promise<CsvUploadResponse> {
  const body = new FormData();
  body.append("file", file);
  const response = await api.post<unknown>("/api/v1/nonsulfit/input/csv", body, {
    headers: { "Content-Type": undefined },
    params: { triggerAnalysis: false },
  });
  return csvUploadMapper(response.data);
}

const CSV_ERROR_MESSAGES: Record<string, string> = {
  CSV_ENCODING_UNSUPPORTED:
    "파일 인코딩을 확인해 주세요. UTF-8 또는 CP949 CSV를 사용해 주세요.",
  CSV_FILE_REQUIRED: "CSV 파일만 업로드할 수 있습니다.",
  CSV_FILE_EMPTY: "CSV 파일에 입력 데이터가 없습니다.",
  CSV_DATA_MISSING: "CSV 파일에 입력 데이터가 없습니다.",
  CSV_FILE_TOO_LARGE: "1MB 이하의 CSV 파일을 업로드해 주세요.",
  CSV_HEADER_DUPLICATED: "CSV 헤더가 중복되어 있습니다.",
  CSV_SCORE_COLUMNS_MISSING: "지원하지 않는 점수 항목이 포함되어 있습니다.",
  CSV_COLUMN_COUNT_MISMATCH:
    "CSV 헤더 수와 데이터 컬럼 수가 일치하지 않습니다.",
  CSV_MULTIPLE_ROWS_NOT_ALLOWED:
    "학생 한 명의 데이터만 포함된 CSV를 업로드해 주세요.",
};

export function getCsvUploadErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const parsed = parseCsvUploadError(error.response?.data);
    if (parsed) return CSV_ERROR_MESSAGES[parsed.code] ?? parsed.message;
  }
  return "CSV 파일을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
}
