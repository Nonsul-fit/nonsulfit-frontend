import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/atoms/Input";
import ScoreInputBox from "../../components/molecules/step/ScoreInputBox";
import StepHeader from "../../components/molecules/step/StepHeader";
import StepNavigation from "../../components/molecules/step/StepNavigation";
import FormCard from "../../components/organisms/FormCard";
import { useFormContext } from "../../context/FormContext";
import { useFormValidation } from "../../hooks/useFormValidation";
import type { MockExamSlot } from "../../types/admission";
import { saveInputData } from "../../types/nonsulService";

const Step03 = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const navigate = useNavigate();
  const { validateRequired } = useFormValidation();
  const { studentInfo, essayInfo, academicInfo, setAcademicInfo } =
    useFormContext();

  const handleGpaUpdate = (field: string, val: string) => {
    setAcademicInfo((prev: any) => ({ ...prev, [field]: val }));
  };

  const handleMockUpdate = (updater: (draft: MockExamSlot) => void) => {
    setAcademicInfo((prev: any) => {
      const newMockExams = [...prev.mockExams];
      const deepCopiedExam = structuredClone(newMockExams[activeTab]);
      updater(deepCopiedExam);
      newMockExams[activeTab] = deepCopiedExam;
      return { ...prev, mockExams: newMockExams };
    });
  };

  const handleFinalSubmit = () => {
    const requiredFields: Record<string, any> = {
      gpaCore: academicInfo.gpaCore,
      gpaAll: academicInfo.gpaAll,
    };

    academicInfo.mockExams.forEach((exam: MockExamSlot, idx: number) => {
      requiredFields[`exam_${idx}_year`] = exam.year;
      requiredFields[`exam_${idx}_korean_grade`] = exam.korean.grade;
      requiredFields[`exam_${idx}_korean_percentile`] = exam.korean.percentile;
      requiredFields[`exam_${idx}_korean_standardScore`] =
        exam.korean.standardScore;
      requiredFields[`exam_${idx}_math_grade`] = exam.math.grade;
      requiredFields[`exam_${idx}_math_percentile`] = exam.math.percentile;
      requiredFields[`exam_${idx}_math_standardScore`] =
        exam.math.standardScore;
      requiredFields[`exam_${idx}_english`] = exam.english;
      requiredFields[`exam_${idx}_inquiry1`] = exam.inquiry1;
      requiredFields[`exam_${idx}_inquiry2`] = exam.inquiry2;
    });

    const isValid = validateRequired(
      requiredFields,
      "정확한 합격 진단을 위해 내신 등급과 3개 회차의 모든 성적 항목을 입력해 주세요.",
    );

    if (!isValid) return false;

    const convertExamMonth = (type: string) => {
      if (type === "3모") return 3;
      if (type === "6모") return 6;
      if (type === "9모") return 9;
      if (type === "수능") return 11;
      return 11;
    };

    const formattedPayload = {
      student: {
        grade: 3,
        repeatYear: studentInfo.status === "재학생" ? 0 : 1,
        academic: studentInfo.track,
        desiredDepartment: studentInfo.major,
        desiredArea: studentInfo.targetRegion,
      },

      essayCompetency: {
        reading: Number(essayInfo.reading) || 0,
        contentComprehension: Number(essayInfo.content_understanding) || 0,
        structure: Number(essayInfo.structure) || 0,
        express: Number(essayInfo.expression) || 0,
        understanding: Number(essayInfo.prompt_understanding) || 0,
        chartPreference: Number(essayInfo.chart_score) || 1,
        englishPreference: Number(essayInfo.english_passage_score) || 1,
        mathPreference: Number(essayInfo.math_question_score) || 1,
        comment: essayInfo.feedback || "",
      },

      schoolGrade: {
        majorGrade: Number(academicInfo.gpaCore) || 0,
        allGrade: Number(academicInfo.gpaAll) || 0,
      },

      testGrades: academicInfo.mockExams.map((exam: MockExamSlot) => ({
        year: Number(exam.year) || 0,
        month: convertExamMonth(exam.examType),
        koreanGrade: Number(exam.korean.grade) || 0,
        koreanPercent: Number(exam.korean.percentile) || 0,
        koreanStandardScore: Number(exam.korean.standardScore) || 0,
        mathGrade: Number(exam.math.grade) || 0,
        mathPercent: Number(exam.math.percentile) || 0,
        mathStandardScore: Number(exam.math.standardScore) || 0,
        englishGrade: Number(exam.english) || 0,
        inquiry1Grade: Number(exam.inquiry1) || 0,
        inquiry2Grade: Number(exam.inquiry2) || 0,
      })),
    };

    saveInputData(formattedPayload)
      .then(() => {
        navigate("/loading");
      })
      .catch((error) => {
        console.error("백엔드 전송 중 에러 발생:", error);
        alert(
          "성적 제출 중 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        );
      });

    return false;
  };

  const currentExam = academicInfo.mockExams[activeTab];

  return (
    <div className="mx-auto max-w-4xl">
      <StepHeader
        currentStep={3}
        totalSteps={3}
        title="학생부 및 수능 성적 입력"
        description="정밀한 합격 진단을 위해 성적을 입력해 주세요."
      />

      <div className="space-y-6">
        <FormCard
          title="학생부 교과 성적"
          icon="🏫"
          badge="❗️소수점 둘째 자리까지 입력"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-2">
            <ScoreInputBox
              label="주요교과 평균 등급"
              value={academicInfo.gpaCore}
              onChange={(e) => handleGpaUpdate("gpaCore", e.target.value)}
              placeholder="등급"
              inputWidth="w-28"
            />
            <ScoreInputBox
              label="전과목 평균 등급"
              value={academicInfo.gpaAll}
              onChange={(e) => handleGpaUpdate("gpaAll", e.target.value)}
              placeholder="등급"
              inputWidth="w-28"
            />
          </div>
        </FormCard>

        {/* 2. 수능 및 모의고사 성적 카드 */}
        <FormCard title="수능 / 모의고사 성적 (최근 3개 회차)" icon="⏱️">
          <div className="space-y-6 p-2">
            <div className="flex rounded-xl bg-gray-100 p-1">
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`w-full py-3 text-sm font-bold rounded-lg duration-200 transition-all ${
                    activeTab === idx
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  최근 {idx + 1}회차 성적
                </button>
              ))}
            </div>

            {/* 시험 종류 및 응시년도 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-700">
                  시험 종류
                </span>
                <div className="flex gap-1 bg-white p-1 rounded-lg border border-gray-200">
                  {["3모", "6모", "9모", "수능"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        handleMockUpdate((draft) => {
                          draft.examType = type;
                        })
                      }
                      className={`px-3 py-1.5 text-xs font-bold rounded-md duration-150 ${
                        currentExam.examType === type
                          ? "bg-primary text-white"
                          : "text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* 응시 년도 입력 */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-700">
                  응시 연도
                </span>
                <div className="w-24">
                  <Input
                    name="year"
                    type="number"
                    value={currentExam.year}
                    onChange={(e) =>
                      handleMockUpdate((draft) => {
                        draft.year = e.target.value;
                      })
                    }
                    placeholder="2026"
                  />
                </div>
              </div>
            </div>

            {/* 과목별 세부 점수 */}
            <div className="space-y-4">
              {/* 국어 영역*/}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4 rounded-xl border border-gray-200 p-4">
                <span className="text-sm font-bold text-gray-800 sm:pr-2">
                  국어 영역
                </span>
                <div className="sm:col-span-3 grid grid-cols-3 gap-3">
                  <Input
                    placeholder="등급"
                    type="number"
                    value={currentExam.korean.grade}
                    onChange={(e) =>
                      handleMockUpdate((draft) => {
                        draft.korean.grade = e.target.value;
                      })
                    }
                  />
                  <Input
                    placeholder="백분위"
                    type="number"
                    value={currentExam.korean.percentile}
                    onChange={(e) =>
                      handleMockUpdate((draft) => {
                        draft.korean.percentile = e.target.value;
                      })
                    }
                  />
                  <Input
                    placeholder="표준점수"
                    type="number"
                    value={currentExam.korean.standardScore}
                    onChange={(e) =>
                      handleMockUpdate((draft) => {
                        draft.korean.standardScore = e.target.value;
                      })
                    }
                  />
                </div>
              </div>

              {/* 수학 영역*/}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4 rounded-xl border border-gray-200 p-4">
                <span className="text-sm font-bold text-gray-800 sm:pr-2">
                  수학 영역
                </span>
                <div className="sm:col-span-3 grid grid-cols-3 gap-3">
                  <Input
                    placeholder="등급"
                    type="number"
                    value={currentExam.math.grade}
                    onChange={(e) =>
                      handleMockUpdate((draft) => {
                        draft.math.grade = e.target.value;
                      })
                    }
                  />
                  <Input
                    placeholder="백분위"
                    type="number"
                    value={currentExam.math.percentile}
                    onChange={(e) =>
                      handleMockUpdate((draft) => {
                        draft.math.percentile = e.target.value;
                      })
                    }
                  />
                  <Input
                    placeholder="표준점수"
                    type="number"
                    value={currentExam.math.standardScore}
                    onChange={(e) =>
                      handleMockUpdate((draft) => {
                        draft.math.standardScore = e.target.value;
                      })
                    }
                  />
                </div>
              </div>

              {/* 영어 및 탐구 영역 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4">
                  <span className="text-xs font-bold text-gray-700">
                    영어 등급
                  </span>
                  <div className="w-20">
                    <Input
                      placeholder="등급"
                      type="number"
                      value={currentExam.english}
                      onChange={(e) =>
                        handleMockUpdate((draft) => {
                          draft.english = e.target.value;
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4">
                  <span className="text-xs font-bold text-gray-700">
                    탐구 1 등급
                  </span>
                  <div className="w-20">
                    <Input
                      placeholder="등급"
                      type="number"
                      value={currentExam.inquiry1}
                      onChange={(e) =>
                        handleMockUpdate((draft) => {
                          draft.inquiry1 = e.target.value;
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4">
                  <span className="text-xs font-bold text-gray-700">
                    탐구 2 등급
                  </span>
                  <div className="w-20">
                    <Input
                      placeholder="등급"
                      type="number"
                      value={currentExam.inquiry2}
                      onChange={(e) =>
                        handleMockUpdate((draft) => {
                          draft.inquiry2 = e.target.value;
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FormCard>
      </div>

      <StepNavigation
        nextPath="/loading"
        onNext={handleFinalSubmit}
        nextLabel="제출하기"
      />
    </div>
  );
};

export default Step03;
