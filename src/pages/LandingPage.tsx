import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  FileCheck2,
  Menu,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import brandLogo from "../assets/brand-logo3.png";
import "./LandingPage.css";

const universities = [
  { tier: "상향", badge: "도전 가능", name: "성균관대학교", major: "사회과학계열", fit: "높음", minimum: "주의", record: "낮음", reason: "영어 제시문과 비판적 추론 강점이 출제 유형과 잘 맞습니다.", risk: "수능 최저 조합이 성적 변동성에 민감합니다.", advantage: "영어 제시문 독해 및 비교형 답안", priority: "영어 1등급 안정화 후 기출 논증 구조 훈련" },
  { tier: "상향", badge: "도전 가능", name: "중앙대학교", major: "공공인재학부", fit: "높음", minimum: "주의", record: "보통", reason: "자료 해석과 비교형 문항 적합도가 높습니다.", risk: "수학 최저 변동성으로 상향 카드로 분류됩니다.", advantage: "자료 해석과 핵심 논점 압축", priority: "자료 해석 속도와 결론 문장 훈련" },
  { tier: "적정", badge: "가장 추천", name: "한국외국어대학교", major: "LT학부", fit: "높음", minimum: "보통", record: "낮음", reason: "영어 제시문 강점을 가장 잘 활용할 수 있는 적정 지원 카드입니다.", risk: "영어 등급이 하락하면 최저 안정도가 낮아질 수 있습니다.", advantage: "영어 독해와 핵심 문장 요약", priority: "영어 제시문 요약과 지문 관계 분석" },
  { tier: "적정", badge: "가장 추천", name: "건국대학교", major: "행정학과", fit: "보통", minimum: "보통", record: "낮음", reason: "학생부 감점 부담이 낮고 논술 유형도 현재 강점과 잘 맞습니다.", risk: "경쟁률 상승 시 논술 점수 영향이 커질 수 있습니다.", advantage: "낮은 학생부 실질 감점", priority: "시간 내 전체 문항 대응률 높이기" },
  { tier: "안정", badge: "안정 카드", name: "숭실대학교", major: "법학과", fit: "높음", minimum: "안정", record: "낮음", reason: "현재 성적과 최저 조합이 안정적이며 논술 유형도 무리 없이 대응 가능합니다.", risk: "시험 당일 시간 관리 위험은 남아 있습니다.", advantage: "최저 안정성과 낮은 학생부 영향", priority: "실전 시간 배분을 고정하는 훈련" },
  { tier: "안정", badge: "안정 카드", name: "광운대학교", major: "미디어커뮤니케이션학부", fit: "보통", minimum: "안정", record: "낮음", reason: "학생부 영향이 낮고 현재 강점이 출제 형식과 안정적으로 맞습니다.", risk: "전체 조합이 지나치게 안정적으로 기울 수 있습니다.", advantage: "학생부 부담이 작은 안전망", priority: "한 장의 안정 카드로 포트폴리오 균형 유지" },
];

