import type { MockExamSlot } from "../types/admission";

export type GenderInput = "남자" | "여자" | "MALE" | "FEMALE" | "UNKNOWN" | "";

export type AnalysisGender = "MALE" | "FEMALE" | "UNKNOWN";

export type AnalysisAcademic = "인문사회 계열" | "자연 계열" | "통합";

export type AnalysisExamType = "MOCK" | "CSAT";

export interface AnalysisInputPayload {
  student: {
    grade: number;
    repeatYear: number;
    gender: AnalysisGender;
    academic: AnalysisAcademic;
    desiredDepartment: string;
    desiredArea: string;
    applicationCount: number;
  };
  schoolGrade: { majorGrade: number; allGrade: number };
  testGrades: TestGradeEntry[];
}

export interface TestGradeEntry {
  examType: AnalysisExamType;
  year: number;
  month: number;
  koreanGrade?: number;
  koreanPercentile?: number;
  koreanStandardScore?: number;
  mathGrade?: number;
  mathPercentile?: number;
  mathStandardScore?: number;
  englishGrade?: number;
  inquiry1Grade?: number;
  inquiry2Grade?: number;
  isRepresentative: boolean;
}

export interface NonsulFormState {
  studentInfo: {
    grade?: string | number;
    status?: string;
    repeatYear?: string | number;
    track?: string;
    academic?: string;
    major?: string;
    desiredDepartment?: string;
    targetRegion?: string;
    desiredArea?: string;
    applicationCount?: string | number;
    gender?: GenderInput;
  };
  academicInfo: {
    gpaCore?: string | number;
    gpaAll?: string | number;
    schoolGrade?: { majorGrade?: string | number; allGrade?: string | number };
    mockExams?: FormExamSlot[];
    testGrades?: FormExamSlot[];
  };
}

export type FormExamSlot = Partial<
  MockExamSlot & {
    month: string | number;
    isRepresentative: boolean;
  }
>;

export class AnalysisInputValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalysisInputValidationError";
  }
}
