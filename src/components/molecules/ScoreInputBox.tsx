// src/components/molecules/ScoreInputBox.tsx
import React from "react";
import Input from "../atoms/Input";

interface ScoreInputBoxProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  inputWidth?: string; // 🚀 "w-24", "w-28", "w-20" 등 디자이너가 원하는 너비를 유연하게 주입!
}

const ScoreInputBox = ({
  label,
  value,
  onChange,
  placeholder = "입력",
  type = "number",
  inputWidth = "w-24", // 기본값은 w-24로 설정
}: ScoreInputBoxProps) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-3 px-4 shadow-sm transition-all">
      {/* 왼쪽 라벨 */}
      <span className="text-sm font-semibold text-gray-700">{label}</span>

      {/* 오른쪽 인풋 (너비 제어 포장지) */}
      <div className={inputWidth}>
        <Input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default ScoreInputBox;
