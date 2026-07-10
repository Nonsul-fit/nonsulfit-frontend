import type { ReportMappingError } from "../../../contracts/reportResponse";

interface ReportPartialStateProps {
  errors: ReportMappingError[];
}

const ReportPartialState = ({ errors }: ReportPartialStateProps) => {
  if (errors.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm text-amber-800">
      <p className="font-black mb-1">일부 리포트 정보를 보정해 표시 중입니다.</p>
      <p className="font-medium">
        표시 가능한 추천 결과는 그대로 제공되며, 누락된 항목은 제외되었습니다.
      </p>
    </div>
  );
};

export default ReportPartialState;
