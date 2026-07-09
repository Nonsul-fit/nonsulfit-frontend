import Card from "../../atoms/Card";
import type { ReportWarning, WarningCode } from "../../../types/reportPayloadV2";

interface WarningsPanelProps {
  warnings: ReportWarning[];
}

const warningMessageByCode: Record<WarningCode, string> = {
  SECTION_FALLBACK_USED: "일부 섹션이 보정 데이터로 생성되었습니다.",
  INSUFFICIENT_TOTAL_CANDIDATES: "전체 추천 후보 수가 충분하지 않습니다.",
  INSUFFICIENT_ORIGINAL_BUCKET: "기존 지원권 후보 수가 충분하지 않습니다.",
  INSUFFICIENT_STABLE: "하향 지원권 후보 수가 충분하지 않습니다.",
  INSUFFICIENT_TARGET: "적정 지원권 후보 수가 충분하지 않습니다.",
  INSUFFICIENT_REACH: "상향 지원권 후보 수가 충분하지 않습니다.",
};

const WarningsPanel = ({ warnings }: WarningsPanelProps) => {
  return (
    <section data-result-section="warnings" aria-labelledby="warnings-title">
      <Card variant="white" className="p-5 rounded-2xl">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 id="warnings-title" className="text-lg font-black text-gray-900">
            시스템 경고
          </h2>
          <span className="text-[12px] font-black text-gray-500 bg-gray-100 border border-gray-200 rounded-md px-2 py-1">
            {warnings.length}건
          </span>
        </div>

        {warnings.length > 0 ? (
          <ul className="space-y-2">
            {warnings.map((warning, index) => (
              <li
                key={`${warning.code}-${index}`}
                className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
              >
                <p className="text-sm font-black text-amber-900">
                  {warning.warningTitle ?? warningMessageByCode[warning.code]}
                </p>
                <p className="mt-1 text-[12px] font-bold text-amber-800 leading-relaxed">
                  {warning.warningDetail ?? warningMessageByCode[warning.code]}
                </p>
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

export default WarningsPanel;
