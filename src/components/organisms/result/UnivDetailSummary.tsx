import Card from "../../atoms/Card";

interface UnivDetailSummaryProps {
  currentUniversity: any;
}

const UnivDetailSummary = ({ currentUniversity }: UnivDetailSummaryProps) => {
  if (!currentUniversity) return null;

  const {
    university,
    campus,
    tag,
    summary = {},
    explanations = {},
  } = currentUniversity;

  const nonsulRatio = Number(summary.essayRatio) || 100;
  const naesinRatio = Number(summary.naesinRatio) || 0;

  const strokeDasharray = 251.2;
  const strokeDashoffset =
    strokeDasharray - (strokeDasharray * nonsulRatio) / 100;

  return (
    <Card
      variant="white"
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch"
    >
      {/* 대학교 타이틀, 선생님의 한줄평 */}
      <div className="flex flex-col justify-between space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#475569] rounded-xl flex items-center justify-center text-white text-xl font-black shadow-inner">
            {university ? university[0] : "미"}
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              {university}
            </h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {campus}캠퍼스 · {tag || "추천"} 지원권
            </p>
          </div>
        </div>

        <Card
          variant="slate"
          className="p-5 rounded-2xl flex-1 flex flex-col justify-center"
        >
          <div className="inline-flex items-center gap-1.5 bg-white text-primary border border-gray-200 text-[12px] font-extrabold px-4 py-1.5 rounded-full w-fit mb-4">
            선생님의 한줄평
          </div>
          <div className="flex items-center min-h-[52px] w-full">
            <p className="text-medium font-bold text-gray-800 leading-relaxed break-keep text-left w-full">
              "{" "}
              {explanations.comment || "AI 분석 리포트 생성이 완료되었습니다."}{" "}
              "
            </p>
          </div>
        </Card>
      </div>

      {/* 주요 정보 */}
      <Card
        variant="slate"
        className="p-6 rounded-2xl flex flex-col justify-center space-y-3.5"
      >
        {[
          { label: "위치", value: `${campus}캠퍼스 권역` },
          { label: "시험일", value: summary.examDateText || "일정 참조" },
          {
            label: "문제유형",

            value:
              summary.difficultyCode === "HIGHEST"
                ? "다면사고형 / 영어제시문 복합"
                : "독해 및 요약형 자료분석",
          },
          {
            label: "최저",
            value: summary.csatRequirement || "수능최저 학력기준 없음",
          },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <span className="w-20 bg-white text-primary border border-gray-200 text-center text-[12px] font-extrabold py-1 px-2 rounded-full shrink-0">
              {item.label}
            </span>
            <span className="text-sm font-bold text-gray-700 tracking-tight">
              {item.value}
            </span>
          </div>
        ))}
      </Card>

      {/* 원형 그래프 */}
      <Card
        variant="slate"
        className="p-6 rounded-2xl flex items-center justify-between lg:justify-center lg:gap-8 relative overflow-hidden"
      >
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              className="stroke-gray-300"
              strokeWidth="14"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              className="stroke-primary"
              strokeWidth="14"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap={naesinRatio === 0 ? "butt" : "round"}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-[12px] font-black text-gray-800 tracking-tight">
              평가기준
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-center space-y-1 text-right lg:text-left min-w-[75px]">
          <div className="flex items-center gap-2 justify-end lg:justify-start">
            <div className="w-3 h-3 bg-primary rounded-sm" />
            <span className="text-[12px] font-black text-gray-700">
              논술 {nonsulRatio}%
            </span>
          </div>
          <div
            className={`flex items-center gap-2 justify-end lg:justify-start transition-opacity duration-200 ${naesinRatio > 0 ? "opacity-100" : "opacity-0 pointer-events-none select-none"}`}
          >
            <div className="w-3 h-3 bg-gray-300 rounded-sm" />
            <span className="text-[11px] font-bold text-gray-400">
              내신 {naesinRatio}%
            </span>
          </div>
        </div>
      </Card>
    </Card>
  );
};

export default UnivDetailSummary;