const cases = [
  { name: "학생 A", profile: "내신 3.4 · 국어 2 / 수학 4 / 영어 2 / 탐구 3·3", before: "중앙대, 외대, 건국대 정도를 모두 비슷하게 생각함", reach: "중앙대", target: "한국외대, 건국대", safety: "숭실대, 광운대", changes: ["영어 제시문 적합도가 높아 한국외대 추천 순위 상승", "수학 최저 변동성 때문에 중앙대는 상향으로 분류", "학생부 영향이 작은 숭실대를 안정 카드로 추가"], risk: "수학 최저 변동성", action: "영어 강점을 유지하며 수학 최저 조합을 먼저 점검" },
  { name: "학생 B", profile: "내신 2.8 · 국어 2 / 수학 4 / 영어 2 / 탐구 3", before: "학교 이름만 보면 건국대와 숭실대가 끌리지만 실제 적합도를 판단하지 못함", reach: "경희대 사회계열", target: "한국외대, 동국대", safety: "숭실대", changes: ["영어 독해·비교형 답안 강점을 우선 반영", "수리 문항이 있는 모집단위는 조건부 검토", "대학 이름보다 출제 유형 적합도를 우선함"], risk: "수리 문항 대응력", action: "영어 제시문 대학을 우선하고 수리 문항 기출을 진단" },
  { name: "학생 C", profile: "내신 3.6 · 국어 3 / 수학 3 / 영어 4 / 탐구 2", before: "경쟁률이 낮은 대학 위주로 지원하면 유리하다고 생각함", reach: "중앙대", target: "건국대, 동국대", safety: "광운대", changes: ["경쟁률보다 영어 최저 위험을 먼저 반영", "도표 해석 강점이 있는 대학의 순위 상승", "영어 제시문 비중이 높은 대학은 조건부 분류"], risk: "영어 최저와 영어 제시문", action: "영어 최저 개선과 도표 해석형 대학 준비를 병행" },
];

const faq = [
  ["논술핏은 합격 확률을 알려주는 서비스인가요?", "단순한 합격률 예측 서비스가 아닙니다. 성적, 논술 역량과 대학별 전형 조건을 함께 분석해 지원 적합도와 위험 요소, 지원 조합을 제공합니다."],
  ["합격을 보장하나요?", "아니요. 입시는 실제 시험 결과, 경쟁률과 대학의 평가에 따라 달라집니다."],
  ["논술 경험이 없어도 사용할 수 있나요?", "네. 현재 성적을 기반으로 지원 가능 범위와 전형 조건을 분석할 수 있습니다."],
  ["수능 최저가 없는 대학도 분석하나요?", "네. 논술 적합도, 학생부 반영 방식, 경쟁률과 준비 부담 등 다른 요소의 비중을 높여 분석합니다."],
  ["추천 점수가 합격 가능성을 의미하나요?", "아니요. 학생에게 얼마나 전략적으로 적합한지를 나타내는 우선순위 지표입니다."],
  ["대학 모집요강이 변경되면 어떻게 되나요?", "공식 전형계획과 모집요강 변경 사항을 기준으로 데이터를 갱신합니다."],
  ["분석 결과는 얼마나 걸리나요?", "일반적으로 몇 분 안에 전략 리포트를 확인할 수 있도록 구성합니다."],
  ["내 정보는 어떻게 사용되나요?", "입력한 성적과 논술 데이터는 지원 전략 분석과 리포트 제공을 위해서만 사용합니다."],
];

