export type FilterType = "적정" | "상향" | "하향";

interface ResultHeaderProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  count: number;
}

const ResultHeader = ({
  currentFilter,
  onFilterChange,
  count,
}: ResultHeaderProps) => {
  const filterButtons = [
    {
      type: "적정" as FilterType,
      label: "적정",
      activeClass: "bg-primary text-white border-primary",
    },
    {
      type: "상향" as FilterType,
      label: "상향",
      activeClass: "bg-primary text-white border-primary",
    },

    {
      type: "하향" as FilterType,
      label: "하향",
      activeClass: "bg-primary text-white border-primary",
    },
  ];

  return (
    <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 border-b border-gray-200 pb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[#1e293b] leading-tight">
          입시 포트폴리오 진단 리포트
        </h1>
        <p className="mt-2 text-sm md:text-base font-medium text-gray-500">
          최적화된 {count}개 대학 조합 리포트입니다. 카드를 선택해 상세 결과를
          확인하세요.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {filterButtons.map((btn) => {
          const isActive = currentFilter === btn.type;

          return (
            <button
              key={btn.type}
              type="button"
              onClick={() => onFilterChange(btn.type)}
              className={`px-5 py-1.5 text-sm font-bold rounded-4xl border transition-all duration-200 select-none ${
                isActive
                  ? btn.activeClass
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {btn.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};

export default ResultHeader;
