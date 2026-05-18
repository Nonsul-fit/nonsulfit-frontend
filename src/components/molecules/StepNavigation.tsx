// src/components/molecules/StepNavigation.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

interface StepNavigationProps {
  nextPath: string;
  isNextDisabled?: boolean;
}

const StepNavigation = ({
  nextPath,
  isNextDisabled = false,
}: StepNavigationProps) => {
  const navigate = useNavigate();

  return (
    <div className="mt-12 flex justify-between gap-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-4 font-bold text-gray-500 transition-hover hover:bg-gray-50"
      >
        ← 이전
      </button>
      <button
        type="button"
        onClick={() => navigate(nextPath)}
        disabled={isNextDisabled}
        className={`rounded-xl duration-200 px-8 py-4 font-bold text-white shadow-lg transition-hover ${
          isNextDisabled
            ? "bg-gray-300 shadow-none cursor-not-allowed"
            : "bg-primary shadow-primary-200 hover:bg-[#334a8c]"
        }`}
      >
        다음 →
      </button>
    </div>
  );
};

export default StepNavigation;
