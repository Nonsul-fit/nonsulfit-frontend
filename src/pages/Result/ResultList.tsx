import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Card from "../../components/atoms/Card";

interface ReportItem {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

const ResultList = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const response = await api.get("/nonsulfit/result");
        setList(response.data?.result || []);
      } catch (e) {
        console.error("목록 불러오기 실패:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchList();
  }, []);

  const getFormattedDateTime = (report: ReportItem) => {
    if (!report.createdAt) {
      return {
        dateTimeChip: "0월 0일 · 오전 00:00",
        mainTitle: `분석 리스트 ${report.id}번`,
      };
    }

    const parts = report.createdAt.split(/[- :]/);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    const hour = parseInt(parts[3], 10);
    const minute = parseInt(parts[4], 10);

    const ampm = hour >= 12 ? "오후" : "오전";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const displayMinute = minute < 10 ? `0${minute}` : minute;

    return {
      dateTimeChip: `${month}월 ${day}일 · ${ampm} ${displayHour}:${displayMinute}`,

      mainTitle: `분석 리스트 ${report.id}번`,
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
      ) : list.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {list.map((report) => {
            const { dateTimeChip, mainTitle } = getFormattedDateTime(report);

            return (
              <Card
                key={report.id}
                variant="white"
                className="p-6 rounded-2xl border border-gray-100 flex justify-between items-center bg-white hover:border-primary/50 hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/result/${report.id}`)}
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
        <div className="text-center py-27 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200 shadow-sm flex flex-col items-center justify-center">
          <span className="text-4xl mb-4"></span>
          <p className="text-medium font-extrabold text-gray-700 mb-5">
            아직 생성된 논술핏 분석 리포트 이력이 없습니다.
          </p>
          <button
            onClick={() => navigate("/home")}
            className="px-6 py-3.5 bg-primary text-white font-extrabold text-medium rounded-xl shadow-md hover:opacity-90 transition-all duration-200"
          >
            첫 리포트 분석하러 가기
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultList;
