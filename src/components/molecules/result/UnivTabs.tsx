import TagChip from "../../atoms/TagChip";

interface TabItem {
  id: string;
  tag: string;
  university: string;
  campus: string;
}

interface UnivTabsProps {
  list: TabItem[];
  activeIdx: number;
  onSelect: (idx: number) => void;
}

const UnivTabs = ({ list, activeIdx, onSelect }: UnivTabsProps) => {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {list.map((univ, idx) => {
        const isActive = activeIdx === idx;

        return (
          <button
            key={univ.id}
            type="button"
            onClick={() => onSelect(idx)}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between h-28 relative overflow-hidden group select-none ${
              isActive
                ? " bg-primary border-primary  shadow-md shadow-blue-100/80 ring-1 ring-primary/50"
                : "bg-white border-gray-200  hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center">
              <TagChip text={univ.tag} />
            </div>
            {/* 2. 대학교 이름 및 3. 캠퍼스 정보 */}
            <div className="mt-2">
              <h3
                className={`text-medium font-black transition-colors leading-tight ${
                  isActive
                    ? "text-white"
                    : "text-gray-800 group-hover:text-gray-900"
                }`}
              >
                {univ.university}
              </h3>
              <p
                className={`text-[12px] font-medium  mt-0.3 ${
                  isActive ? "text-gray-200" : "text-gray-400"
                }`}
              >
                {univ.campus}캠퍼스
              </p>
            </div>
          </button>
        );
      })}
    </section>
  );
};

export default UnivTabs;
