import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SelectionCard from "../../components/molecules/SelectionCard";
import StepHeader from "../../components/molecules/StepHeader";
import Input from "../../components/atoms/Input";
import StepNavigation from "../../components/molecules/StepNavigation";
import FormCard from "../../components/organisms/FormCard";

const Step01 = () => {
  const navigate = useNavigate();

  const [studentInfo, setStudentInfo] = useState({
    status: "재학생",
    track: "",
    major: "",
    targetRegion: "서울·수도권",
    period: "",
  });

  const handleUpdate = (field: string, val: string) => {
    setStudentInfo((prev) => ({ ...prev, [field]: val }));
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
      </div>

      <StepNavigation nextPath="/step02"></StepNavigation>
    </div>
  );
};

export default Step01;
