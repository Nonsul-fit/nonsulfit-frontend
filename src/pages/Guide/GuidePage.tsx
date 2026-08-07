import { ArrowRight, BookOpen, CheckCircle2, Clock3, Play } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/atoms/Button";

const DEMO_ID = "cmsib1w7a1simqmaapdlvssr6";

const steps = [
  ["내 정보 입력", "최근 모의고사 성적, 내신 정보, 논술 역량 및 지원에 필요한 정보를 입력합니다."],
  ["논술 역량 불러오기", "첨삭관리시스템을 이용하고 있다면 종합 통계·절사평균 CSV로 논술 역량 데이터를 간편하게 불러올 수 있습니다."],
  ["분석 시작", "입력한 수능 성적과 논술 역량, 대학별 전형 조건을 바탕으로 논술핏 분석을 시작합니다."],
  ["지원 전략 확인", "분석 완료 후 추천 대학과 안정·적정·상향으로 구성된 나의 논술 지원 전략을 확인합니다."],
] as const;

const notices = [
  ["정확한 정보를 입력해주세요.", "최근 모의고사 성적과 논술 관련 정보를 정확하게 입력할수록 현재 상태를 더 올바르게 분석하는 데 도움이 됩니다."],
  ["추천 점수는 합격 확률이 아닙니다.", "추천 결과는 학생의 성적, 논술 역량, 대학별 전형 조건 등을 종합한 지원 전략 판단을 위한 결과입니다."],
  ["추천 이유도 함께 확인해주세요.", "대학 이름이나 점수만 보지 말고 각 추천 카드의 상세 분석과 추천 이유, 주의 요소까지 함께 확인해주세요."],
] as const;

const reportTiers = [
  ["안정", "현재 조건을 기준으로 지원 구성의 안정성을 상대적으로 보완하는 선택지입니다."],
  ["적정", "학생의 현재 조건과 대학의 요구 조건이 비교적 균형 있게 맞는 선택지입니다."],
  ["상향", "현재 조건보다 도전적이지만 전체 지원 전략 안에서 고려할 가치가 있는 선택지입니다."],
] as const;

const GuidePage = () => {
  const navigate = useNavigate();
  const [demoError, setDemoError] = useState(false);

  const openGuide = () => {
    setDemoError(false);
    try {
      if (!window.Supademo?.open) throw new Error("Supademo SDK is not loaded");
      window.Supademo.open(DEMO_ID);
    } catch (error) {
      console.error("Failed to open Supademo guide", error);
      setDemoError(true);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-14 pb-8 sm:space-y-16">
      <section className="border-b border-slate-200 pb-10 pt-3 sm:pb-12 sm:pt-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-primary">
          <BookOpen aria-hidden="true" className="h-4 w-4" /> 논술핏 사용 가이드
        </div>
        <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl">
          처음이신가요?<br />논술핏 사용법을 확인해보세요.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
          성적과 논술 역량을 입력하는 방법부터 분석을 시작하고 나에게 맞는 대학별 지원 전략을 확인하는 방법까지 단계별로 안내해드립니다.
        </p>
        <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-slate-500">
          <Clock3 aria-hidden="true" className="h-4 w-4" /> 약 1분이면 확인할 수 있어요.
        </p>
      </section>

      <section aria-labelledby="flow-title">
        <h2 id="flow-title" className="text-xl font-black text-slate-900 sm:text-2xl">논술핏 이용 순서</h2>
        <ol className="mt-7 grid gap-7 border-l border-slate-200 pl-6 sm:grid-cols-2 sm:border-l-0 sm:pl-0 lg:grid-cols-4">
          {steps.map(([title, description], index) => (
            <li key={title} className="relative sm:border-t sm:border-slate-200 sm:pt-5">
              <span className="absolute -left-[31px] top-0 h-2.5 w-2.5 rounded-full bg-primary sm:-top-[5px] sm:left-0" />
              <span className="text-sm font-black text-primary">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-black text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border border-blue-100 bg-white p-6 sm:p-9" aria-labelledby="demo-title">
        <h2 id="demo-title" className="text-2xl font-black text-slate-900">직접 따라해보세요</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">실제 화면을 보면서 논술핏 사용 과정을 순서대로 확인할 수 있습니다.</p>
        <Button type="button" fullWidth={false} onClick={openGuide} className="mt-6 flex items-center justify-center gap-2 px-5 sm:w-auto">
          <Play aria-hidden="true" className="h-4 w-4 fill-current" /> 인터랙티브 사용 가이드 시작하기
        </Button>
        <p className="mt-3 text-sm text-slate-500">실제 논술핏 화면을 따라가며 단계별 사용법을 확인할 수 있어요.</p>
        {demoError && <p role="alert" className="mt-3 text-sm font-bold text-red-600">가이드를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>}
      </section>

      <section aria-labelledby="notice-title">
        <h2 id="notice-title" className="text-xl font-black text-slate-900 sm:text-2xl">사용 전 알아두세요</h2>
        <ul className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
          {notices.map(([title, description], index) => (
            <li key={title} className="flex gap-3 py-5">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div><h3 className="font-black text-slate-900">{index + 1}. {title}</h3><p className="mt-1.5 text-sm leading-6 text-slate-600">{description}</p></div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="report-title">
        <h2 id="report-title" className="text-xl font-black text-slate-900 sm:text-2xl">분석 결과는 이렇게 확인하세요</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">아래 구분은 합격이나 불합격을 보장하지 않으며, 지원 조합을 균형 있게 검토하기 위한 전략적 기준입니다.</p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          {reportTiers.map(([term, description]) => (
            <div key={term} className="border-t-2 border-primary pt-4"><dt className="font-black text-primary">{term}</dt><dd className="mt-2 text-sm leading-6 text-slate-600">{description}</dd></div>
          ))}
        </dl>
      </section>

      <section className="rounded-2xl bg-[#ebf2fb] p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-9">
        <div><h2 className="text-xl font-black text-slate-900 sm:text-2xl">이제 나에게 맞는 논술 지원 전략을 확인해보세요.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">성적과 논술 역량을 입력하면 논술핏이 대학별 전형 조건을 분석해 나에게 맞는 지원 전략을 제안합니다.</p></div>
        <Button type="button" fullWidth={false} onClick={() => navigate("/home")} className="mt-6 flex shrink-0 items-center justify-center gap-2 px-5 sm:mt-0">논술핏 분석 시작하기 <ArrowRight aria-hidden="true" className="h-4 w-4" /></Button>
      </section>
    </div>
  );
};

export default GuidePage;
