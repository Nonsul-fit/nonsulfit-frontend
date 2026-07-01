import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { FilterType } from "../../components/molecules/result/ResultHeader";
import ResultHeader from "../../components/molecules/result/ResultHeader";
import UnivTabs from "../../components/molecules/result/UnivTabs";
import EvaluationReport from "../../components/organisms/result/EvaluationReport";
import UnivCompetencyComparison from "../../components/organisms/result/UnivCompetencyComparison";
import UnivDetailSummary from "../../components/organisms/result/UnivDetailSummary";
import { useNonsulResult } from "../../hooks/useNonsulResult";
import ChatBtn from "../../components/organisms/ChatBtn";
import { useFormContext } from "../../context/FormContext"; // 🔑 1. 컨텍스트 임포트 추가

const Result = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [filter, setFilter] = useState<FilterType>("상향");
  const [activeIdx, setActiveIdx] = useState<number>(0);

  const { studentInfo } = useFormContext();

  const selectedLimit = studentInfo?.essayCount
    ? Number(studentInfo.essayCount.replace("개", ""))
    : 4;

  const { universityList, isLoading } = useNonsulResult(
    id,
    filter,
    selectedLimit,
  );

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setActiveIdx(0);
  };

  const currentUniversity = universityList[activeIdx] || universityList[0];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 relative">
      <ResultHeader
        currentFilter={filter}
        onFilterChange={handleFilterChange}
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-8 h-8 border-4 border-gray-100 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-medium font-medium text-gray-500">
            리포트 데이터를 불러오는 중...
          </p>
        </div>
      ) : universityList.length > 0 ? (
        <>
          <UnivTabs
            list={universityList}
            activeIdx={activeIdx}
            onSelect={setActiveIdx}
          />
          <UnivDetailSummary currentUniversity={currentUniversity} />
          <EvaluationReport currentUniversity={currentUniversity} />
          <UnivCompetencyComparison
            currentUniversity={currentUniversity}
            currentUniversityList={universityList}
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

      <ChatBtn savedAnalysisReportId={id} />
    </div>
  );
};

export default Result;
