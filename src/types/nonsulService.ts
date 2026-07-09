import api from "../api/axios";

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

export const getInputData = async () => {
  const response = await api.get("/nonsulfit/input");
  return response.data;
};

export const saveInputData = async (
  inputData: any,
): Promise<SaveInputDataResponse> => {
  const response = await api.put<SaveInputDataResponse>(
    "/nonsulfit/input",
    inputData,
  );
  return response.data;
};

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

/**


 * @param savedAnalysisReportId 
 * @param category 
 * @param count 
 */
export const getResultData = async (
  savedAnalysisReportId: string | number,
  category: string,
  count: string = "6",
): Promise<any> => {
  let mappedCategory = category;
  if (category === "상향") mappedCategory = "RISKY";
  if (category === "적정") mappedCategory = "MODERATE";
  if (category === "하향" || category === "안정") mappedCategory = "SAFE";

  const response = await api.get<any>(
    `/nonsulfit/result/${savedAnalysisReportId}`,
    {
      params: {
        category: mappedCategory,
        count,
      },
    },
  );
  return response.data;
};
