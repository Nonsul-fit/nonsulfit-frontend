import ScoreInputBox from "../../components/molecules/step/ScoreInputBox";
import StepHeader from "../../components/molecules/step/StepHeader";
import StepNavigation from "../../components/molecules/step/StepNavigation";
import FormCard from "../../components/organisms/FormCard";
import { useFormContext } from "../../context/FormContext";
import { useFormValidation } from "../../hooks/useFormValidation";

const Step02 = () => {
  const { validateRequired } = useFormValidation();

  const { essayInfo, setEssayInfo } = useFormContext();

  const handleUpdate = (field: string, val: string | number) => {
    setEssayInfo((prev: any) => ({ ...prev, [field]: val }));
  };

  const handleNextStep = () => {
    const requiredFields = {
      reading: essayInfo.reading,
      content_understanding: essayInfo.content_understanding,
      structure: essayInfo.structure,
      expression: essayInfo.expression,
      prompt_understanding: essayInfo.prompt_understanding,
      chart_score: essayInfo.chart_score,
      english_passage_score: essayInfo.english_passage_score,
      math_question_score: essayInfo.math_question_score,
    };

    return validateRequired(
      requiredFields,
      "정확한 분석을 위해 모든 역량 점수와 선호 유형을 선택해 주세요.",
    );
  };
  return (
    <div className="mx-auto max-w-4xl">
      <StepHeader
        currentStep={2}
        totalSteps={3}
        title="논술 역량 분석"
        description="논술 역량 분석을 위해 내용을 입력해주세요."
      />
      <div className="space-y-6">
        {/*1. 세부 논술 역량 점수 */}
        <FormCard
          title="세부 논술 역량 점수"
          icon="📊"
          badge="❗️문항당 100점 만점 기준"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { key: "reading", label: "독해력" },
              { key: "content_understanding", label: "내용이해력" },
              { key: "structure", label: "구성력" },
              { key: "expression", label: "표현력" },
              { key: "prompt_understanding", label: "문제이해력" },
            ].map((field) => (
              <ScoreInputBox
                key={field.key}
                label={field.label}
                value={essayInfo[field.key as keyof typeof essayInfo] as string}
                onChange={(e) => handleUpdate(field.key, e.target.value)}
                placeholder="점수"
                inputWidth="w-24"
              />
            ))}
          </div>
        </FormCard>
        {/* 2. 선호 논술 유형 */}
        <FormCard
          title="선호 논술 유형"
          icon="🧩"
          badge="💡 1점: 부담 / 2점: 보통 / 3점: 자신"
        >
          <div className="space-y-3">
            {[
              { key: "chart_score", label: "도표 · 자료 해석형" },
              { key: "english_passage_score", label: "영어 제시 문형" },
              { key: "math_question_score", label: "수리 문항형" },
            ].map((item) => (
              <div
                key={item.key}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-gray-200 p-4 bg-white" //
              >
                <span className="text-sm font-bold text-gray-700">
                  {item.label}
                </span>

                <div className="flex gap-2">
                  {[1, 2, 3].map((scoreValue) => {
                    const isSelected =
                      essayInfo[item.key as keyof typeof essayInfo] ===
                      scoreValue;
                    return (
                      <button
                        key={scoreValue}
                        type="button"
                        onClick={() => handleUpdate(item.key, scoreValue)}
                        className={`w-20 py-2 text-xs font-bold rounded-lg border-2 duration-200 transition-all ${
                          isSelected
                            ? "border-primary bg-blue-50 text-primary"
                            : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                        }`}
                      >
                        {scoreValue}점
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </FormCard>
        {/* 3. 선생님 첨삭 총평 입력 */}
        <FormCard title="선생님 첨삭 총평" icon="✏️">
          <textarea
            name="feedback"
            value={essayInfo.feedback}
            onChange={(e) => handleUpdate("feedback", e.target.value)}
            placeholder="받으신 첨삭 내용이나 총평을 자유롭게 입력해 주세요. (예: 논리적 흐름은 좋으나 결론부 요약이 아쉽음)"
            rows={5}
            className="w-full rounded-xl border bg-gray-50 border-gray-200 p-4 text-sm font-medium text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-primary focus:ring-1 focus:bg-white focus:ring-primary resize-none"
          />
        </FormCard>
      </div>{" "}
      <StepNavigation
        nextPath="/step03"
        onNext={handleNextStep}
      ></StepNavigation>
    </div>
  );
};

export default Step02;
