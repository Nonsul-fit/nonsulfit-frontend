interface ResultHeaderProps {
  count: number;
}

const ResultHeader = ({ count }: ResultHeaderProps) => {
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
    </header>
  );
};

export default ResultHeader;
