import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAnalysisContext } from "../../context/AnalysisContext";
import { checkAnalysisStatus } from "../../types/nonsulService";

const LoadingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { analysisRunId, setAnalysisRunId } = useAnalysisContext();
  const [errorMessage, setErrorMessage] = useState<string>("");

  const routeAnalysisRunId = useMemo(() => {
    const state = location.state as { analysisRunId?: unknown } | null;
    return typeof state?.analysisRunId === "string" ? state.analysisRunId : "";
  }, [location.state]);

  const currentAnalysisRunId = analysisRunId || routeAnalysisRunId;

  useEffect(() => {
    if (routeAnalysisRunId && routeAnalysisRunId !== analysisRunId) {
      setAnalysisRunId(routeAnalysisRunId);
    }
  }, [analysisRunId, routeAnalysisRunId, setAnalysisRunId]);

  useEffect(() => {
    if (!currentAnalysisRunId) {
      setErrorMessage(
        "분석 실행 ID가 없어 리포트 생성 상태를 확인할 수 없습니다.",
      );
      return;
    }

    const poll = setInterval(async () => {
      try {
        const data = await checkAnalysisStatus(currentAnalysisRunId);

        if (data.status === "COMPLETED") {
          clearInterval(poll);

          try {
            const listResponse = await api.get("/nonsulfit/result");
            const reports = listResponse.data?.result || [];

            if (reports.length > 0) {
              const maxId = Math.max(...reports.map((r: any) => Number(r.id)));

              navigate(`/result/${maxId}`);
            } else {
              navigate("/result");
            }
          } catch (error) {
            console.error(
              "최신 리포트 ID 조회 실패, 기본 목록으로 이동:",
              error,
            );
            navigate("/result");
          }
        }

        if (data.status === "FAILED") {
          clearInterval(poll);

          const errorMsg =
            data.errorMessage || "서버 데이터 형식이 올바르지 않습니다.";
          alert(
            `⚠️ 분석 실패\n\n이유: ${errorMsg}\n\n성적 입력 창으로 돌아갑니다.`,
          );

          navigate("/step03");
        }
      } catch (e) {
        console.error("체크 실패", e);
        setErrorMessage(
          "분석 상태를 확인하는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        );
      }
    }, 2000);

    return () => clearInterval(poll);
  }, [currentAnalysisRunId, navigate]);

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] py-20 px-4 text-center">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
          !
        </div>
        <h2 className="text-xl font-bold mb-2">분석 상태를 불러올 수 없습니다.</h2>
        <p className="text-gray-500 text-sm mb-8">{errorMessage}</p>
        <button
          type="button"
          onClick={() => navigate("/step03")}
          className="rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white"
        >
          성적 입력으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] py-20">
      <div className="w-16 h-16 border-4 border-indigo-100 border-t-primary rounded-full animate-spin mb-8" />
      <h2 className="text-xl font-bold mb-2">논술 분석 리포트 생성중입니다.</h2>
      <p className="text-gray-400 text-sm">잠시만 기다려 주세요.</p>
    </div>
  );
};

export default LoadingPage;
