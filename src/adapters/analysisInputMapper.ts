import type {
  AcademicTrack,
  AnalysisGender,
  AnalysisInputPayload,
  FormExamSlot,
  NonsulFormState,
  TestGradeEntry,
} from "../contracts/analysisInput";
import { AnalysisInputValidationError } from "../contracts/analysisInput.ts";

const academicTrackValues: AcademicTrack[] = [
  "HUMANITIES",
  "NATURAL_SCIENCE",
  "MEDICAL",
  "INTEGRATED",
];

const academicTrackAliases: Readonly<Record<string, AcademicTrack>> = {
  인문: "HUMANITIES",
  문과: "HUMANITIES",
  인문계열: "HUMANITIES",
  "인문 계열": "HUMANITIES",
  인문사회: "HUMANITIES",
  인문사회계열: "HUMANITIES",
  "인문사회 계열": "HUMANITIES",
  자연: "NATURAL_SCIENCE",
  이과: "NATURAL_SCIENCE",
  자연계열: "NATURAL_SCIENCE",
  "자연 계열": "NATURAL_SCIENCE",
  의약: "MEDICAL",
  의약계열: "MEDICAL",
  "의약 계열": "MEDICAL",
  통합: "INTEGRATED",
  통합계열: "INTEGRATED",
  "통합 계열": "INTEGRATED",
};

export function mapFormToAnalysisInput(
  form: NonsulFormState,
): AnalysisInputPayload {
  const studentInfo = form.studentInfo;
  const academicInfo = form.academicInfo;
  const essayInfo = form.essayInfo;
  const testGrades = (academicInfo.testGrades ?? academicInfo.mockExams ?? [])
    .filter(hasExamScore)
    .map(mapExamSlot);

  const payload: AnalysisInputPayload = {
    student: {
      grade: toNumber(studentInfo.grade) ?? 3,
      repeatYear: toRepeatYear(studentInfo.repeatYear, studentInfo.status),
      gender: normalizeGender(studentInfo.gender),
      academicTrack: normalizeAcademicTrack(
        studentInfo.academicTrack ?? studentInfo.academic,
      ),
      desiredDepartment:
        studentInfo.desiredDepartment ?? studentInfo.major ?? "",
      desiredArea: studentInfo.desiredArea ?? studentInfo.targetRegion ?? "",
      applicationCount: toNumber(studentInfo.applicationCount) ?? 0,
    },
    essayCompetency: {
      reading: requireNumber(
        toNumber(essayInfo.reading),
        "essayCompetency.reading",
      ),
      contentUnderstanding: requireNumber(
        toNumber(essayInfo.content_understanding),
        "essayCompetency.contentUnderstanding",
      ),
      promptUnderstanding: requireNumber(
        toNumber(essayInfo.prompt_understanding),
        "essayCompetency.promptUnderstanding",
      ),
      structure: requireNumber(
        toNumber(essayInfo.structure),
        "essayCompetency.structure",
      ),
      expression: requireNumber(
        toNumber(essayInfo.expression),
        "essayCompetency.expression",
      ),
      ...optionalNumberField(
        "chartPreference",
        toNumber(essayInfo.chart_score),
      ),
      ...optionalNumberField(
        "englishPreference",
        toNumber(essayInfo.english_passage_score),
      ),
      ...optionalNumberField(
        "mathPreference",
        toNumber(essayInfo.math_question_score),
      ),
      ...(essayInfo.feedback?.trim()
        ? { comment: essayInfo.feedback.trim() }
        : {}),
    },
    schoolGrade: {
      majorGrade: requireNumber(
        toNumber(academicInfo.schoolGrade?.majorGrade) ??
          toNumber(academicInfo.gpaCore),
        "schoolGrade.majorGrade",
      ),
      allGrade: requireNumber(
        toNumber(academicInfo.schoolGrade?.allGrade) ??
          toNumber(academicInfo.gpaAll),
        "schoolGrade.allGrade",
      ),
    },
    testGrades: markRepresentative(testGrades),
  };

  return validateAnalysisInput(payload);
}

export function validateAnalysisInput(
  payload: AnalysisInputPayload,
): AnalysisInputPayload {
  if (payload.student.grade <= 0) {
    throw new AnalysisInputValidationError("student.grade must be greater than 0");
  }

  if (!academicTrackValues.includes(payload.student.academicTrack)) {
    throw new AnalysisInputValidationError("student.academicTrack is invalid");
  }

  if (
    payload.schoolGrade.majorGrade <= 0 ||
    payload.schoolGrade.allGrade <= 0
  ) {
    throw new AnalysisInputValidationError(
      "schoolGrade values must be greater than 0",
    );
  }

  for (const exam of payload.testGrades) {
    assertPositiveGrade(exam.koreanGrade, "koreanGrade");
    assertPositiveGrade(exam.mathGrade, "mathGrade");
    assertPositiveGrade(exam.englishGrade, "englishGrade");
    assertPositiveGrade(exam.inquiry1Grade, "inquiry1Grade");
    assertPositiveGrade(exam.inquiry2Grade, "inquiry2Grade");
  }

  const representativeCount = payload.testGrades.filter(
    (exam) => exam.isRepresentative,
  ).length;

  if (payload.testGrades.length > 0 && representativeCount !== 1) {
    throw new AnalysisInputValidationError(
      "testGrades must have exactly one representative exam",
    );
  }

  return payload;
}

