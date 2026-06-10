import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// 🔑 수민님이 직접 연동하신 진짜 공통 헤더 컴포넌트 유지
import Header from "../components/organisms/Header";

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, [location]);

  return (
    <div className="w-full md:h-screen min-h-screen bg-[#f8fafc] text-slate-800 relative overflow-hidden font-sans antialiased">
      <Header />

      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="h-[calc(100vh-64px)] flex flex-col justify-between p-6 md:p-8 max-w-6xl w-full mx-auto relative z-10 pt-16 md:pt-20">
        <main className="w-full flex flex-col md:flex-row items-center justify-between gap-12 my-auto py-4">
          <div className="flex-1 text-left space-y-6 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200 text-xs font-semibold text-[#1b2f67]">
              ✨ 가장 진화한 AI 논술 솔루션
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight md:leading-snug text-slate-800">
              막연한 논술 검색 대신,
              <br />
              <span className="text-[#152962]">내 답안 분석 리포트</span>부터
            </h1>
            <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed max-w-md">
              간단한 점수 입력을 통한 대학별 합격 위험도 진단부터
              <br />
              영역별 정밀 피드백까지 단 1분 만에 체계적으로 끝납니다.
            </p>

            <div className="pt-2 w-full">
              <button
                onClick={() => navigate(isLoggedIn ? "/home" : "/login")}
                className="px-10 py-4 bg-[#1b2f67] text-white font-black text-base rounded-xl shadow-lg shadow-[#1b2f67]/20 hover:bg-[#142450] active:scale-98 transition-all duration-150 text-center w-full sm:w-52"
              >
                {isLoggedIn ? "내 리포트 보러가기" : "무료로 시작하기"}
              </button>
            </div>
          </div>

          <div className="flex-1 w-full max-w-lg bg-white/80 border border-slate-200/80 p-6 md:p-8 rounded-2xl shadow-xl shadow-slate-200/50 space-y-4 backdrop-blur-sm">
            <div className="flex justify-between items-center pb-2">
              <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                CORE SOLUTION
              </p>
              <span className="w-2 h-2 bg-[#1b2f67] rounded-full animate-ping" />
            </div>

            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:border-slate-200 shadow-sm transition-all duration-200">
              <div className="w-12 h-12 text-xl bg-red-500/10 rounded-xl flex items-center justify-center shrink-0">
                📊
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1b2f67] flex items-center gap-2">
                  합격 위험도 리포트
                  <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-black tracking-wider">
                    RISKY
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  대학별 출제 의도와 내 서술 방식의 싱크로율을 진단하여 현재
                  합격 가능성을 즉시 판정합니다.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:border-slate-200 shadow-sm transition-all duration-200">
              <div className="w-12 h-12 text-xl bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                📈
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1b2f67]">
                  역량 비교 다차원 차트
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  논리력, 문장력, 표현력 등 5대 핵심 지표를 세련된 레이더 차트
                  인포그래픽으로 시각화합니다.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:border-slate-200 shadow-sm transition-all duration-200">
              <div className="w-12 h-12 text-xl bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
                🎯
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1b2f67]">
                  문장 단위 정밀 첨삭 코멘트
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  감점 요인이 되는 불명확한 문장을 직접 찾아내고 AI 기반의
                  완벽한 대안 문장을 실시간 제공합니다.
                </p>
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full pt-4 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-400 font-medium">
          <p>© 2026 Nonsulfit. All rights reserved. Designed by Sumin.</p>
          <div className="hidden sm:flex gap-4">
            <span className="hover:text-[#1b2f67] transition-colors cursor-pointer">
              개인정보처리방침
            </span>
            <span className="hover:text-[#1b2f67] transition-colors cursor-pointer">
              서비스이용약관
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
