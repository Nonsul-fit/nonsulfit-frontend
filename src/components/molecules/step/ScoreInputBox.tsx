import React from "react";
import Input from "../../atoms/Input";

interface ScoreInputBoxProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  inputWidth?: string;
}

const ScoreInputBox = ({
  label,
  value,
  onChange,
  placeholder = "입력",
  type = "number",
  inputWidth = "w-24",
}: ScoreInputBoxProps) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-3 px-4 transition-all">
      <span className="text-sm font-semibold text-gray-700">{label}</span>

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
