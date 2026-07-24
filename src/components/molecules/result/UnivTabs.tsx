import TagChip from "../../atoms/TagChip";
import type { RecommendedProgramItem } from "../../../types/reportPayloadV2";

interface UnivTabsProps {
  list: RecommendedProgramItem[];
  activeIdx: number;
  onSelect: (idx: number) => void;
}

const getProgramMeta = (program: RecommendedProgramItem) =>
  (program.metadata ?? {}) as {
    campus?: string;
  };

const UnivTabs = ({ list, activeIdx, onSelect }: UnivTabsProps) => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {list.map((program, idx) => {
        const isActive = activeIdx === idx;
        const metadata = getProgramMeta(program);

        return (
          <button
            key={program.programId}
            type="button"
            onClick={() => onSelect(idx)}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between h-28 relative overflow-hidden group select-none ${
              isActive
                ? " bg-primary border-primary  shadow-md shadow-blue-100/80 ring-1 ring-primary/50"
                : "bg-white border-gray-200  hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <TagChip
                category={program.category}
                displayBucket={program.displayBucket}
              />
              {program.sectionFallback && (
                <span
                  title={program.fallbackReason}
                  className="text-[11px] font-black px-2 py-0.5 rounded-md border border-violet-200 bg-violet-50 text-violet-700 tracking-tight"
                >
                  보정
                </span>
              )}
            </div>
            <div className="mt-2">
              <h3
                className={`text-medium font-black transition-colors leading-tight ${
                  isActive
                    ? "text-white"
                    : "text-gray-800 group-hover:text-gray-900"
                }`}
              >
                {program.universityName}
              </h3>
              <p
                className={`text-[12px] font-medium  mt-0.3 ${
                  isActive ? "text-gray-200" : "text-gray-400"
                }`}
              >
                {metadata.campus ?? program.departmentName}
              </p>
            </div>
          </button>
        );
      })}
    </section>
  );
};

export default UnivTabs;
