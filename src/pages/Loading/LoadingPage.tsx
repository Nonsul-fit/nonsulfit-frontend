import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAnalysisContext } from "../../context/AnalysisContext";
import { useAnalysisPolling } from "../../hooks/useAnalysisPolling";

const LoadingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { analysisRunId, setAnalysisRunId } = useAnalysisContext();

  const routeAnalysisRunId = useMemo(() => {
    const state = location.state as { analysisRunId?: unknown } | null;
    return typeof state?.analysisRunId === "string" ? state.analysisRunId : null;
  }, [location.state]);

  const currentAnalysisRunId = analysisRunId || routeAnalysisRunId;
  const polling = useAnalysisPolling(currentAnalysisRunId);

  useEffect(() => {
    if (routeAnalysisRunId && routeAnalysisRunId !== analysisRunId) {
      setAnalysisRunId(routeAnalysisRunId);
    }
  }, [analysisRunId, routeAnalysisRunId, setAnalysisRunId]);

  useEffect(() => {
    if (polling.status === "COMPLETED" && polling.reportId) {
      navigate(`/result/${polling.reportId}`, {
        state: {
          reportId: polling.reportId,
        },
      });
    }
  }, [navigate, polling.reportId, polling.status]);

  const errorMessage = getErrorMessage(currentAnalysisRunId, polling.error);

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

const getErrorMessage = (
  analysisRunId: string | null,
  error: ReturnType<typeof useAnalysisPolling>["error"],
): string => {
  if (!analysisRunId) {
    return "분석 실행 ID가 없어 리포트 생성 상태를 확인할 수 없습니다.";
  }

  if (!error) return "";

  if (error.type === "ANALYSIS_FAILED") {
    return "분석이 실패했습니다. 입력 값을 확인한 뒤 다시 시도해 주세요.";
  }

  if (error.type === "TIMEOUT") {
    return "분석 상태 확인 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.";
  }

  return "분석 상태를 확인하는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
};

export default LoadingPage;