export default function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const finalRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroStep, setHeroStep] = useState(2);
  const [selectedUniversity, setSelectedUniversity] = useState(2);
  const [selectedCase, setSelectedCase] = useState(0);
  const [english, setEnglish] = useState(2);
  const [math, setMath] = useState(4);
  const [grades, setGrades] = useState({ school: "3.4", korean: 2, math: 4, english: 2, track: "인문사회" });
  const [stickyVisible, setStickyVisible] = useState(false);

  const login = () => navigate("/login");
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const improved = english === 1 || math <= 3;
  const university = universities[selectedUniversity];
  const currentCase = cases[selectedCase];
  const completion = Object.values(grades).filter(Boolean).length * 20;

  useEffect(() => {
    let timer = 0;
    const initialTimer = window.setTimeout(() => {
      setHeroStep(0);
      timer = window.setInterval(() => setHeroStep((step) => (step + 1) % 3), 2000);
    }, 3200);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")), { threshold: 0.12 });
    document.querySelectorAll(".nf-reveal").forEach((element) => revealObserver.observe(element));
    const heroObserver = new IntersectionObserver(([entry]) => setStickyVisible(!entry.isIntersecting), { threshold: 0.1 });
    const finalObserver = new IntersectionObserver(([entry]) => entry.isIntersecting && setStickyVisible(false), { threshold: 0.15 });
    if (heroRef.current) heroObserver.observe(heroRef.current);
    if (finalRef.current) finalObserver.observe(finalRef.current);
    return () => { revealObserver.disconnect(); heroObserver.disconnect(); finalObserver.disconnect(); };
  }, []);

  return (
    <div className="nf-page">
      <div className="nf-announcement">2027학년도 논술 전형 데이터를 반영한 지원 전략 분석을 시작했습니다.<button onClick={login}>2027 전형 확인하기 <ArrowRight size={14} /></button></div>
      <header className="nf-header">
        <div className="nf-container nf-nav">
          <button className="nf-logo" onClick={() => scrollTo("top")} aria-label="논술핏 홈"><span><img src={brandLogo} alt="논술핏" /></span><small>데이터 기반 논술 지원 전략</small></button>
          <nav className="nf-nav-links" aria-label="주요 메뉴"><button onClick={() => scrollTo("problem")}>서비스 소개</button><button onClick={() => scrollTo("report")}>분석 리포트</button><button onClick={() => scrollTo("cases")}>지원 사례</button><button onClick={() => scrollTo("process")}>이용 방법</button><button onClick={() => scrollTo("faq")}>자주 묻는 질문</button></nav>
          <div className="nf-nav-actions"><button className="nf-text-button" onClick={() => scrollTo("report")}>샘플 리포트 보기</button><button className="nf-button nf-button-small" onClick={login}>내 지원 전략 확인하기</button></div>
          <button className="nf-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="메뉴 열기" aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && <div className="nf-mobile-menu"><button onClick={() => scrollTo("problem")}>서비스 소개</button><button onClick={() => scrollTo("report")}>분석 리포트</button><button onClick={() => scrollTo("cases")}>지원 사례</button><button onClick={() => scrollTo("process")}>이용 방법</button><button onClick={() => scrollTo("faq")}>자주 묻는 질문</button><button onClick={login}>내 지원 전략 확인하기</button></div>}
      </header>

      <main>
        <section className="nf-hero" id="top" ref={heroRef}>
          <div className="nf-container nf-hero-grid">
            <div className="nf-reveal"><span className="nf-eyebrow">논술 지원 전략 분석 리포트</span><h1>논술 지원,<br />이제는 감이 아니라<br /><em>근거입니다.</em></h1><p>성적, 논술 역량, 수능 최저, 대학별 전형을 함께 분석해<br className="desktop-only" /><br />지원 가능한 대학과<br />왜 그 대학이 유리한지,<br />무엇을 먼저 보완해야 하는지까지 알려드립니다.</p><div className="nf-actions"><button className="nf-button" onClick={login}>내 지원 전략 무료로 확인하기 <ArrowRight size={18} /></button><button className="nf-button nf-button-secondary" onClick={() => scrollTo("report")}>실제 리포트 먼저 보기</button></div><small className="nf-helper">약 3분 소요 · 추천 근거 포함 · 6개 지원 조합 제공</small></div>
            <div className="nf-hero-demo nf-reveal" aria-live="polite">
              <div className="nf-demo-steps"><span className={heroStep === 0 ? "active" : ""}>성적 입력</span><i /><span className={heroStep === 1 ? "active" : ""}>전형 분석 중</span><i /><span className={heroStep === 2 ? "active" : ""}>추천 대학 6개 생성</span></div>
              <div className={`nf-demo-panel step-${heroStep}`}>
                {heroStep === 0 && <div className="nf-demo-content"><span className="nf-sample">샘플 분석 결과</span><h3>현재 성적을 확인합니다.</h3><div className="nf-demo-fields"><span>내신 평균 <b>3.4</b></span><span>국어 <b>2등급</b></span><span>영어 <b>2등급</b></span></div></div>}
                {heroStep === 1 && <div className="nf-demo-content nf-analyzing"><div className="nf-engine-orb"><Sparkles /></div><span className="nf-sample">샘플 분석 결과</span><h3>대학별 전형 조건을 비교하고 있습니다.</h3><div className="nf-progress"><i /></div></div>}
                {heroStep === 2 && <div className="nf-demo-content"><span className="nf-sample">샘플 분석 결과</span><h3>6개 지원 조합이 완성되었습니다.</h3><div className="nf-tier-row"><span className="reach">상향 <b>2</b></span><span className="target">적정 <b>2</b></span><span className="safety">안정 <b>2</b></span></div><p className="nf-reason">추천 이유와 위험 요소까지 함께 확인할 수 있습니다.</p></div>}
              </div>
              <div className="nf-floating-card fc-one"><small>샘플 분석 결과</small><b>수능 최저 충족 가능성 84%</b></div><div className="nf-floating-card fc-two"><small>샘플 분석 결과</small><b>지원 가능 대학군 12개</b></div>
            </div>
          </div>
        </section>

        <section className="nf-summary"><div className="nf-container nf-summary-grid">{[[BookOpenCheck,"대학별 전형 조건 반영"],[Target,"논술 유형별 적합도 분석"],[ShieldCheck,"수능 최저 위험도 분석"],[FileCheck2,"추천 근거와 주의사항 제공"]].map(([Icon,label]) => { const I = Icon as typeof Target; return <div key={String(label)}><I /><span>{String(label)}</span></div>; })}</div><p>성적 분석부터 대학별 적합도, 수능 최저 위험도, 추천 근거까지 한 번에 확인하세요.</p></section>

        <section className="nf-section nf-problem" id="problem"><div className="nf-container"><div className="nf-section-head nf-reveal"><span className="nf-eyebrow">지원 결정의 어려움</span><h2>원서 접수 전까지도<br />확신이 없는 이유</h2><p>성적표만으로는<br />어떤 대학이 나에게 유리한지 알 수 없기 때문입니다.</p></div><div className="nf-worry-grid nf-reveal">{["제 성적으로 어디까지 지원할 수 있는지 모르겠어요.","논술은 자신 있는데 수능 최저가 불안해요.","대학마다 논술 유형이 달라서 뭘 준비해야 할지 모르겠어요.","경쟁률은 높은데 실제로 저한테 불리한 학교인지 판단이 안 돼요.","상향을 써야 할지, 안정 지원을 더 늘려야 할지 모르겠어요.","지원은 여섯 번뿐인데 하나라도 잘못 쓰면 너무 아깝잖아요."].map((text,index)=><blockquote key={text} className={`worry-${index}`}><span>익명 수험생</span>“{text}”</blockquote>)}</div><small className="nf-example-label">수험생의 대표적인 고민을 재구성한 예시</small><div className="nf-bridge nf-reveal"><p>논술 입시는 정보가 부족해서 어려운 것이 아닙니다.</p><strong>정보는 많지만, 그 정보가 나에게 어떤 의미인지 판단하기 어렵기 때문입니다.</strong><p>논술핏은 흩어진 전형 정보를 학생 개인의 데이터와 연결해 실제 지원 결정에 필요한 답으로 바꿉니다.</p></div></div></section>

        <section className="nf-section nf-input-section" id="input"><div className="nf-container"><div className="nf-section-head nf-reveal"><span className="nf-eyebrow">간단한 입력</span><h2>복잡한 서류 없이,<br />현재 성적만 입력하세요.</h2><p>내신과 최근 모의고사 성적, 희망 계열을 입력하면<br />현재 지원 가능 범위부터 먼저 확인할 수 있습니다.</p></div><div className="nf-input-grid nf-reveal"><div className="nf-form-mock"><div className="nf-form-head"><div><span>분석 정보 입력</span><b>{completion === 100 ? "분석 준비 완료" : "입력 중"}</b></div><strong>{completion}%</strong></div><div className="nf-completion"><i style={{width:`${completion}%`}} /></div><label>내신 평균<input value={grades.school} onChange={(e)=>setGrades({...grades,school:e.target.value})} inputMode="decimal" /></label>{(["korean","math","english"] as const).map((subject)=><div className="nf-grade-field" key={subject}><span>{{korean:"국어",math:"수학",english:"영어"}[subject]}</span><div>{[1,2,3,4,5].map(grade=><button className={grades[subject]===grade?"active":""} onClick={()=>setGrades({...grades,[subject]:grade})} key={grade}>{grade}등급</button>)}</div></div>)}<div className="nf-grade-field"><span>희망 계열</span><div>{["인문사회","상경","자연"].map(track=><button className={grades.track===track?"active":""} onClick={()=>setGrades({...grades,track})} key={track}>{track}</button>)}</div></div></div><aside className="nf-input-summary"><div><Clock3 /><span>입력 예상 시간</span><b>약 3분</b></div><div><FileCheck2 /><span>필수 입력 항목</span><b>6개</b></div><div><Sparkles /><span>현재 선택 계열</span><b>{grades.track}</b></div><p><Check /> 논술 경험이 없어도<br />기본 분석 가능</p></aside></div></div></section>

        <section className="nf-section nf-process" id="process"><div className="nf-container"><div className="nf-section-head centered nf-reveal"><span className="nf-eyebrow">이용 과정</span><h2>3단계로 지원 전략을<br />확인하세요.</h2></div><div className="nf-process-grid nf-reveal">{[["01","성적과 논술 정보를 입력합니다.","모의고사, 내신, 논술 역량과 목표 조건을 입력합니다."],["02","학생과 대학 전형을 함께 분석합니다.","성적 조건, 논술 유형, 수능 최저, 위험 요소를 비교합니다."],["03","지원 전략 리포트를 확인합니다.","지원 가능 대학군과 여섯 개 지원 조합, 추천 근거와 준비 방향을 확인합니다."]].map(([num,title,text])=><article key={num}><span>{num}</span><h3>{title}</h3><p>{text}</p></article>)}</div><div className="nf-center-action"><button className="nf-button" onClick={login}>지금 분석 시작하기 <ArrowRight size={18}/></button><small>입력 내용은 지원 전략 분석을 위해서만 사용됩니다.</small></div></div></section>

        <section className="nf-section nf-engine-section" id="engine"><div className="nf-container"><div className="nf-section-head centered nf-reveal"><span className="nf-eyebrow">전략 분석 엔진</span><h2>한 가지 점수로는<br />지원 전략을 만들 수 없습니다.</h2><p>논술핏은 성적만 보는 대신,<br />학생과 대학 사이의 여러 조건을 함께 비교합니다.</p></div><div className="nf-engine nf-reveal"><div className="nf-engine-inputs">{[["학생 성적","최근 성적 흐름"],["논술 역량","나와 맞는 논술 유형"],["대학별 전형","학생부가 얼마나 불리한지"],["수능 최저","수능 최저 충족 가능성"]].map(([a,b],i)=><article style={{animationDelay:`${i*180}ms`}} key={a}><small>{a}</small><strong>{b}</strong></article>)}</div><div className="nf-engine-center"><div className="nf-pulse"><BarChart3 /></div><b>논술핏 전략 분석 엔진</b><span>여러 조건을 교차 분석 중</span></div><div className="nf-engine-results">{["지원 가능 대학군","추천 이유","위험 요소","6개 원서 조합"].map((item,i)=><span style={{animationDelay:`${700+i*160}ms`}} key={item}><Check />{item}</span>)}</div></div><div className="nf-variable-grid nf-reveal">{[["수능 최저 충족 가능성","최근 성적 흐름과 과목 조합을 바탕으로 대학별 최저 위험을 확인합니다."],["나와 잘 맞는 논술 유형","영어 제시문, 자료 해석, 수리 문항 등 학생의 강점과 대학별 출제 유형을 연결합니다."],["학생부가 얼마나 불리한지","명목 반영 비율이 아니라 등급 간 실제 감점 폭을 확인합니다."],["6장의 원서를 어떻게 나눌지","상향·적정·안정 지원을 개별 대학이 아닌 하나의 조합으로 설계합니다."]].map(([title,text])=><article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

        <section className="nf-section nf-report" id="report"><div className="nf-container"><div className="nf-section-head light nf-reveal"><span className="nf-eyebrow">실제 리포트 대시보드</span><h2>추천 대학보다 중요한 것은<br />추천하는 이유입니다.</h2><p>논술핏은 대학 이름만 보여주지 않습니다.<br /><br />유리한 요소, 주의할 조건,<br />지원군 분류와 다음 행동까지 함께 제공합니다.</p></div><span className="nf-report-sample">샘플 분석 결과 · 데모 리포트</span><div className="nf-dashboard nf-reveal"><aside className="nf-dashboard-nav"><h3>학생 요약</h3><p>내신 3.4 · 인문사회</p>{["지원 가능 대학군","추천 원서 조합","대학별 상세 분석","수능 최저 분석","다음 행동"].map((item,i)=><button className={i===2?"active":""} key={item}>{item}</button>)}</aside><div className="nf-university-grid">{universities.map((item,index)=><button key={item.name} className={`nf-university ${item.tier} ${selectedUniversity===index?"selected":""}`} onClick={()=>setSelectedUniversity(index)}><span>{item.tier} · {item.badge}</span><h3>{item.name}</h3><small>{item.major}</small><dl><div><dt>논술 적합도</dt><dd>{item.fit}</dd></div><div><dt>최저 충족 가능성</dt><dd>{item.minimum}</dd></div><div><dt>학생부 영향</dt><dd>{item.record}</dd></div></dl><p><b>왜 추천하나요?</b>{item.reason}</p></button>)}</div><aside className="nf-detail" key={university.name}><span>선택 대학 상세</span><h3>{university.name}</h3><small>최근 분석 기준일 · 2026년 7월</small><div><b>추천 이유</b><p>{university.reason}</p></div><div className="warning"><b>주의 요소</b><p>{university.risk}</p></div><div><b>유리한 전형 요소</b><p>{university.advantage}</p></div><div className="priority"><b>보완 우선순위</b><p>{university.priority}</p></div></aside></div></div></section>

        <section className="nf-section nf-simulation" id="simulation"><div className="nf-container nf-sim-grid"><div className="nf-reveal"><span className="nf-eyebrow">성적 변화 시뮬레이션</span><h2>영어가 한 등급 오르면<br />지원 전략은 어떻게 달라질까요?</h2><p>목표 등급을 조정해보고,<br />지원 가능한 대학군과 원서 조합의 변화를 확인해보세요.</p><div className="nf-slider-card"><label><span>영어 등급 <b>2등급 → {english}등급</b></span><input type="range" min="1" max="5" value={english} onChange={(e)=>setEnglish(Number(e.target.value))}/></label><label><span>수학 등급 <b>4등급 → {math}등급</b></span><input type="range" min="1" max="5" value={math} onChange={(e)=>setMath(Number(e.target.value))}/></label></div></div><div className="nf-sim-results nf-reveal"><span className="nf-sample">샘플 분석 결과</span>{[["지원 가능 대학군","12개",`${12+(2-english)*3+(4-math)*2}개`],["상향 지원 후보","2개",`${2+Math.max(0,2-english)*3+Math.max(0,4-math)}개`],["수능 최저 안정 대학","6개",`${6+Math.max(0,2-english)*2+Math.max(0,4-math)*2}개`]].map(([label,before,after])=><div className="nf-result-row" key={label}><span>{label}</span><p><del>{before}</del><ArrowRight/><b className={improved?"changed":""}>{after}</b></p></div>)}<div className="nf-strategy-sentence">{improved ? "영어 1등급 확보 시 한국외대·성균관대 계열의 상향 지원 범위가 확대됩니다." : "영어 최저 변동성 때문에 일부 상향 대학의 위험도가 높습니다."}</div></div></div></section>

        <section className="nf-section nf-cases" id="cases"><div className="nf-container"><div className="nf-section-head centered nf-reveal"><span className="nf-eyebrow">Before / After 학생 사례</span><h2>같은 평균 등급이어도<br />추천 결과는 달라집니다.</h2><p>강점과 위험 요소가 다르면<br />같은 대학도 상향, 적정, 안정 분류가 달라질 수 있습니다.</p></div><div className="nf-case-tabs" role="tablist">{cases.map((item,index)=><button role="tab" aria-selected={selectedCase===index} className={selectedCase===index?"active":""} onClick={()=>setSelectedCase(index)} key={item.name}>{item.name}</button>)}</div><div className="nf-case-profile"><b>{currentCase.name} 성적 프로필</b><span>{currentCase.profile}</span></div><div className="nf-before-after nf-reveal"><article className="before"><span>Before · 분석 전</span><h3>막연한 대학 리스트</h3><p>{currentCase.before}</p><small>핵심 위험 · {currentCase.risk}</small></article><article className="after"><span>After · 논술핏 분석 후</span><h3>전략적 지원 조합</h3><dl><div><dt>상향</dt><dd>{currentCase.reach}</dd></div><div><dt>적정</dt><dd>{currentCase.target}</dd></div><div><dt>안정</dt><dd>{currentCase.safety}</dd></div></dl><small>다음 행동 · {currentCase.action}</small></article></div><div className="nf-case-changes">{currentCase.changes.map(item=><p key={item}><Check />{item}</p>)}</div><div className="nf-center-action"><button className="nf-button" onClick={login}>내 성적으로 같은 방식의 분석 받아보기</button></div></div></section>

        <section className="nf-section nf-compare" id="compare"><div className="nf-container"><div className="nf-section-head centered nf-reveal"><span className="nf-eyebrow">기존 방식 비교</span><h2>대학을 나열하는 것과<br />지원 전략을 만드는 것은 다릅니다.</h2></div><div className="nf-comparison nf-reveal"><div className="nf-comparison-head"><b>기존 방식</b><b>논술핏</b></div>{[["대학 이름과 경쟁률 중심","학생 성적과 전형 조건을 함께 분석"],["추천 대학만 제시","추천 이유와 위험 요소까지 설명"],["대학별 개별 판단","6개 지원 조합 전체를 설계"],["동일한 기준으로 추천","학생별 논술 역량과 약점 반영"],["수능 최저 충족 여부만 확인","성적 변동성과 위험 수준까지 분석"],["준비 방향이 불분명","대학별 준비 우선순위 제공"],["자료를 직접 비교","하나의 전략 리포트로 정리"]].map(([old,fit])=><div className="nf-comparison-row" key={old}><span>{old}</span><strong><Check />{fit}</strong></div>)}</div><div className="nf-compare-conclusion"><p>정보 검색은 사용자의 몫으로 남겨두지 않습니다.</p><strong>원서를 결정하는 데 필요한 판단까지 연결합니다.</strong></div></div></section>

        <section className="nf-section nf-trust" id="trust"><div className="nf-container"><div className="nf-section-head nf-reveal"><span className="nf-eyebrow">분석 방법과 신뢰 요소</span><h2>입시에서 가장 중요한 것은<br />그럴듯한 말보다 확인 가능한 근거입니다.</h2></div><div className="nf-trust-grid nf-reveal">{[["대학별 전형 데이터","수능 최저, 논술 반영 비율, 학생부 반영 방식과 출제 유형을 구조화해 분석"],["매년 바뀌는 전형 반영","공식 전형계획과 모집요강 변경 사항 기준 갱신"],["추천 근거 공개","추천 이유와 주의 요소를 리포트에 함께 제공"],["결과와 위험도의 분리","적합도, 수능 최저 위험, 준비 부담을 구분해 표시"],["판단 가능한 리포트","직접 비교하고 결정할 수 있는 정보 제공"]].map(([title,text],index)=><article key={title}><span>0{index+1}</span><h3>{title}</h3><p>{text}</p></article>)}</div><div className="nf-trust-meta"><div><small>분석 기준 연도</small><b>2027학년도</b></div><div><small>최종 업데이트</small><b>2026년 7월</b></div><div><small>분석 범위</small><b>대학별 전형 조건 · 수능 최저 · 논술 유형 · 학생부 반영 방식</b></div></div><p className="nf-disclaimer"><CircleAlert />논술핏의 분석 결과는 합격을 보장하지 않습니다. 공식 모집요강과 실제 시험 결과에 따라 달라질 수 있으며, 지원 결정을 돕는 전략 자료로 활용됩니다.</p><button className="nf-button nf-button-secondary" onClick={()=>scrollTo("trust")}>분석 기준 자세히 보기</button></div></section>

        <section className="nf-section nf-faq" id="faq"><div className="nf-container nf-faq-grid"><div className="nf-section-head nf-reveal"><span className="nf-eyebrow">FAQ</span><h2>자주 묻는 질문</h2><p>논술핏 이용 전에 궁금한 내용을 확인하세요.</p></div><div className="nf-faq-list nf-reveal">{faq.map(([question,answer])=><details key={question}><summary>{question}<ChevronDown /></summary><p>{answer}</p></details>)}</div></div></section>

        <section className="nf-final" id="final-cta" ref={finalRef}><div className="nf-container nf-reveal"><span>원서를 쓰기 전, 내 전략부터 확인하세요.</span><h2>여섯 번의 지원 기회,<br />감이 아니라 근거로 결정하세요.</h2><div className="nf-actions centered-actions"><button className="nf-button" onClick={login}>내 지원 전략 무료로 확인하기 <ArrowRight /></button><button className="nf-button nf-button-ghost" onClick={()=>scrollTo("report")}>샘플 리포트 먼저 보기</button></div><small>약 3분 소요 · 추천 근거 포함 · 샘플 리포트 제공</small><blockquote>대학을 더 많이 추천하는 서비스가 아니라,<br />더 나은 선택을 돕는 서비스를 만들었습니다.</blockquote></div></section>
      </main>

      <footer className="nf-footer"><div className="nf-container nf-footer-grid"><div><div className="nf-footer-logo"><img src={brandLogo} alt="논술핏" /></div><p>데이터 기반의 지능형 대입 논술 전략 파트너</p></div><div><h3>서비스</h3><button onClick={()=>scrollTo("report")}>분석 리포트</button><button onClick={()=>scrollTo("process")}>이용 방법</button><button onClick={()=>scrollTo("trust")}>분석 기준</button><button onClick={()=>scrollTo("report")}>샘플 리포트</button></div><div><h3>고객 지원</h3><button onClick={()=>scrollTo("faq")}>자주 묻는 질문</button><span>문의하기</span><span>공지사항</span></div><div><h3>정책</h3><span>이용약관</span><span>개인정보 처리방침</span><span>데이터 이용 안내</span></div></div><div className="nf-container nf-footer-notice">논술핏의 분석 결과는 입시 지원을 위한 참고 자료이며 합격을 보장하지 않습니다. 대학별 전형 내용은 변경될 수 있으므로 최종 지원 전 대학 입학처의 공식 모집요강을 확인해야 합니다.<small>© 2026 NonsulFit. All rights reserved.</small></div></footer>

      <div className={`nf-mobile-sticky ${stickyVisible ? "visible" : ""}`}><div><span>내 지원 가능 대학 확인하기</span><small>약 3분</small></div><button onClick={login}>무료 분석 <ArrowRight size={16}/></button></div>
    </div>
  );
}
