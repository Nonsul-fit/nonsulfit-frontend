import React, { useState } from "react";
import StepHeader from "../../components/molecules/StepHeader";
import FormCard from "../../components/organisms/FormCard";
import Input from "../../components/atoms/Input";
import StepNavigation from "../../components/molecules/StepNavigation";
import ScoreInputBox from "../../components/molecules/ScoreInputBox";

interface DetailedScore {
  grade: string;
  percentile: string;
  standardScore: string;
}

interface MockExamSlot {
  examType: string;
  year: string;
  korean: DetailedScore;
  math: DetailedScore;
  english: string;
  inquiry1: string;
  inquiry2: string;
}

const Step03 = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const [academicInfo, setAcademicInfo] = useState({
    gpaCore: "",
    gpaAll: "",

    mockExams: [
      createEmptyExamSlot(),
      createEmptyExamSlot(),
      createEmptyExamSlot(),
    ] as MockExamSlot[],
  });

  // 초기 빈 주머니 생성기
  function createEmptyExamSlot(): MockExamSlot {
    return {
      examType: "6모",
      year: "2026",
      korean: { grade: "", percentile: "", standardScore: "" },
      math: { grade: "", percentile: "", standardScore: "" },
      english: "",
      inquiry1: "",
      inquiry2: "",
    };
  }

  const handleGpaUpdate = (field: string, val: string) => {
    setAcademicInfo((prev) => ({ ...prev, [field]: val }));
  };

  const handleMockUpdate = (updater: (draft: MockExamSlot) => void) => {
    setAcademicInfo((prev) => {
      const newMockExams = [...prev.mockExams];
      updater(newMockExams[activeTab]);
      return { ...prev, mockExams: newMockExams };
    });
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

        {/*  2. 수능 및 모의고사 성적 카드 */}
        <FormCard title="수능 / 모의고사 성적 (최근 3개 회차)" icon="⏱️">
          <div className="space-y-6 p-2">
            {/* 🚀 회차 선택 세그먼트 탭 */}
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

            {/* ⚙️ 선택 영역 A: 시험 종류 및 응시년도 세팅 라인 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              {/* 시험 종류 캡슐 스위치 */}
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

            {/* 🧮 선택 영역 B: 과목별 세부 점수 입력 매트릭스 */}
            <div className="space-y-4">
              {/* 국어 영역 (3개 칸 세트) */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4 rounded-xl border border-gray-200 p-4">
                <span className="text-sm font-bold text-gray-800 border-r border-gray-100 sm:pr-2">
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

              {/* 수학 영역 (3개 칸 세트) */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4 rounded-xl border border-gray-200 p-4">
                <span className="text-sm font-bold text-gray-800 border-r border-gray-100 sm:pr-2">
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

              {/* 영어 및 탐구 영역 (1개 등급 칸만 세로 배치) */}
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

      {/* 완료 버튼을 누르면 대시보드나 결과 리포트창으로 유도 */}
      <StepNavigation nextPath="/dashboard" />
    </div>
  );
};

export default Step03;
