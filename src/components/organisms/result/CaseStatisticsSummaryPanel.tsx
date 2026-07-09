import Card from "../../atoms/Card";
import type { CaseStatisticsSummarySection } from "../../../types/reportPayloadV2";

interface CaseStatisticsSummaryPanelProps {
  caseStatisticsSummary?: CaseStatisticsSummarySection | null;
}

const CaseStatisticsSummaryPanel = ({
  caseStatisticsSummary,
}: CaseStatisticsSummaryPanelProps) => {
  const statistics = caseStatisticsSummary?.statistics ?? [];

  return (
    <section
      data-result-section="case-statistics-summary"
      aria-labelledby="case-statistics-title"
    >
      <Card variant="white" className="p-5 rounded-2xl h-full">
        <div className="flex items-center justify-between gap-4 mb-3">
          <h2
            id="case-statistics-title"
            className="text-lg font-black text-gray-900"
          >
            사례 통계 요약
          </h2>
          {caseStatisticsSummary?.sampleSize !== undefined && (
            <span className="text-[12px] font-black text-gray-500 bg-gray-100 border border-gray-200 rounded-md px-2 py-1">
              표본 {caseStatisticsSummary.sampleSize}
            </span>
          )}
        </div>

        {caseStatisticsSummary?.summary && (
          <p className="mb-3 text-sm font-bold text-gray-600 leading-relaxed">
            {caseStatisticsSummary.summary}
          </p>
        )}

        {statistics.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {statistics.map((statistic) => (
              <li
                key={statistic.label}
                className="rounded-lg border border-gray-100 bg-slate-50 px-4 py-3"
              >
                <p className="text-[12px] font-black text-gray-500">
                  {statistic.label}
                </p>
                <p className="mt-1 text-xl font-black text-gray-900">
                  {statistic.value}
                  {statistic.unit ?? ""}
                </p>
                {statistic.note && (
                  <p className="mt-1 text-[11px] font-bold text-gray-500 leading-relaxed">
                    {statistic.note}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-gray-100 bg-slate-50 px-4 py-3 text-sm font-bold text-gray-500">
            특이사항 없음
          </p>
        )}
      </Card>
    </section>
  );
};

export default CaseStatisticsSummaryPanel;
