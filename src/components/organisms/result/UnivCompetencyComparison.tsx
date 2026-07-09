import { useEffect, useMemo, useState } from "react";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import Card from "../../atoms/Card";
import type { RecommendedProgramItem } from "../../../types/reportPayloadV2";

interface UnivCompetencyComparisonProps {
  currentUniversity: RecommendedProgramItem | null;
  currentUniversityList?: RecommendedProgramItem[];
}

interface ResultProgramMetadata {
  examDateText?: string;
  competencyScores?: Partial<Record<CompetencyKey, number>>;
}

interface LegacySummary {
  examDateText?: string;
}

interface RadarMetric {
  subject: string;
  score?: number;
  avgScore?: number;
}

type CompetencyKey =
  | "reading"
  | "contentComprehension"
  | "understanding"
  | "structure"
  | "express";

const UnivCompetencyComparison = ({
  currentUniversity,
  currentUniversityList = [],
}: UnivCompetencyComparisonProps) => {
  const metadata = (currentUniversity?.metadata ?? {}) as ResultProgramMetadata;
  const legacyProgram = currentUniversity as
    | (RecommendedProgramItem & {
        summary?: LegacySummary;
        radarChartData?: RadarMetric[];
      })
    | null;
  const summary = legacyProgram?.summary ?? {};
  const competencyScores = metadata.competencyScores ?? {};
  const radarChartData =
    legacyProgram?.radarChartData ??
    [
      { subject: "독해력", score: competencyScores.reading },
      { subject: "내용이해력", score: competencyScores.contentComprehension },
      { subject: "문제이해력", score: competencyScores.understanding },
      { subject: "구성력", score: competencyScores.structure },
      { subject: "표현력", score: competencyScores.express },
    ];

  const customChartData = radarChartData.map((item, idx: number) => {
    const userScore = item.score || 0;
    // 기존 합격 평균선 계산식 안전하게 유지
    const avgScore =
      item.avgScore ||
      Math.min(5.0, Math.max(1.0, userScore + (idx % 2 === 0 ? 0.4 : -0.3)));
    return {
      subject: item.subject,
      userScore,
      avgScore,
    };
  });

  const scoreMetrics = customChartData;

  const parseDateText = (dateText: string) => {
    if (!dateText) return null;
    const match = dateText.match(/(\d+)월\s*(\d+)일/);
    if (match) {
      return { month: parseInt(match[1], 10) - 1, day: parseInt(match[2], 10) };
    }
    return null;
  };

  // 💡 포장된 데이터의 examDateText 반영
  const examDateText = metadata.examDateText ?? summary.examDateText ?? "";
  const activeExam = useMemo(() => parseDateText(examDateText), [examDateText]);

  const [currentDate, setCurrentDate] = useState(() => {
    if (activeExam) {
      return new Date(2026, activeExam.month, 1);
    }
    return new Date(2026, 9, 1);
  });

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  useEffect(() => {
    if (activeExam) {
      queueMicrotask(() => {
        setCurrentDate(new Date(2026, activeExam.month, 1));
      });
    }
  }, [activeExam, currentUniversity?.programId]);

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const requiredCells = firstDayIndex + totalDaysInMonth <= 35 ? 35 : 42;

  const calendarDays = Array.from({ length: requiredCells }, (_, i) => {
    const dayNumber = i - firstDayIndex + 1;
    return dayNumber > 0 && dayNumber <= totalDaysInMonth ? dayNumber : null;
  });

  const handlePrevMonth = () =>
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () =>
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  if (!currentUniversity) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      <Card
        variant="white"
        className="lg:col-span-8 p-6 rounded-[2rem] flex flex-col shadow-sm"
      >
        <h3 className="text-xl font-black text-gray-900 mb-6 tracking-tight">
          합격 역량 비교
        </h3>

        <div className="flex flex-col md:flex-row items-stretch gap-4 flex-1 w-full">
          <div className="w-full h-80 md:w-[340px] md:h-auto flex items-center justify-center shrink-0 bg-slate-50 border border-slate-100 rounded-2xl p-4 overflow-visible relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="65%"
                margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
                data={customChartData}
              >
                <PolarGrid stroke="#e2e8f0" />

                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 11, fontWeight: 800, fill: "#475569" }}
                />
                <Radar
                  name="합격자 평균"
                  dataKey="avgScore"
                  stroke="#5f5f5f"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="#10b981"
                  fillOpacity={0.04}
                />
                <Radar
                  name="내 점수"
                  dataKey="userScore"
                  stroke="#2054f0"
                  strokeWidth={2.5}
                  fill="#3784ff"
                  fillOpacity={0.15}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{
                    fontSize: "11px",
                    fontWeight: 800,
                    paddingTop: "15px",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "0.75rem",
                    border: "none",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-3 w-full">
            {/* 🎯 중복 변수명(item, idx) 대신 metric, index로 분리 및 any 타입 추가 완료! */}
            {scoreMetrics.map((metric, index: number) => (
              <div
                key={index}
                className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between items-start text-left"
              >
                <span className="text-[12px] font-extrabold text-gray-500 tracking-tight break-keep">
                  {metric.subject}
                </span>
                <div className="w-full flex flex-col mt-3 space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] font-black text-primary">
                      내 점수
                    </span>
                    <span className="text-xl font-black text-primary">
                      {metric.userScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline border-t border-gray-200/60 pt-1">
                    <span className="text-[10px] font-bold text-gray-500">
                      합격 평균
                    </span>
                    <span className="text-sm font-bold text-gray-500">
                      {metric.avgScore.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card
        variant="white"
        className="lg:col-span-4 p-6 rounded-[2rem] flex flex-col shadow-sm justify-between"
      >
        <div className="flex flex-col gap-2 w-full mb-4 mt-1">
          <span className="text-xl font-black text-gray-900 tracking-tighter">
            논술 일정
          </span>
          <div className="text-[11px] text-primary font-black tracking-tight bg-blue-50 px-3 py-2 rounded-xl break-keep leading-relaxed text-left w-full">
            {metadata.examDateText || summary.examDateText || "시험 일정 정보 없음"}
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 w-full mb-5 pb-4 border-b border-b-gray-100">
          <button
            onClick={handlePrevMonth}
            className="text-gray-300 hover:text-gray-900 font-bold transition-colors p-1 text-sm select-none"
          >
            ◀
          </button>
          <h3 className="text-xl font-black text-gray-900 tracking-tight min-w-[50px] text-center">
            {currentMonth + 1}월
          </h3>
          <button
            onClick={handleNextMonth}
            className="text-gray-300 hover:text-gray-900 font-bold transition-colors p-1 text-sm select-none"
          >
            ▶
          </button>
        </div>

        <div className="w-full flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-black text-gray-400 mb-3">
            {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
              <span
                key={i}
                className={
                  i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : ""
                }
              >
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              if (day === null)
                return <div key={idx} className="h-11 bg-transparent" />;

              const isExamDay =
                activeExam &&
                activeExam.month === currentMonth &&
                activeExam.day === day;
              const overlappingUniversities = currentUniversityList.filter(
                (univ) => {
                  const targetDate = parseDateText(
                    ((univ.metadata ?? {}) as ResultProgramMetadata)
                      .examDateText ?? "",
                  );
                  return (
                    targetDate &&
                    targetDate.month === currentMonth &&
                    targetDate.day === day &&
                    univ.programId !== currentUniversity.programId
                  );
                },
              );

              const hasOtherUnivExam = overlappingUniversities.length > 0;
              let dayStyles =
                "bg-slate-50 border-slate-100 text-gray-600 hover:border-gray-200";

              if (isExamDay) {
                dayStyles =
                  "bg-primary border-primary text-white font-black scale-105 shadow-lg shadow-blue-900/20";
              } else if (hasOtherUnivExam) {
                dayStyles =
                  "bg-blue-50/80 border-blue-200/70 text-primary font-bold";
              }

              return (
                <div
                  key={idx}
                  className={`h-11 rounded-xl flex flex-col items-center justify-between py-1 text-xs font-bold border transition-all duration-200 relative ${dayStyles}`}
                >
                  <span>{day}</span>
                  <div className="flex gap-0.5 justify-center h-1.5 w-full items-center mb-0.5">
                    {overlappingUniversities.map((univ) => (
                      <span
                        key={univ.programId}
                        title={univ.universityName}
                        className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UnivCompetencyComparison;
