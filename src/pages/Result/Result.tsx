import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { FilterType } from "../../components/molecules/result/ResultHeader";
import ResultHeader from "../../components/molecules/result/ResultHeader";
import UnivTabs from "../../components/molecules/result/UnivTabs";
import EvaluationReport from "../../components/organisms/result/EvaluationReport";
import CaseStatisticsSummaryPanel from "../../components/organisms/result/CaseStatisticsSummaryPanel";
import UnivCompetencyComparison from "../../components/organisms/result/UnivCompetencyComparison";
import UnivDetailSummary from "../../components/organisms/result/UnivDetailSummary";
import NextActionsPanel from "../../components/organisms/result/NextActionsPanel";
import PatternSummaryPanel from "../../components/organisms/result/PatternSummaryPanel";
import RiskSummaryPanel from "../../components/organisms/result/RiskSummaryPanel";
import TierSummaryPanel from "../../components/organisms/result/TierSummaryPanel";
import WarningsPanel from "../../components/organisms/result/WarningsPanel";
import { useNonsulResult } from "../../hooks/useNonsulResult";
import ChatBtn from "../../components/organisms/ChatBtn";
import { useFormContext } from "../../context/FormContext"; // 🔑 1. 컨텍스트 임포트 추가
import type { RecommendedProgramItem } from "../../types/reportPayloadV2";

type PortfolioBucketKey = "safety" | "match" | "reach";

const filterBucketKey: Record<FilterType, PortfolioBucketKey> = {
  하향: "safety",
  적정: "match",
  상향: "reach",
};

const displayBucketByFilter: Record<FilterType, "stable" | "target" | "reach"> =
  {
    하향: "stable",
    적정: "target",
    상향: "reach",
  };

const Result = () => {
  const navigate = useNavigate();
  const { reportId } = useParams<{ reportId: string }>();

  const [filter, setFilter] = useState<FilterType>("상향");
  const [activeIdx, setActiveIdx] = useState<number>(0);

  const { studentInfo } = useFormContext();

  const selectedLimit = studentInfo?.essayCount
    ? Number(studentInfo.essayCount.replace("개", ""))
    : 4;

  const { result, isLoading, networkError } = useNonsulResult(reportId ?? "");
  const generatedReportV2 = result?.data ?? null;
  const recommendedPrograms = useMemo<RecommendedProgramItem[]>(() => {
    if (!generatedReportV2) return [];

    const selectedBucket = generatedReportV2.portfolioStrategy[
      filterBucketKey[filter]
    ] ?? { programIds: [] };
    const selectedProgramIds = new Set(selectedBucket.programIds);
    const selectedPrograms =
      selectedProgramIds.size > 0
        ? generatedReportV2.recommendedPrograms.filter((program) =>
            selectedProgramIds.has(program.programId),
          )
        : generatedReportV2.recommendedPrograms.filter(
            (program) =>
              program.displayBucket === displayBucketByFilter[filter],
          );

    return selectedPrograms.slice(0, selectedLimit);
  }, [filter, generatedReportV2, selectedLimit]);

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setActiveIdx(0);
  };

  const currentProgram =
    recommendedPrograms[activeIdx] || recommendedPrograms[0] || null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 relative">
      <ResultHeader
        currentFilter={filter}
        onFilterChange={handleFilterChange}
      />

      {!isLoading && generatedReportV2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <WarningsPanel warnings={generatedReportV2.warnings} />
          <RiskSummaryPanel riskSummary={generatedReportV2.riskSummary} />
          <NextActionsPanel nextActions={generatedReportV2.nextActions} />
        </div>
      )}

      {networkError ? (
        <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <p className="text-medium font-medium mb-4">
            리포트 데이터를 불러오는 중 문제가 발생했습니다.
          </p>
          <button
            onClick={() => navigate("/result")}
            className="px-6 py-3 bg-primary text-white font-extrabold text-sm rounded-2xl shadow-md hover:opacity-90 transition-all"
          >
            분석 리스트 돌아가기
          </button>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-8 h-8 border-4 border-gray-100 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-medium font-medium text-gray-500">
            리포트 데이터를 불러오는 중...
          </p>
        </div>
      ) : recommendedPrograms.length > 0 ? (
        <>
          <UnivTabs
            list={recommendedPrograms}
            activeIdx={activeIdx}
            onSelect={setActiveIdx}
          />
          <UnivDetailSummary currentProgram={currentProgram} />
          <EvaluationReport
            currentUniversity={currentProgram}
            consultantSummary={generatedReportV2?.consultantSummary}
          />
          {generatedReportV2 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <TierSummaryPanel tierSummary={generatedReportV2.tierSummary} />
              <PatternSummaryPanel
                patternSummary={generatedReportV2.patternSummary}
              />
              <CaseStatisticsSummaryPanel
                caseStatisticsSummary={
                  generatedReportV2.caseStatisticsSummary
                }
              />
            </div>
          )}
          <UnivCompetencyComparison
            currentUniversity={currentProgram}
            currentUniversityList={recommendedPrograms}
          />

          <div className="flex justify-between items-center pt-4 w-full">
            <button
              onClick={() => navigate("/result")}
              className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-200 text-gray-500 font-bold text-medium rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-all duration-200 shadow-sm"
            >
              분석 리스트 돌아가기
            </button>

            <button
              onClick={() => navigate("/home")}
              className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-200 text-gray-500 font-bold text-medium rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-all duration-200 shadow-sm"
            >
              <span>↩</span> 성적 다시 입력하기
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <p className="text-medium font-medium mb-4">
            해당 조건에 맞는 추천 대학 리포트가 존재하지 않습니다.
          </p>

          <button
            onClick={() => navigate("/home")}
            className="px-6 py-3 bg-primary text-white font-extrabold text-sm rounded-2xl shadow-md hover:opacity-90 transition-all"
          >
            성적 입력하러 가기
          </button>
        </div>
      )}

      <ChatBtn reportId={reportId} reportSnapshot={generatedReportV2} />
    </div>
  );
};

export default Result;
