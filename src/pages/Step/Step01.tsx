import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/atoms/Input";
import SelectionCard from "../../components/molecules/step/SelectionCard";
import StepHeader from "../../components/molecules/step/StepHeader";
import StepNavigation from "../../components/molecules/step/StepNavigation";
import FormCard from "../../components/organisms/FormCard";
import { useFormContext } from "../../context/FormContext";
import { useFormValidation } from "../../hooks/useFormValidation";

const Step01 = () => {
  const { validateRequired } = useFormValidation();
  const { studentInfo, setStudentInfo } = useFormContext();

  const handleUpdate = (field: string, val: string) => {
    setStudentInfo((prev: any) => ({ ...prev, [field]: val }));
  };

  const handleNextStep = () => {
    const requiredFields = {
      status: studentInfo.status,
      track: studentInfo.track,
      targetRegion: studentInfo.targetRegion,
      essayCount: studentInfo.essayCount,
    };

    return validateRequired(
      requiredFields,
      "딱 맞는 입시 전략을 위해 모든 기본 정보를 입력해주세요.",
    );
  };

  return (
    <div className="mx-auto max-w-4xl">
      <StepHeader
        currentStep={1}
        totalSteps={3}
        title="기본 정보 입력"
        description="딱 맞는 입시 전략을 위해 기본 정보를 입력해 주세요."
      />

      <div className="space-y-6">
        <SelectionCard
          title="현재 상태"
          icon="🎓"
          options={["재학생", "졸업생(N수)"]}
          value={studentInfo.status}
          onChange={(val) => handleUpdate("status", val)}
        />

        <SelectionCard
          title="계열 선택"
          icon="✍️"
          options={["인문사회 계열", "자연 계열", "예체능 계열"]}
          value={studentInfo.track}
          onChange={(val) => handleUpdate("track", val)}
        />

        <FormCard title="희망 학과" icon="🎯">
          <Input
            name="major"
            value={studentInfo.major}
            onChange={(e) => handleUpdate("major", e.target.value)}
            placeholder="예: 컴퓨터공학과, 경영학과"
          />
        </FormCard>

        <SelectionCard
          title="목표 지역"
          icon="📍"
          options={["전국", "서울·수도권", "비수도권"]}
          value={studentInfo.targetRegion}
          onChange={(val) => handleUpdate("targetRegion", val)}
        />
        <SelectionCard
          title="지원 논술 개수"
          icon="🃏"
          options={["1개", "2개", "3개", "4개", "5개", "6개"]}
          value={studentInfo.essayCount}
          onChange={(val) => handleUpdate("essayCount", val)}
        />
      </div>

      <StepNavigation nextPath="/step02" onNext={handleNextStep} />
    </div>
  );
};

export default Step01;
