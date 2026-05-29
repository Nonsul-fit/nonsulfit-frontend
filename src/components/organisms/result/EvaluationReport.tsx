import type { UniversityReport } from "../../../pages/Result/mockResultData";
import Card from "../../atoms/Card";

interface EvaluationReportProps {
  currentUniversity: UniversityReport;
}

const EvaluationReport = ({ currentUniversity }: EvaluationReportProps) => {
  if (!currentUniversity) return null;

  const { summary, explanations } = currentUniversity;

  const metrics = [
    {
      label: "나의 총점",
      value: `${summary.myTotalScore}점`,
      color: "text-gray-800",
    },
    {
      label: "수능최저 여부",
      value: summary.isCsatComplied ? "O" : "X",
      color: summary.isCsatComplied ? "text-blue-600" : "text-red-500",
    },
    {
      label: "경쟁률",
      value: `${summary.latestCompetitionRate} : 1`,
      color: "text-gray-800",
    },
    {
      label: "예상 합격 확률",
      value: `${summary.passProbability}%`,
      color: "text-gray-800",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      <Card
        variant="white"
        className="lg:col-span-7 flex flex-col p-6 rounded-[2rem]"
      >
        <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
          포트폴리오 전략
        </h3>

        <div className="space-y-4 flex-1 flex flex-col justify-between">
          {/* 1. 대학교 선정 이유 */}
          <section>
            <h4 className="text-[14px] font-extrabold text-primary uppercase  mb-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              대학교 선정 이유
            </h4>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm font-bold text-gray-700 leading-relaxed break-keep">
              {explanations.selectionReason}
            </div>
          </section>

          {/* 2. 논술 첨삭 총평 */}
          <section>
            <h4 className="text-[14px] font-extrabold text-primary uppercase  mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" /> 논술 첨삭
              총평
            </h4>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm font-bold text-gray-700 leading-relaxed break-keep">
              {explanations.essayFeedback}
            </div>
          </section>

          {/* 3. 대학교 입시 전략 */}
          <section>
            <h4 className="text-[14px]  font-extrabold text-primary uppercase  mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" /> 대학교
              입시 전략
            </h4>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm font-bold text-gray-700 leading-relaxed break-keep">
              {explanations.entranceStrategy}
            </div>
          </section>

          {/* 4. 추천 학과 */}
          <section>
            <h4 className="text-[14px]   font-extrabold text-primary uppercase  mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" /> 학과 추천
            </h4>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm font-bold text-gray-700 leading-relaxed break-keep">
              {explanations.departmentRecommendation}
            </div>
          </section>
        </div>
      </Card>

      {/* 4분할 칩 */}
      <div className="lg:col-span-5 grid grid-cols-2 gap-4 items-stretch">
        {metrics.map((item, idx) => (
          <Card
            key={idx}
            variant="white"
            className="flex flex-col items-center justify-center p-6 rounded-4xl text-center bg-white min-h-[160px]"
          >
            <span className="text-[12px] bg-primary border border-slate-100 font-extrabold text-white px-4 py-1.5 rounded-full uppercase tracking-tight mb-3">
              {item.label}
            </span>
            <span
              className={`text-2xl md:text-3xl text-gray-800 font-black ${item.color} tracking-tighter`}
            >
              {item.value}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EvaluationReport;
