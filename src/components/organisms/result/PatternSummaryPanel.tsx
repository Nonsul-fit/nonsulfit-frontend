import Card from "../../atoms/Card";
import type { PatternSummarySection } from "../../../types/reportPayloadV2";

interface PatternSummaryPanelProps {
  patternSummary?: PatternSummarySection | null;
}

const PatternSummaryPanel = ({ patternSummary }: PatternSummaryPanelProps) => {
  const matchedPatterns = patternSummary?.matchedPatterns ?? [];

  return (
    <section
      data-result-section="pattern-summary"
      aria-labelledby="pattern-title"
    >
      <Card variant="white" className="p-5 rounded-2xl h-full">
        <h2
          id="pattern-title"
          className="text-lg font-black text-gray-900 mb-3"
        >
          합격 패턴 요약
        </h2>

        {patternSummary?.summary && (
          <p className="mb-3 text-sm font-bold text-gray-600 leading-relaxed">
            {patternSummary.summary}
          </p>
        )}

        {matchedPatterns.length > 0 ? (
          <ul className="space-y-2">
            {matchedPatterns.map((pattern, index) => (
              <li
                key={pattern.patternId ?? `${pattern.patternName}-${index}`}
                className="rounded-lg border border-gray-100 bg-slate-50 px-4 py-3"
              >
                <p className="text-sm font-black text-gray-900">
                  {pattern.patternName}
                </p>
                {pattern.description && (
                  <p className="mt-1 text-[12px] font-bold text-gray-600 leading-relaxed">
                    {pattern.description}
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

export default PatternSummaryPanel;
