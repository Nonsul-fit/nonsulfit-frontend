import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAnalysisContext } from "../../context/AnalysisContext";
import ContractErrorState from "../../components/organisms/common/ContractErrorState";
import { ContractError } from "../../errors/contractErrors";
import { useAnalysisPolling } from "../../hooks/useAnalysisPolling";
import { buildResultRoute } from "../../router/resultRoutes";

const LoadingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { analysisRunId, setAnalysisRunId, clearAnalysisRunId } =
    useAnalysisContext();

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
      clearAnalysisRunId();
      navigate(buildResultRoute(polling.reportId), {
        state: {
          reportId: polling.reportId,
        },
      });
    }
  }, [clearAnalysisRunId, navigate, polling.reportId, polling.status]);

  const contractError = getContractError(
    currentAnalysisRunId,
    polling.status,
    polling.reportId,
    polling.error,
  );

  if (contractError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] py-20 px-4 text-center">
        <ContractErrorState
          error={contractError}
          onRetry={() => navigate("/step03")}
        />
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

const getContractError = (
  analysisRunId: string | null,
  status: ReturnType<typeof useAnalysisPolling>["status"],
  reportId: string | null,
  error: ReturnType<typeof useAnalysisPolling>["error"],
): ContractError | null => {
  if (!analysisRunId) {
    return new ContractError("ANALYSIS_RUN_ID_MISSING");
  }

  if (status === "COMPLETED" && !reportId) {
    return new ContractError("COMPLETED_REPORT_ID_MISSING");
  }

  if (!error) return null;

  if (error.type === "ANALYSIS_FAILED") {
    return new ContractError("ANALYSIS_FAILED", error);
  }

  return new ContractError("NETWORK_ERROR", error);
};

export default LoadingPage;
