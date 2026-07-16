import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/atoms/Input";
import ScoreInputBox from "../../components/molecules/step/ScoreInputBox";
import StepHeader from "../../components/molecules/step/StepHeader";
import StepNavigation from "../../components/molecules/step/StepNavigation";
import FormCard from "../../components/organisms/FormCard";
import { submitAnalysisInput } from "../../api/analysis";
import { mapFormToAnalysisInput } from "../../adapters/analysisInputMapper";
import { useAnalysisContext } from "../../context/AnalysisContext";
import { useFormContext } from "../../context/FormContext";
import { useFormValidation } from "../../hooks/useFormValidation";
import type { MockExamSlot } from "../../types/admission";

const Step03 = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const navigate = useNavigate();
  const { validateRequired } = useFormValidation();
  const { setAnalysisRunId } = useAnalysisContext();
  const { studentInfo, essayInfo, academicInfo, setAcademicInfo } =
    useFormContext();

  const [serverError, setServerError] = useState<string>("");

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
    setServerError("");

    const requiredFields: Record<string, any> = {
      gpaCore: academicInfo.gpaCore,
      gpaAll: academicInfo.gpaAll,
    };

    const filledExams = academicInfo.mockExams.filter((exam: MockExamSlot) => {
      return !!(
        exam.korean?.grade ||
        exam.math?.grade ||
        exam.english ||
        exam.inquiry1 ||
        exam.inquiry2
      );
    });

    if (filledExams.length === 0) {
      setServerError(
        "⚠️ 정밀한 합격 진단을 위해 최근 3개 회차 중 최소 1개 회차 이상의 성적을 입력해 주세요.",
      );
      return false;
    }

    filledExams.forEach((exam: MockExamSlot, idx: number) => {
      requiredFields[`exam_${idx}_year`] = exam.year;
      requiredFields[`exam_${idx}_korean_grade`] = exam.korean?.grade;
      requiredFields[`exam_${idx}_math_grade`] = exam.math?.grade;
      requiredFields[`exam_${idx}_english`] = exam.english;
      requiredFields[`exam_${idx}_inquiry1`] = exam.inquiry1;
      requiredFields[`exam_${idx}_inquiry2`] = exam.inquiry2;
    });

    const isValid = validateRequired(
      requiredFields,
      "입력하신 회차의 모든 과목 등급과 응시 연도를 빠짐없이 입력해 주세요.",
    );

    if (!isValid) return false;

    const payload = mapFormToAnalysisInput({
      studentInfo: {
        ...studentInfo,
        applicationCount: studentInfo.essayCount,
      },
      essayInfo,
      academicInfo: {
        ...academicInfo,
        mockExams: filledExams,
      },
    });

    submitAnalysisInput(payload)
      .then((data) => {
        setAnalysisRunId(data.analysisRunId);
        navigate("/loading", { state: { analysisRunId: data.analysisRunId } });
      })
      .catch((error: any) => {
        console.error("백엔드 전송 중 에러 발생:", error);
        if (error.response?.status === 400) {
          const backendMessage = error.response.data?.message || "";
          setServerError(
            `⚠️ 입력 정보 형식이 올바르지 않습니다. (${backendMessage})`,
          );
        } else {
          setServerError(
            "⚠️ 성적 제출 중 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
          );
        }
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

        <FormCard
          title="수능 / 모의고사 성적"
          icon="⏱️"
          badge="❗️최소 1개 회차 필수 입력"
        >
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4 bg-white">
                <span className="text-sm font-bold text-gray-800">
                  국어 영역 등급
                </span>
                <div className="w-24">
                  <Input
                    placeholder="등급"
                    type="number"
                    value={currentExam.korean?.grade || ""}
                    onChange={(e) =>
                      handleMockUpdate((draft) => {
                        draft.korean.grade = e.target.value;
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4 bg-white">
                <span className="text-sm font-bold text-gray-800">
                  수학 영역 등급
                </span>
                <div className="w-24">
                  <Input
                    placeholder="등급"
                    type="number"
                    value={currentExam.math?.grade || ""}
                    onChange={(e) =>
                      handleMockUpdate((draft) => {
                        draft.math.grade = e.target.value;
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4 bg-white">
                <span className="text-sm font-bold text-gray-800">
                  영어 영역 등급
                </span>
                <div className="w-24">
                  <Input
                    placeholder="등급"
                    type="number"
                    value={currentExam.english || ""}
                    onChange={(e) =>
                      handleMockUpdate((draft) => {
                        draft.english = e.target.value;
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4 bg-white">
                <span className="text-sm font-bold text-gray-800">
                  탐구 1 등급
                </span>
                <div className="w-24">
                  <Input
                    placeholder="등급"
                    type="number"
                    value={currentExam.inquiry1 || ""}
                    onChange={(e) =>
                      handleMockUpdate((draft) => {
                        draft.inquiry1 = e.target.value;
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4 bg-white sm:col-span-2 md:col-span-1">
                <span className="text-sm font-bold text-gray-800">
                  탐구 2 등급
                </span>
                <div className="w-24">
                  <Input
                    placeholder="등급"
                    type="number"
                    value={currentExam.inquiry2 || ""}
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
        </FormCard>
      </div>

      {serverError && (
        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl text-center text-sm font-semibold text-red-500">
          {serverError}
        </div>
      )}

      <StepNavigation
        nextPath="/loading"
        onNext={handleFinalSubmit}
        nextLabel="제출하기"
      />
    </div>
  );
};

export default Step03;
