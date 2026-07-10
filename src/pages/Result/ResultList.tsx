import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchReportList } from "../../api/reports";
import Card from "../../components/atoms/Card";
import ContractErrorState from "../../components/organisms/common/ContractErrorState";
import ReportEmptyState from "../../components/organisms/result/ReportEmptyState";
import type { ReportListItem } from "../../contracts/reportList";
import { ContractError } from "../../errors/contractErrors";
import type { ReportId } from "../../types/identifiers";

const ResultList = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<ReportListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contractError, setContractError] = useState<ContractError | null>(null);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const response = await fetchReportList();
        setList(response.items);
        setContractError(null);
      } catch (e) {
        console.error("목록 불러오기 실패:", e);
        setContractError(new ContractError("REPORT_LIST_INVALID", e));
      } finally {
        setIsLoading(false);
      }
    };
    void fetchList();
  }, []);

  const getFormattedDateTime = (report: ReportListItem) => {
    if (!report.createdAt) {
      return {
        dateTimeChip: "0월 0일 · 오전 00:00",
        mainTitle: report.title ?? `분석 리스트 ${report.reportId}번`,
      };
    }

    const month = report.createdAt.getMonth() + 1;
    const day = report.createdAt.getDate();
    const hour = report.createdAt.getHours();
    const minute = report.createdAt.getMinutes();
    const ampm = hour >= 12 ? "오후" : "오전";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const displayMinute = minute < 10 ? `0${minute}` : minute;

    return {
      dateTimeChip: `${month}월 ${day}일 · ${ampm} ${displayHour}:${displayMinute}`,

      mainTitle: report.title ?? `분석 리스트 ${report.reportId}번`,
    };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="space-y-1.5 pb-2">
        <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">
          내 논술핏 분석 이력
        </h2>
        <p className="text-medium font-medium text-gray-500 mt-2">
          그동안 진단받은 논술 합격 예측 리포트 목록입니다.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-xl border border-dashed shadow-sm  border-gray-200">
          <div className="w-8 h-8 border-4 border-gray-100 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-medium font-medium text-gray-500">
            분석 이력을 불러오는 중...
          </p>
        </div>
      ) : contractError ? (
        <ContractErrorState
          error={contractError}
          onRetry={() => {
            setIsLoading(true);
            setContractError(null);
            void fetchReportList()
              .then((response) => setList(response.items))
              .catch((error) =>
                setContractError(new ContractError("REPORT_LIST_INVALID", error)),
              )
              .finally(() => setIsLoading(false));
          }}
        />
      ) : list.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {list.map((report) => {
            const { dateTimeChip, mainTitle } = getFormattedDateTime(report);

            return (
              <Card
                key={report.reportId}
                variant="white"
                className="p-6 rounded-2xl border border-gray-100 flex justify-between items-center bg-white hover:border-primary/50 hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-300 cursor-pointer group"
                onClick={() =>
                  navigate(`/result/${report.reportId as ReportId}`, {
                    state: {
                      reportId: report.reportId as ReportId,
                    },
                  })
                }
              >
                <div className="space-y-2">
                  <span className="inline-flex text-[12px] md:text-[12px] bg-blue-50 text-primary font-extrabold px-2.5 py-1 rounded-md tracking-wide">
                    {dateTimeChip}
                  </span>

                  <h4 className="font-extrabold text-gray-800 text-lg md:text-lg tracking-tight group-hover:text-primary transition-colors duration-200">
                    {mainTitle}
                  </h4>
                </div>

                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-primary group-hover:text-white text-gray-400 transition-all duration-300 shadow-inner">
                  <span className="font-black text-sm transform group-hover:translate-x-0.5 transition-transform">
                    ➔
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <ReportEmptyState
          title="아직 생성된 논술핏 분석 리포트 이력이 없습니다."
          description="첫 분석을 완료하면 이곳에 리포트가 표시됩니다."
          actionLabel="첫 리포트 분석하러 가기"
          onAction={() => navigate("/home")}
        />
      )}
    </div>
  );
};

export default ResultList;
