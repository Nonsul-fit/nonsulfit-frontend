import type { ProgramCategory } from "../../types/reportPayloadV2";

interface TagChipProps {
  category: ProgramCategory;
}

const categoryPresentation: Record<
  string,
  { label: string; colorClass: string }
> = {
  RISKY: {
    label: "상향",
    colorClass: "bg-red-100 text-red-700 border-red-200/90",
  },
  MODERATE: {
    label: "적정",
    colorClass: "bg-amber-100 text-amber-700 border-amber-200/70",
  },
  SAFE: {
    label: "하향",
    colorClass: "bg-teal-100 text-teal-800 border-teal-200/70",
  },
};

const TagChip = ({ category }: TagChipProps) => {
  const presentation = categoryPresentation[category] ?? {
    label: "추천",
    colorClass: "bg-gray-100 text-gray-600 border-gray-200",
  };

  return (
    <span
      className={`text-[12px] font-bold px-2.5 py-0.5 rounded-md border tracking-tight ${presentation.colorClass}`}
    >
      {presentation.label}
    </span>
  );
};

export default TagChip;