const normalizeGender = (gender?: string): AnalysisGender => {
  if (gender === "남자" || gender === "MALE") return "MALE";
  if (gender === "여자" || gender === "FEMALE") return "FEMALE";
  return "UNKNOWN";
};

export const normalizeAcademicTrack = (value: unknown): AcademicTrack => {
  const normalized = typeof value === "string" ? value.trim() : "";
  const upper = normalized.toUpperCase();
  const candidate =
    academicTrackAliases[normalized] ??
    (academicTrackValues.includes(upper as AcademicTrack)
      ? (upper as AcademicTrack)
      : undefined);

  if (!candidate) {
    throw new AnalysisInputValidationError("student.academicTrack is invalid");
  }

  return candidate;
};

export const restoreAnalysisInput = (value: unknown): unknown => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const response = value as Record<string, unknown>;
  const studentValue = response.student;
  if (!studentValue || typeof studentValue !== "object" || Array.isArray(studentValue)) {
    return value;
  }

  const student = studentValue as Record<string, unknown>;
  const academicTrack = normalizeAcademicTrack(
    student.academicTrack ?? student.academic ?? null,
  );
  const { academic: _legacyAcademic, ...canonicalStudent } = student;

  return { ...response, student: { ...canonicalStudent, academicTrack } };
};

const toRepeatYear = (
  repeatYear?: string | number,
  status?: string,
): number => {
  const parsed = toNumber(repeatYear);
  if (parsed !== undefined) return parsed;
  return status === "재학생" ? 0 : 1;
};

const mapExamSlot = (exam: FormExamSlot): TestGradeEntry => {
  const entry: TestGradeEntry = {
    examType: exam.examType === "수능" ? "CSAT" : "MOCK",
    year: toNumber(exam.year) ?? 2026,
    month: toExamMonth(exam),
    isRepresentative: exam.isRepresentative === true,
  };

  assignIfPresent(entry, "koreanGrade", toNumber(exam.korean?.grade));
  assignIfPresent(entry, "koreanPercentile", toNumber(exam.korean?.percentile));
  assignIfPresent(
    entry,
    "koreanStandardScore",
    toNumber(exam.korean?.standardScore),
  );
  assignIfPresent(entry, "mathGrade", toNumber(exam.math?.grade));
  assignIfPresent(entry, "mathPercentile", toNumber(exam.math?.percentile));
  assignIfPresent(
    entry,
    "mathStandardScore",
    toNumber(exam.math?.standardScore),
  );
  assignIfPresent(entry, "englishGrade", toNumber(exam.english));
  assignIfPresent(entry, "inquiry1Grade", toNumber(exam.inquiry1));
  assignIfPresent(entry, "inquiry2Grade", toNumber(exam.inquiry2));

  return entry;
};

const markRepresentative = (testGrades: TestGradeEntry[]): TestGradeEntry[] => {
  if (testGrades.length === 0) return [];

  const representativeCount = testGrades.filter(
    (exam) => exam.isRepresentative,
  ).length;

  if (representativeCount === 1) return testGrades;

  return testGrades.map((exam, index) => ({
    ...exam,
    isRepresentative: index === 0,
  }));
};

const hasExamScore = (exam: FormExamSlot): boolean =>
  [
    exam.korean?.grade,
    exam.korean?.percentile,
    exam.korean?.standardScore,
    exam.math?.grade,
    exam.math?.percentile,
    exam.math?.standardScore,
    exam.english,
    exam.inquiry1,
    exam.inquiry2,
  ].some((value) => toNumber(value) !== undefined);

const toExamMonth = (exam: FormExamSlot): number => {
  const parsedMonth = toNumber(exam.month);
  if (parsedMonth !== undefined) return parsedMonth;
  if (exam.examType === "3모") return 3;
  if (exam.examType === "6모") return 6;
  if (exam.examType === "9모") return 9;
  return 11;
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const parsed = Number(trimmed.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
};

const requireNumber = (value: number | undefined, field: string): number => {
  if (value === undefined) {
    throw new AnalysisInputValidationError(`${field} is required`);
  }

  return value;
};

const optionalNumberField = <Key extends string>(
  key: Key,
  value: number | undefined,
): Partial<Record<Key, number>> =>
  value === undefined ? {} : ({ [key]: value } as Record<Key, number>);

const assignIfPresent = <Key extends keyof TestGradeEntry>(
  entry: TestGradeEntry,
  key: Key,
  value: TestGradeEntry[Key] | undefined,
) => {
  if (value !== undefined) {
    entry[key] = value;
  }
};

const assertPositiveGrade = (value: number | undefined, field: string) => {
  if (value !== undefined && value <= 0) {
    throw new AnalysisInputValidationError(`${field} must be greater than 0`);
  }
};
