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

* 논술핏 결과 상세 데이터를 불러옵니다.
 * @param savedAnalysisReportId 🚨 리포트 고유 ID 추가!
 * @param category 상향(RISKY), 적정(MODERATE), 안정(SAFE)
 * @param count 
 */
export const getResultData = async (
  savedAnalysisReportId: string | number, // 💡 1. 주소창에 넣을 ID를 매개변수로 받습니다.
  category: string,
  count: string = "6",
): Promise<any> => {
  // 💡 2. 한국어 필터값을 승효님 백엔드가 원하는 영어 대문자로 매핑해주는 안전장치
  let mappedCategory = category;
  if (category === "상향") mappedCategory = "RISKY";
  if (category === "적정") mappedCategory = "MODERATE";
  if (category === "하향" || category === "안정") mappedCategory = "SAFE";

  // 💡 3. 주소 뒤에 고유 ID를 꽂아서 진짜 알짜배기 상세 데이터를 받아옵니다!
  const response = await api.get<any>(
    `/nonsulfit/result/${savedAnalysisReportId}`,
    {
      params: {
        category: mappedCategory, // 영문으로 가공된 카테고리 전송
        count,
      },
    },
  );
  return response.data;
};
