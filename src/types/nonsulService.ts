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

export const getInputData = async () => {
  const response = await api.get("/nonsulfit/input");
  return response.data;
};

export const saveInputData = async (inputData: any) => {
  const response = await api.put("/nonsulfit/input", inputData);
  return response.data;
};

export const checkAnalysisStatus = async () => {
  const response = await api.get(`/nonsulfit/status?_t=${Date.now()}`);
  return response.data;
};

/**

 * @param category
 * @param count 
 */
export const getResultData = async (
  category: string,
  count: string = "6",
): Promise<any> => {
  const response = await api.get<any>("/nonsulfit/result", {
    params: {
      category,
      count,
    },
  });
  return response.data;
};
