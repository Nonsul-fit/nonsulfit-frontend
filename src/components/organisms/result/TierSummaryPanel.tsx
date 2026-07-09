import Card from "../../atoms/Card";
import type { TierSummarySection } from "../../../types/reportPayloadV2";

interface TierSummaryPanelProps {
  tierSummary?: TierSummarySection | null;
}

const TierSummaryPanel = ({ tierSummary }: TierSummaryPanelProps) => {
  const tiers = tierSummary?.tiers ?? [];

  return (
    <section data-result-section="tier-summary" aria-labelledby="tier-title">
      <Card variant="white" className="p-5 rounded-2xl h-full">
        <h2 id="tier-title" className="text-lg font-black text-gray-900 mb-3">
          지원 티어 요약
        </h2>

        {tierSummary?.summary && (
          <p className="mb-3 text-sm font-bold text-gray-600 leading-relaxed">
            {tierSummary.summary}
          </p>
        )}

        {tiers.length > 0 ? (
          <ul className="space-y-2">
            {tiers.map((tier) => (
              <li
                key={tier.tierName}
                className="rounded-lg border border-gray-100 bg-slate-50 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-gray-900">
                    {tier.tierName}
                  </p>
                  <span className="text-[11px] font-black text-primary">
                    {tier.count ?? tier.programIds.length}개
                  </span>
                </div>
                {tier.note && (
                  <p className="mt-1 text-[12px] font-bold text-gray-600 leading-relaxed">
                    {tier.note}
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

export default TierSummaryPanel;
