import React from "react";

interface SelectionCardProps {
  title: string;
  icon?: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}

const SelectionCard = ({
  title,
  icon,
  options,
  value,
  onChange,
}: SelectionCardProps) => {
  const gridCols =
    {
      1: "sm:grid-cols-1",
      2: "sm:grid-cols-2",
      3: "sm:grid-cols-3",
      4: "sm:grid-cols-4",
    }[options.length] || "sm:grid-cols-3";
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* 상단 타이틀 영역 */}
      <div className="mb-6 flex items-center gap-2">
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded text-sm">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      </div>

      {/* 옵션 버튼 그리드 */}
      <div className={`grid grid-cols-1 gap-3 ${gridCols}`}>
        {options.map((option) => {
          const isSelected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`rounded-lg border-2 py-4 text-sm font-bold transition-all active:scale-[0.98]
                ${
                  isSelected
                    ? "border-[#4d6094] bg-[#ebf2fb] text-pri"
                    : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-200"
                }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SelectionCard;
