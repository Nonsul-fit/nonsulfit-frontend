import Card from "../../atoms/Card";
import type { RiskSummarySection } from "../../../types/reportPayloadV2";

interface RiskSummaryPanelProps {
  riskSummary: RiskSummarySection;
}

const severityClassByLevel: Record<string, string> = {
  low: "bg-blue-50 text-blue-700 border-blue-200",
  medium: "bg-amber-50 text-amber-800 border-amber-200",
  high: "bg-red-50 text-red-700 border-red-200",
};

const RiskSummaryPanel = ({ riskSummary }: RiskSummaryPanelProps) => {
  const legacyRiskSummary = riskSummary as RiskSummarySection & {
    flaggedPrograms?: string[];
  };
  const flaggedProgramIds =
    riskSummary.flaggedProgramIds ?? legacyRiskSummary.flaggedPrograms ?? [];
  const reasons = riskSummary.reasons ?? [];

  return (
    <section data-result-section="risk-summary" aria-labelledby="risk-title">
      <Card variant="white" className="p-5 rounded-2xl">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 id="risk-title" className="text-lg font-black text-gray-900">
            위험 요약
          </h2>
          <span className="text-[12px] font-black text-gray-500 bg-gray-100 border border-gray-200 rounded-md px-2 py-1">
            {flaggedProgramIds.length}개 대학
          </span>
        </div>

        {riskSummary.overview && (
          <p className="mb-3 text-sm font-bold text-gray-600 leading-relaxed">
            {riskSummary.overview}
          </p>
        )}

        {reasons.length > 0 ? (
          <ul className="space-y-2">
            {reasons.map((reason, index) => {
              const severity = reason.riskSeverity ?? "medium";

              return (
                <li
                  key={`${reason.riskFactor}-${index}`}
                  className="rounded-lg border border-gray-100 bg-slate-50 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[11px] font-black ${severityClassByLevel[severity] ?? severityClassByLevel.medium}`}
                    >
                      {severity}
                    </span>
                    <p className="text-sm font-black text-gray-900">
                      {reason.riskFactor}
                    </p>
                  </div>
                  {reason.riskDetail && (
                    <p className="mt-1 text-[12px] font-bold text-gray-600 leading-relaxed">
                      {reason.riskDetail}
                    </p>
                  )}
                </li>
              );
            })}
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

export default RiskSummaryPanel;
