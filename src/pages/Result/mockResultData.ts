// 📄 src/pages/Result/mockResultData.ts

// 👑 백엔드 DB 스키마 및 EvaluationReport 컴포넌트와 100% 동기화된 마스터 인터페이스
export interface UniversityReport {
  id: string;
  tag: string; // 포트폴리오 그룹 태그 (ex: "상향 1", "하향 3")
  university: string; // 대학명
  campus: string; // 캠퍼스 명칭
  summary: {
    track: string;
    difficultyCode: "HIGHEST" | "HIGH" | "MID" | "LOW";
    difficultyLabel: string;
    selectionMethodText: string;
    essayRatio: number;
    naesinRatio: number;
    csatRequirement: string;
    examDateText?: string;
    latestCompetitionRate: number;
    suitabilityScore: number;
    myTotalScore: number;
    cutoffScore: number;
    isCsatComplied: boolean;
  };
  radarChartData: { subject: string; score: number }[];
  explanations: {
    comment: string;
    notes: string[];
    recommendationReason: string;
    // 🎯 [실무형 추가]: 보고서 컴포넌트에 뿌려줄 4대 텍스트 데이터 규격화
    selectionReason: string; // 대학교 선정이유
    essayFeedback: string; // 첨삭 총평
    entranceStrategy: string; // 대학교 입시 전략
    departmentRecommendation: string; // 학과 추천 근거
  };
  departments: {
    department: string;
    fieldGroup: string;
    latestRate: number;
    historyRates: Record<string, number>;
  }[];
}

// 🤝 백엔드가 연산해서 던져줄 리포트 규격을 그대로 구현한 마스터 가짜 데이터 맵
export const mockReportMap: Record<string, UniversityReport[]> = {
  // ==========================================
  // [1] 전체 추천 조합 (기본형 슬롯 6개)
  // ==========================================
  all: [
    {
      id: "all_1",
      tag: "상향 1",
      university: "연세대학교",
      campus: "서울",
      summary: {
        track: "일반전형",
        difficultyCode: "HIGHEST",
        difficultyLabel: "최상",
        selectionMethodText: "논술 100%",
        essayRatio: 100,
        naesinRatio: 0,
        csatRequirement: "수능최저 없음",
        examDateText: "2026년 10월 3일(토) 예정",
        latestCompetitionRate: 65.3,
        suitabilityScore: 45,
        myTotalScore: 72,
        cutoffScore: 85,
        isCsatComplied: true,
      },
      radarChartData: [
        { subject: "논술 난이도", score: 5.0 },
        { subject: "유형 복합도", score: 4.5 },
        { subject: "도표/자료해석", score: 4.0 },
        { subject: "영어 제시문", score: 5.0 },
        { subject: "수리 문항", score: 1.0 },
      ],
      explanations: {
        comment: "최고의 변별력을 요구하는 고난도 전형",
        notes: ["영어 제시문 필수", "순수 논술 실력자 대거 유입"],
        recommendationReason: "연세대는 제시문 독해 난이도가 최고 수준입니다.",
        selectionReason:
          "최상의 논술 변별력을 가진 대학으로, 수능최저 리스크 없이 오직 수민님의 순수 독해 및 문장 서술 역량 하나만으로 승부를 볼 수 있는 상향 배팅용 필수 카드입니다.",
        essayFeedback:
          "제시문의 다면적 비교 분석 능력이 대단히 우수합니다. 다만 연세대 특유의 인문학적 고난도 지문을 관통하는 핵심 개념어 정리와 논리 전개 보강이 조금 더 추가되어야 합니다.",
        entranceStrategy:
          "시험일이 10월 초로 주요 대학 중 가장 빠릅니다. 수능 준비 리듬을 깨뜨리지 않는 선에서 9월 중순부터 연대 맞춤형 파이널 3개년 기출 컴팩트 훈련을 배정하는 전략이 유효합니다.",
        departmentRecommendation:
          "과거 실질 합격선 데이터를 고려할 때, 비선호 학과로 낮추는 것보다 선호도가 뚜렷하게 분산되는 경영학과 모집 단위로 진입하여 정면 돌파하는 소신 지원을 강력 추천합니다.",
      },
      departments: [
        {
          department: "경영학과",
          fieldGroup: "business",
          latestRate: 85.2,
          historyRates: { "2026": 85.2, "2025": 92.4, "2024": 87.1 },
        },
      ],
    },
    {
      id: "all_2",
      tag: "상향 2",
      university: "한양대학교",
      campus: "서울",
      summary: {
        track: "일반전형",
        difficultyCode: "HIGH",
        difficultyLabel: "상",
        selectionMethodText: "논술 90% + 교과 10%",
        essayRatio: 90,
        naesinRatio: 10,
        csatRequirement: "수능최저 없음",
        examDateText: "2026년 11월 22일(일) 예정",
        latestCompetitionRate: 78.4,
        suitabilityScore: 58,
        myTotalScore: 76,
        cutoffScore: 82,
        isCsatComplied: true,
      },
      radarChartData: [
        { subject: "논술 난이도", score: 4.5 },
        { subject: "유형 복합도", score: 4.0 },
        { subject: "도표/자료해석", score: 4.8 },
        { subject: "영어 제시문", score: 0.0 },
        { subject: "수리 문항", score: 3.5 },
      ],
      explanations: {
        comment: "글자 수 제한이 엄격하고 압축적 서술이 필요한 전형",
        notes: ["수리논술 소문항 포함"],
        recommendationReason: "밀도 높은 키워드 채우기가 중요합니다.",
        selectionReason:
          "제한된 글자 수 안에서 압축적이고 밀도 높은 키워드를 추출해내는 수민님의 요약 능력이 한양대의 채점 기준과 완벽하게 부합하여 선정되었습니다.",
        essayFeedback:
          "상경계열 특유의 수리논술 소문항 정답 도출 능력이 매우 안정적입니다. 다만, 감점을 완전히 방어하기 위해 수식 전개 과정에서 논리적 비약이 없도록 서술을 정돈해야 합니다.",
        entranceStrategy:
          "수능최저 기준이 없는 대학이므로 실질 경쟁률이 외견상 매우 높습니다. 따라서 자잘한 감점 요소를 완벽히 차단한 100점짜리 무결점 답안 작성을 목표로 훈련해야 합니다.",
        departmentRecommendation:
          "모의고사 데이터 분석 결과, 수민님의 정량 데이터 해석 강점이 경제금융학부의 고배점 수리 논제 구조와 결합했을 때 합격 시너지가 가장 크게 발생합니다.",
      },
      departments: [
        {
          department: "경제금융학부",
          fieldGroup: "business",
          latestRate: 91.0,
          historyRates: { "2026": 91.0, "2025": 104.2, "2024": 89.5 },
        },
      ],
    },
    {
      id: "all_3",
      tag: "적정 1",
      university: "숭실대학교",
      campus: "서울",
      summary: {
        track: "일반전형",
        difficultyCode: "HIGH",
        difficultyLabel: "상",
        selectionMethodText: "논술 70% + 교과 30%",
        essayRatio: 70,
        naesinRatio: 30,
        csatRequirement: "2합 5",
        examDateText: "2026년 11월 21일(토) 예정",
        latestCompetitionRate: 48.72,
        suitabilityScore: 80,
        myTotalScore: 82,
        cutoffScore: 78,
        isCsatComplied: true,
      },
      radarChartData: [
        { subject: "논술 난이도", score: 4.2 },
        { subject: "유형 복합도", score: 3.8 },
        { subject: "도표/자료해석", score: 5.0 },
        { subject: "영어 제시문", score: 0.0 },
        { subject: "수리 문항", score: 2.5 },
      ],
      explanations: {
        comment: "제대로 준비한 학생에게 큰 기회가 되는 전형",
        notes: ["인문논술 그림해석 출제 가능"],
        recommendationReason: "내신 감점 리스크가 극도로 낮은 전형입니다.",
        selectionReason:
          "모의평가 기반 2합 5 충족 안정성이 높고, 수민님의 도표 분석 보정 점수가 5.0 만점으로 연산되어 가장 확실한 승리를 가져올 메인 적정 카드입니다.",
        essayFeedback:
          "복잡한 통계 도표와 인문 텍스트 지문을 유기적으로 엮어내는 힘이 매우 탁월합니다. 제시문 간의 대조 구조를 명확하게 짚어내어 채점자 가독성이 뛰어난 답안을 작성하고 있습니다.",
        entranceStrategy:
          "논술 반영 비율이 매우 높고 실질적인 내신 감점 폭이 제로에 가깝습니다. 수능 당일 최저 학력 기준만 흔들림 없이 통과하면 무난하게 최종 합격선에 진입할 수 있습니다.",
        departmentRecommendation:
          "숭실대 내에서 가장 많은 모집 인원을 선발하는 경영학과를 타겟팅하여, 최초합 및 예비 번호 회전율 배당까지 동시에 챙기는 안정적 궤도를 권장합니다.",
      },
      departments: [
        {
          department: "경영학과",
          fieldGroup: "business",
          latestRate: 82.07,
          historyRates: { "2026": 82.07, "2025": 105.73, "2024": 87.1 },
        },
      ],
    },
    {
      id: "all_4",
      tag: "적정 2",
      university: "국민대학교",
      campus: "서울",
      summary: {
        track: "일반전형",
        difficultyCode: "MID",
        difficultyLabel: "중",
        selectionMethodText: "논술 70% + 교과 30%",
        essayRatio: 70,
        naesinRatio: 30,
        csatRequirement: "2합 6",
        examDateText: "2026년 11월 28일(토) 예정",
        latestCompetitionRate: 35.2,
        suitabilityScore: 85,
        myTotalScore: 84,
        cutoffScore: 75,
        isCsatComplied: true,
      },
      radarChartData: [
        { subject: "논술 난이도", score: 3.5 },
        { subject: "유형 복합도", score: 3.0 },
        { subject: "도표/자료해석", score: 3.5 },
        { subject: "영어 제시문", score: 0.0 },
        { subject: "수리 문항", score: 0.0 },
      ],
      explanations: {
        comment: "기본기 위주의 출제 경향을 보이는 표준 전형",
        notes: ["교과 실질 감점폭 미비"],
        recommendationReason: "기출 패턴을 숙달하면 고득점이 가능합니다.",
        selectionReason:
          "출제 경향이 대단히 규칙적이고 표준적입니다. 단기간에 3개년 기출 답안 템플릿만 완전 숙달하면 안정적으로 고득점을 선점할 수 있어 포트폴리오의 중추로 선정했습니다.",
        essayFeedback:
          "군더더기 없는 문장 요약력이 강점입니다. 다만 질문에서 요구하는 세부 조건들을 빠짐없이 채워 넣었는지 답안 작성 직후 검토하는 습관만 보완하면 만점에 수렴할 수 있습니다.",
        entranceStrategy:
          "교과 반영 비율 30%가 명시되어 있으나 등급 간 감점 격차가 미미하여 리스크가 없습니다. 수능 최저학력 기준 또한 2합 6으로 매우 여유로운 편입니다.",
        departmentRecommendation:
          "전통적으로 논술 경쟁률 변동성이 낮고 안정적인 합격 컷 라인을 유지하는 행정학과를 적정 소신 포지션으로 배치하여 패스를 확실시합니다.",
      },
      departments: [
        {
          department: "행정학과",
          fieldGroup: "social_science",
          latestRate: 38.1,
          historyRates: { "2026": 38.1, "2025": 42.0, "2024": 35.2 },
        },
      ],
    },
    {
      id: "all_5",
      tag: "하향 1",
      university: "세종대학교",
      campus: "서울",
      summary: {
        track: "일반전형",
        difficultyCode: "MID",
        difficultyLabel: "중하",
        selectionMethodText: "논술 70% + 교과 30%",
        essayRatio: 70,
        naesinRatio: 30,
        csatRequirement: "2합 6",
        examDateText: "2026년 11월 22일(일) 예정",
        latestCompetitionRate: 32.1,
        suitabilityScore: 92,
        myTotalScore: 88,
        cutoffScore: 70,
        isCsatComplied: true,
      },
      radarChartData: [
        { subject: "논술 난이도", score: 3.0 },
        { subject: "유형 복합도", score: 2.8 },
        { subject: "도표/자료해석", score: 3.0 },
        { subject: "영어 제시문", score: 0.0 },
        { subject: "수리 문항", score: 0.0 },
      ],
      explanations: {
        comment: "핵심 요약력 위주의 안정적 전형",
        notes: ["제시문 연계성 뚜렷"],
        recommendationReason: "글자 수 템플릿만 지키면 합격 가능성이 높습니다.",
        selectionReason:
          "제시문 간의 인과관계와 연계성이 대단히 명확합니다. 수민님의 독해 속도상 오독의 여지가 전혀 없고 무조건 합격선을 뚫어낼 수 있는 강력한 하향 방어선 카드입니다.",
        essayFeedback:
          "기본 단락 요약 및 대조 기술 흐름이 완벽하게 손에 익어 있습니다. 세종대가 요구하는 정형화된 틀을 가볍게 상회하는 답안 수준을 유지하고 있어 고득점이 유력합니다.",
        entranceStrategy:
          "난이도가 평이한 편이므로 글자 수 조건 위반이나 원고지 작성 규칙 오류 같은 사소한 실수만 발생하지 않으면 무조건 합격이 보장되는 보험 슬롯으로 활용합니다.",
        departmentRecommendation:
          "인문학적 사유와 트렌디한 감각을 고루 평가하며 선호도가 탄탄한 미디어커뮤니케이션학과를 매칭하여 방어 효율성을 극대화합니다.",
      },
      departments: [
        {
          department: "미디어커뮤니케이션학과",
          fieldGroup: "humanities",
          latestRate: 41.2,
          historyRates: { "2026": 41.2, "2025": 48.5, "2024": 39.0 },
        },
      ],
    },
    {
      id: "all_6",
      tag: "하향 2",
      university: "단국대학교",
      campus: "죽전",
      summary: {
        track: "일반전형",
        difficultyCode: "LOW",
        difficultyLabel: "하",
        selectionMethodText: "논술 80% + 교과 20%",
        essayRatio: 80,
        naesinRatio: 20,
        csatRequirement: "수능최저 없음",
        examDateText: "2026년 11월 14일(토) 예정",
        latestCompetitionRate: 24.5,
        suitabilityScore: 97,
        myTotalScore: 91,
        cutoffScore: 65,
        isCsatComplied: true,
      },
      radarChartData: [
        { subject: "논술 난이도", score: 2.5 },
        { subject: "유형 복합도", score: 2.0 },
        { subject: "도표/자료해석", score: 2.5 },
        { subject: "영어 제시문", score: 0.0 },
        { subject: "수리 문항", score: 0.0 },
      ],
      explanations: {
        comment: "기본적인 단락 요약으로 승부 가능한 전형",
        notes: ["완벽한 보험용 슬롯"],
        recommendationReason: "안정적인 패스가 가능한 방어선 카드입니다.",
        selectionReason:
          "수능최저 리스크가 아예 없고 논술 문항 난이도가 매우 낮습니다. 시험 당일 어떠한 이변이나 실수가 발생하더라도 최종 컷 라인을 무조건 방어해내는 절대 안전판입니다.",
        essayFeedback:
          "논리적 결함이 전혀 없는 대중적이고 명료한 기술 스타일을 고수하고 있어 단국대 채점 기준을 여유롭게 충족합니다. 문장 간의 호흡도 간결하여 높은 가산점을 받을 수 있습니다.",
        entranceStrategy:
          "시험 시간이 배정된 문항 난이도에 비해 대단히 넉넉합니다. 답안 작성을 빠르게 마친 뒤 오탈자와 주술 호응 관계를 완벽히 재검토할 시간을 반드시 확보해야 합니다.",
        departmentRecommendation:
          "최하단 안정 방어선 구축이라는 기획 목적에 잘 부합하도록, 전통적으로 합격선 안정 추세를 보이는 국어국문학과 슬롯 배정을 추천합니다.",
      },
      departments: [
        {
          department: "국어국문학과",
          fieldGroup: "humanities",
          latestRate: 22.3,
          historyRates: { "2026": 22.3, "2025": 28.0, "2024": 24.5 },
        },
      ],
    },
  ],

  // ==========================================
  // [2] 상향 도전형 조합 (상향 4 + 적정 2)
  // ==========================================
  상향: [
    {
      id: "up_1",
      tag: "상향 1",
      university: "성균관대학교",
      campus: "인문",
      summary: {
        track: "논술우수",
        difficultyCode: "HIGHEST",
        difficultyLabel: "최상",
        selectionMethodText: "논술 100%",
        essayRatio: 100,
        naesinRatio: 0,
        csatRequirement: "3합 6",
        examDateText: "2026년 11월 21일(토) 예정",
        latestCompetitionRate: 92.1,
        suitabilityScore: 38,
        myTotalScore: 70,
        cutoffScore: 88,
        isCsatComplied: true,
      },
      radarChartData: [
        { subject: "논술 난이도", score: 4.8 },
        { subject: "유형 복합도", score: 4.7 },
        { subject: "도표/자료해석", score: 5.0 },
        { subject: "영어 제시문", score: 0.0 },
        { subject: "수리 문항", score: 0.0 },
      ],
      explanations: {
        comment: "방대한 분량의 통계 분석이 출제되는 전형",
        notes: ["분량 배분이 핵심"],
        recommendationReason: "도표 해석 역량이 뛰어나다면 추천합니다.",
        selectionReason:
          "대형 복합 도표 및 상반된 사회 현상을 계량적으로 추론하는 문항이 메인입니다. 수민님의 통계 자료 해석 만점 역량을 공격적으로 시험해볼 수 있는 최상위 카드입니다.",
        essayFeedback:
          "3개 문항 간의 유기적 연결성과 핵심 주장 도출이 대단히 세련되었습니다. 다만 최상위권 스나이핑을 확실시하기 위해 제시문 어휘를 보다 학술적 키워드로 정교화하는 작업이 필요합니다.",
        entranceStrategy:
          "3개 영역 등급 합 6이라는 높은 수능최저 장벽이 존재합니다. 최저만 충족하면 실질 경쟁률 부담이 크게 낮아지므로, 수능 성적 방어가 곧 합격의 핵심 열쇠입니다.",
        departmentRecommendation:
          "도표 및 통계 분석 역량에 전폭적인 가중치를 매기는 성균관대 간판 학과인 글로벌경영학과 슬롯을 지정하여 공격적 상향 지원을 감행합니다.",
      },
      departments: [
        {
          department: "글로벌경영학과",
          fieldGroup: "business",
          latestRate: 115.3,
          historyRates: { "2026": 115.3, "2025": 132.0, "2024": 108.4 },
        },
      ],
    },
    {
      id: "up_2",
      tag: "상향 2",
      university: "서강대학교",
      campus: "서울",
      summary: {
        track: "일반전형",
        difficultyCode: "HIGHEST",
        difficultyLabel: "최상",
        selectionMethodText: "논술 80% + 교과 20%",
        essayRatio: 80,
        naesinRatio: 20,
        csatRequirement: "3합 7",
        examDateText: "2026년 11월 22일(일) 예정",
        latestCompetitionRate: 85.4,
        suitabilityScore: 41,
        myTotalScore: 73,
        cutoffScore: 86,
        isCsatComplied: true,
      },
      radarChartData: [
        { subject: "논술 난이도", score: 4.9 },
        { subject: "유형 복합도", score: 4.8 },
        { subject: "도표/자료해석", score: 4.0 },
        { subject: "영어 제시문", score: 0.0 },
        { subject: "수리 문항", score: 0.0 },
      ],
      explanations: {
        comment: "철학적 인문학 논제가 강세인 전형",
        notes: ["제시문 추상성 높음"],
        recommendationReason: "논리 키워드 구조화가 필수적입니다.",
        selectionReason:
          "추상적이고 철학적인 고난도 텍스트 지문을 깊이 파고들어 일목요연하게 증명해내는 인문학적 논증 스타일에 올인하는 최상위 상향 카드입니다.",
        essayFeedback:
          "개념 추론 능력이 매우 심도 깊습니다. 다만 다소 호흡이 긴 지문들을 다룰 때 중간 논리 구조에서 인과관계가 흐려지지 않도록 문장 간의 연결고리를 촘촘하게 제어해야 합니다.",
        entranceStrategy:
          "3합 7이라는 수능 최저학력 기준 유지와 동시에, 서강대 특유의 다각도 다문항 통합형 논리 전개 패턴을 완벽히 내재화하는 훈련을 지속해야 합니다.",
        departmentRecommendation:
          "사유의 깊이와 정교한 논리 서술을 정성적으로 높게 평가하는 전통의 격전지인 경영학부 중심의 상향 배정을 결정했습니다.",
      },
      departments: [
        {
          department: "경영학부",
          fieldGroup: "business",
          latestRate: 94.2,
          historyRates: { "2026": 94.2, "2025": 112.5, "2024": 96.0 },
        },
      ],
    },
    {
      id: "up_3",
      tag: "상향 3",
      university: "중앙대학교",
      campus: "서울",
      summary: {
        track: "논술전형",
        difficultyCode: "HIGH",
        difficultyLabel: "상",
        selectionMethodText: "논술 70% + 교과 30%",
        essayRatio: 70,
        naesinRatio: 30,
        csatRequirement: "3합 6",
        examDateText: "2026년 11월 28일(토) 예정",
        latestCompetitionRate: 62.8,
        suitabilityScore: 52,
        myTotalScore: 75,
        cutoffScore: 81,
        isCsatComplied: true,
      },
      radarChartData: [
        { subject: "논술 난이도", score: 4.3 },
        { subject: "유형 복합도", score: 3.9 },
        { subject: "도표/자료해석", score: 3.5 },
        { subject: "영어 제시문", score: 0.0 },
        { subject: "수리 문항", score: 4.0 },
      ],
      explanations: {
        comment: "수리논술 3번 문항이 당락을 지배하는 전형",
        notes: ["수리 문항 정답 필수"],
        recommendationReason: "수리적 강점이 있는 학생에게 유리합니다.",
        selectionReason:
          "수능 모의고사 성적 추이상 3합 6 충족선이 매우 안정화 궤도에 진입함에 따라, 상경계열 배점 구조를 활용해 대역전 극을 노릴 수 있는 확실한 전략 슬롯입니다.",
        essayFeedback:
          "1, 2번 인문 파트 서술력은 이미 합격선 만점에 수렴합니다. 결국 당락은 독립 배점인 3번 수리논술 문항이므로, 확률과 통계 영역의 풀이 완결성만 보완하면 완벽합니다.",
        entranceStrategy:
          "인문 논술 파트에서 감점을 최소화한 뒤, 3번 수리 문항 정답을 도출해 내는 순간 합격 마진이 폭발합니다. 기출 상경 수리 문항을 무한 반복 연산하는 집중 스케줄을 배정합니다.",
        departmentRecommendation:
          "수민님의 정량 수리 강점과 학과 연계성이 가장 뚜렷하고 선호도가 높은 경영학부(상경) 핀포인트 배치를 결정했습니다.",
      },
      departments: [
        {
          department: "경영학부(상경)",
          fieldGroup: "business",
          latestRate: 72.4,
          historyRates: { "2026": 72.4, "2025": 85.1, "2024": 69.8 },
        },
      ],
    },
    {
      id: "up_4",
      tag: "상향 4",
      university: "경희대학교",
      campus: "서울",
      summary: {
        track: "논술우수",
        difficultyCode: "HIGH",
        difficultyLabel: "상",
        selectionMethodText: "논술 100%",
        essayRatio: 100,
        naesinRatio: 0,
        csatRequirement: "2합 5",
        examDateText: "2026년 11월 22일(일) 예정",
        latestCompetitionRate: 58.2,
        suitabilityScore: 55,
        myTotalScore: 77,
        cutoffScore: 80,
        isCsatComplied: true,
      },
      radarChartData: [
        { subject: "논술 난이도", score: 4.2 },
        { subject: "유형 복합도", score: 3.5 },
        { subject: "도표/자료해석", score: 3.0 },
        { subject: "영어 제시문", score: 0.0 },
        { subject: "수리 문항", score: 4.2 },
      ],
      explanations: {
        comment: "사회철학 제시문 융합 전형",
        notes: ["확통 개념 연계 출제"],
        recommendationReason: "인문 문장력과 수리력이 균형 잡힌 카드입니다.",
        selectionReason:
          "문학 작품과 예술, 사회철학적 텍스트가 조화롭게 융합되어 출제됩니다. 지문의 맥락적 정서와 인과관계를 입체적으로 짚어내는 수민님의 표현력을 살리기 좋아 매칭했습니다.",
        essayFeedback:
          "원고지 형식 준수 및 단락 구분 밸런스가 매우 뛰어납니다. 다만 사회계열 필수인 수리 논제 확통 연계 파트에서 정답 도출 근거를 문장과 유기적으로 바인딩하는 연출력을 보완해야 합니다.",
        entranceStrategy:
          "2합 5의 최저는 모의고사 스펙상 상시 통과권입니다. 최저 부담이 덜한 만큼, 경희대 고유의 채점 가이드 라인(제시문 핵심어 간의 일대일 매칭 법칙)에 맞춤형 서술 훈련을 진행합니다.",
        departmentRecommendation:
          "전형 무드와 결합도가 높고 합격 시 브랜딩 밸류가 대단히 강력한 호텔경영학과 중심의 소신 상향 전략을 제안합니다.",
      },
      departments: [
        {
          department: "호텔경영학과",
          fieldGroup: "social_science",
          latestRate: 58.2,
          historyRates: { "2026": 58.2, "2025": 67.0, "2024": 55.2 },
        },
      ],
    },
    {
      id: "up_5",
      tag: "적정 1",
      university: "이화여대",
      campus: "서울",
      summary: {
        track: "논술전형",
        difficultyCode: "HIGH",
        difficultyLabel: "상",
        selectionMethodText: "논술 100%",
        essayRatio: 100,
        naesinRatio: 0,
        csatRequirement: "3합 6",
        examDateText: "2026년 11월 29일(일) 예정",
        latestCompetitionRate: 38.5,
        suitabilityScore: 72,
        myTotalScore: 80,
        cutoffScore: 78,
        isCsatComplied: true,
      },
      radarChartData: [
        { subject: "논술 난이도", score: 4.0 },
        { subject: "유형 복합도", score: 4.0 },
        { subject: "도표/자료해석", score: 2.0 },
        { subject: "영어 제시문", score: 4.0 },
        { subject: "수리 문항", score: 0.0 },
      ],
      explanations: {
        comment: "영어 제시문이 포함되는 인문 특화 전형",
        notes: ["텍스트 논리 독해 집중"],
        recommendationReason: "최저 학력 기준 통과 시 유리합니다.",
        selectionReason:
          "도표나 통계 수치 해석이 배제되고 오직 텍스트 중심의 고난도 독해 위주로 출제됩니다. 수민님의 영문 지문 해독 장점과 텍스트 중심 논증 능력을 동시에 극대화할 최적의 카드입니다.",
        essayFeedback:
          "간헐적으로 출제되는 영어 제시문의 번역 정교함과 논리 대조 능력이 매우 훌륭합니다. 긴 호흡의 전체 논증 구조 안에서도 주제의 일관성을 끝까지 흐트러뜨리지 않는 필력이 강점입니다.",
        entranceStrategy:
          "3개 영역 합 6의 최저선이 높기 때문에 수능 당일 실질 경쟁률이 대폭 낮아집니다. 영어 지문 번역 오독 리스크만 원천 차단하면 합격 커트라인 패스가 대단히 유력합니다.",
        departmentRecommendation:
          "수민님의 인문 논지 변별력이 가장 정직하고 투명하게 드러나며 합격 안정 마진이 높게 산출되는 인문과학대학 모집 단위를 추천합니다.",
      },
      departments: [
        {
          department: "인문과학대학",
          fieldGroup: "humanities",
          latestRate: 38.5,
          historyRates: { "2026": 38.5, "2025": 41.5, "2024": 37.2 },
        },
      ],
    },
    {
      id: "up_6",
      tag: "적정 2",
      university: "건국대학교",
      campus: "서울",
      summary: {
        track: "KU논술우수",
        difficultyCode: "HIGH",
        difficultyLabel: "중상",
        selectionMethodText: "논술 100%",
        essayRatio: 100,
        naesinRatio: 0,
        csatRequirement: "2합 5",
        examDateText: "2026년 11월 21일(토) 예정",
        latestCompetitionRate: 52.4,
        suitabilityScore: 78,
        myTotalScore: 81,
        cutoffScore: 76,
        isCsatComplied: true,
      },
      radarChartData: [
        { subject: "논술 난이도", score: 3.8 },
        { subject: "유형 복합도", score: 3.5 },
        { subject: "도표/자료해석", score: 4.5 },
        { subject: "영어 제시문", score: 0.0 },
        { subject: "수리 문항", score: 0.0 },
      ],
      explanations: {
        comment: "도표 분석 문항 고정 출제",
        notes: ["도표 수치 해석 주의"],
        recommendationReason: "도표 분석 역량이 뛰어난 수민님에게 적격입니다.",
        selectionReason:
          "문학 작품 매핑 문항과 복합 도표 인과관계 추론 문항이 고정 출제됩니다. 수민님의 도표 보정 점수가 만점에 가까우므로, 적합도 지표를 안정적으로 가져갈 수 있는 소신 적정 카드입니다.",
        essayFeedback:
          "도표의 변화 수치와 인문 현상의 인과관계를 자석처럼 일대일 매칭해내는 능력이 뛰어납니다. 제시문의 요약 흐름도 군더더기 없이 간결하여 감점 요소가 거의 발견되지 않습니다.",
        entranceStrategy:
          "2합 5 최저는 이미 완벽 통과선입니다. 건대 특유의 1번 문학 문항과 2번 도표 문항 간의 시간 배분 밸런스 훈련만 몇 차례 반복하면 최초합 패스를 충분히 노려볼 수 있습니다.",
        departmentRecommendation:
          "수민님의 논리적 데이터 분석 강점을 충분히 투영할 수 있고 아웃풋 만족도가 대단히 우수한 미디어커뮤니케이션학과 적극 추천 전략을 고수합니다.",
      },
      departments: [
        {
          department: "미디어커뮤니케이션학과",
          fieldGroup: "social_science",
          latestRate: 52.4,
          historyRates: { "2026": 52.4, "2025": 71.2, "2024": 58.4 },
        },
      ],
    },
  ],

  // ==========================================
  // [3] 적정 소신형 조합 (상향 2 + 적정 2 + 하향 2)
  // ==========================================
  적정: [
    {
      id: "mid_1",
      tag: "상향 1",
      university: "한양대학교",
      campus: "서울",
      summary: {
        track: "일반전형",
        difficultyCode: "HIGH",
        difficultyLabel: "상",
        selectionMethodText: "논술 90% + 교과 10%",
        essayRatio: 90,
        naesinRatio: 10,
        csatRequirement: "수능최저 없음",
        examDateText: "2026년 11월 22일(일) 예정",
        latestCompetitionRate: 78.4,
        suitabilityScore: 58,
        myTotalScore: 76,
        cutoffScore: 82,
        isCsatComplied: true,
      },
      radarChartData: [
        { subject: "논술 난이도", score: 4.5 },
        { subject: "유형 복합도", score: 4.0 },
        { subject: "도표/자료해석", score: 4.8 },
        { subject: "영어 제시문", score: 0.0 },
        { subject: "수리 문항", score: 3.5 },
      ],
      explanations: {
        comment: "무최저 상향 도전형 카드",
        notes: ["글자 수 제한 엄격"],
        recommendationReason: "적정 팩 내 최고의 도전 슬롯입니다.",
        selectionReason:
          "전체 조합의 메커니즘을 동일하게 적용하여, 적정 팩 안에서 수능 리스크 없이 폭발적인 서술 스펙 하나만으로 상위 대학을 스나이핑할 수 있는 최고도 도전 슬롯으로 고정 배치했습니다.",
        essayFeedback:
          "단락별 핵심 키워드를 밀도 있게 배치하는 응집력이 매우 훌륭합니다. 상경 수리 파트의 수식 전개 과정만 조금 더 가독성 있게 정돈하면 최상위 컷 라인도 충분히 뚫어낼 수 있습니다.",
        entranceStrategy:
          "최저가 없는 전형 특성상 전국적인 논술 고수들이 대거 유입됩니다. 사소한 문장 표현의 비문 오류나 원고지 마감 실수마저 완벽하게 제어하는 정밀한 트레이닝이 핵심입니다.",
        departmentRecommendation:
          "합격선 데이터 추이가 견고하고 선호 브랜드 가치가 가장 압도적인 간판 학과인 경영학부 슬롯 매칭을 유지합니다.",
      },
      departments: [
        {
          department: "경영학부",
          fieldGroup: "business",
          latestRate: 78.4,
          historyRates: { "2026": 78.4, "2025": 99.1, "2024": 84.2 },
        },
      ],
    },
    {
      id: "mid_2",
      tag: "상향 2",
      university: "중앙대학교",
      campus: "서울",
      summary: {
        track: "논술전형",
        difficultyCode: "HIGH",
        difficultyLabel: "상",
        selectionMethodText: "논술 70% + 교과 30%",
        essayRatio: 70,
        naesinRatio: 30,
        csatRequirement: "3합 6",
        examDateText: "2026년 11월 28일(토) 예정",
        latestCompetitionRate: 62.8,
        suitabilityScore: 61,
        myTotalScore: 78,
        cutoffScore: 81,
        isCsatComplied: true,
      },
      radarChartData: [
        { subject: "논술 난이도", score: 4.3 },
        { subject: "유형 복합도", score: 3.9 },
        { subject: "도표/자료해석", score: 3.5 },
        { subject: "영어 제시문", score: 0.0 },
        { subject: "수리 문항", score: 4.0 },
      ],
      explanations: {
        comment: "소신 상향 전략 카드",
        notes: ["수리 문항 완성도가 변수"],
        recommendationReason: "최저 충족 시 합격 마진이 대폭 상승합니다.",
        selectionReason:
          "수능최저 3합 6 마진의 안정화로 인해 중앙대 지원 적합도가 이전 시뮬레이션보다 대폭 상승하였습니다. 적정 팩 내에서 가장 기대 수익률이 높은 소신 카드입니다.",
        essayFeedback:
          "인문 파트의 완성도가 매우 견고하여 감점 방어선이 확실합니다. 당락의 키를 쥐고 있는 3번 수리논술의 통계 확률 계산식 도출 템플릿만 최종 점검해 주면 완벽합니다.",
        entranceStrategy:
          "높은 수능최저 충족 여력이 수민님의 가장 큰 무기입니다. 인문 파트 서술 시간을 5분 숏컷하고, 확보한 시간을 3번 수리 문항 검산에 전폭 투자하는 시간 안배 전략이 유효합니다.",
        departmentRecommendation:
          "정량적 수리 강점 인덱스와 완벽하게 상호 결합하며 지원 적합도 마진이 가장 높게 터지는 응용통계학과 배치를 고수합니다.",
      },
      departments: [
        {
          department: "응용통계학과",
          fieldGroup: "business",
          latestRate: 62.8,
          historyRates: { "2026": 62.8, "2025": 71.0, "2024": 60.4 },
        },
      ],
    },
    {
      id: "mid_3",
      tag: "적정 1",
      university: "숭실대학교",
      campus: "서울",
      summary: {
        track: "일반전형",
        difficultyCode: "HIGH",
        difficultyLabel: "상",
        selectionMethodText: "논술 70% + 교과 30%",
        essayRatio: 70,
        naesinRatio: 30,
        csatRequirement: "2합 5",
        latestCompetitionRate: 48.72,
        suitabilityScore: 80,
        myTotalScore: 82,
        cutoffScore: 78,
        isCsatComplied: true,
      },
      radarChartData: [
        { subject: "논술 난이도", score: 4.2 },
        { subject: "유형 복합도", score: 3.8 },
        { subject: "도표/자료해석", score: 5.0 },
        { subject: "영어 제시문", score: 0.0 },
        { subject: "수리 문항", score: 2.5 },
      ],
      explanations: {
        comment: "가장 균형 잡힌 메인 적정 카드",
        notes: ["도표 해석 비중 높음"],
        recommendationReason: "내신 리스크 없이 안정적인 공략이 가능합니다.",
        selectionReason:
          "수민님의 모의논술 평점과 대학교 요구 스펙 간의 기어가 가장 정밀하게 평행선을 달리는 메인 핵심 앵커(Anchor) 적정 카드입니다.",
        essayFeedback:
          "도표 데이터 가중치 해석 능력이 5.0 만점인 장점이 그대로 드러납니다. 복잡한 다자 텍스트 간의 연계 인과관계를 정갈한 문장력으로 기술하여 높은 정성 평가 점수를 확보했습니다.",
        entranceStrategy:
          "내신 감점 걱정이 원천 차단된 구조입니다. 2합 5 최저선만 확보해 내면, 순수 논술 스펙 우위로 예비 번호 없이 최초합 다이렉트 패스를 노릴 수 있는 베스트 찬스입니다.",
        departmentRecommendation:
          "합격 안정 마진이 가장 두텁게 형성되는 부동의 메인 학과인 경영학과 슬롯 배정 구도를 확정 유지합니다.",
      },
      departments: [
        {
          department: "경영학과",
          fieldGroup: "business",
          latestRate: 48.72,
          historyRates: { "2026": 48.72, "2025": 105.73, "2024": 87.1 },
        },
      ],
    },
    {
      id: "mid_4",
      tag: "적정 2",
      university: "국민대학교",
      campus: "서울",
      summary: {
        track: "일반전형",
        difficultyCode: "MID",
        difficultyLabel: "중",
        selectionMethodText: "논술 70% + 교과 30%",
        essayRatio: 70,
        naesinRatio: 30,
        csatRequirement: "2합 6",
        latestCompetitionRate: 35.2,
        suitabilityScore: 85,
        myTotalScore: 84,
        cutoffScore: 75,
        isCsatComplied: true,
      },
      radarChartData: [
        { subject: "논술 난이도", score: 3.5 },
        { subject: "유형 복합도", score: 3.0 },
        { subject: "도표/자료해석", score: 3.5 },
        { subject: "영어 제시문", score: 0.0 },
        { subject: "수리 문항", score: 0.0 },
      ],
      explanations: {
        comment: "정형화된 논제 스타일의 표준 카드",
        notes: ["기출 완벽 숙달 요망"],
        recommendationReason: "무난하게 합격선을 확보할 수 있습니다.",
        selectionReason:
          "문제의 변형 폭이 좁고 정형화된 출제 기틀을 고수합니다. 기출 패턴을 3개년만 정밀 쉐도우 복싱하면 이변 없이 무난하게 고득점 합격선을 선점하는 서브 적정 카드입니다.",
        essayFeedback:
          "핵심 주장을 문두에 명료하게 배치하는 두괄식 기술력이 정석적입니다. 자잘한 조건 누락만 경계하면 감점 없는 무결점 스코어 라인을 가볍게 달성할 수 있습니다.",
        entranceStrategy:
          "최저 충족 난이도가 대단히 낮습니다. 논제 가이드 라인이 요구하는 단락별 분량 규격을 칼같이 맞춤 서술하는 정형 템플릿 마스터 트레이닝에 집중합니다.",
        departmentRecommendation:
          "합격선 예측 치가 여유 있게 도출되며, 아웃풋 인프라 밸런스가 조화로운 경영학부 매칭 구도를 유지합니다.",
      },
      departments: [
        {
          department: "경영학부",
          fieldGroup: "business",
          latestRate: 35.2,
          historyRates: { "2026": 35.2, "2025": 45.1, "2024": 38.0 },
        },
      ],
    },
    {
      id: "mid_5",
      tag: "하향 1",
      university: "세종대학교",
      campus: "서울",
      summary: {
        track: "일반전형",
        difficultyCode: "MID",
        difficultyLabel: "중하",
        selectionMethodText: "논술 70% + 교과 30%",
        essayRatio: 70,
        naesinRatio: 30,
        csatRequirement: "2합 6",
        latestCompetitionRate: 32.1,
        suitabilityScore: 92,
        myTotalScore: 88,
        cutoffScore: 70,
        isCsatComplied: true,
      },
      radarChartData: [
        { subject: "논술 난이도", score: 3.0 },
        { subject: "유형 복합도", score: 2.8 },
        { subject: "도표/자료해석", score: 3.0 },
        { subject: "영어 제시문", score: 0.0 },
        { subject: "수리 문항", score: 0.0 },
      ],
      explanations: {
        comment: "안정적인 방어용 슬롯",
        notes: ["독해 피로도 낮음"],
        recommendationReason: "서술 능력이 기준을 상회하므로 안정적입니다.",
        selectionReason:
          "현재 수민님의 모의논술 서술 평점이 대대학교 커트라인을 큰 폭으로 완전히 상회하고 있습니다. 리스크가 제로에 가까운 탄탄한 서울 권역 1차 방어선 슬롯입니다.",
        essayFeedback:
          "제시문의 난이도가 평이하여 독해 피로도가 현저히 낮습니다. 비교 대조 문항의 구조를 정갈하게 기술해 내고 있어, 실전에서 큰 실수만 범하지 않는다면 프리패스가 유력합니다.",
        entranceStrategy:
          "원고지 규격 준수 및 마감 글자 수 오차 스펙 제어만 평소대로 유지해 주면 됩니다. 이변이 발생할 수 없는 완벽한 최하단 보험 카드 중 하나로 활용합니다.",
        departmentRecommendation:
          "수민님의 디자인 및 미디어 융합 역량을 살리면서 하향 안정 패스를 안전하게 받아낼 수 있는 국제학부 슬롯 매칭을 적용했습니다.",
      },
      departments: [
        {
          department: "국제학부",
          fieldGroup: "humanities",
          latestRate: 32.1,
          historyRates: { "2026": 32.1, "2025": 32.4, "2024": 30.1 },
        },
      ],
    },
    {
      id: "mid_6",
      tag: "하향 2",
      university: "광운대학교",
      campus: "서울",
      summary: {
        track: "논술우수",
        difficultyCode: "MID",
        difficultyLabel: "중하",
        selectionMethodText: "논술 70% + 교과 30%",
        essayRatio: 70,
        naesinRatio: 30,
        csatRequirement: "수능최저 없음",
        examDateText: "2026년 11월 21일(토) 예정",
        latestCompetitionRate: 39.2,
        suitabilityScore: 94,
        myTotalScore: 89,
        cutoffScore: 72,
        isCsatComplied: true,
      },
      radarChartData: [
        { subject: "논술 난이도", score: 3.2 },
        { subject: "유형 복합도", score: 2.5 },
        { subject: "도표/자료해석", score: 3.0 },
        { subject: "영어 제시문", score: 0.0 },
        { subject: "수리 문항", score: 0.0 },
      ],
      explanations: {
        comment: "텍스트 인과성에 집중하는 전형",
        notes: ["명료한 서술 요구"],
        recommendationReason: "기본 방어선 카드로 결함이 없습니다.",
        selectionReason:
          "복잡한 도표나 영어, 수리 문항 리스크가 전면 배제된 순수 텍스트 중심의 직관적 전형입니다. 이변의 소지를 완전히 차단한 완벽무결한 2차 하향 안정화 안전 기지입니다.",
        essayFeedback:
          "주어진 조건 가이드에 맞춤형으로 딱딱 매칭해 서술해내는 일대일 인과 기술력이 매우 강점입니다. 문장 간 결합 밀도가 높아 채점 기준 점수를 고스란히 선점합니다.",
        entranceStrategy:
          "수능최저가 없는 전형이므로 실전 결시율이 낮게 유지됩니다. 답안을 군더더기 없이 간결하고 명료하게 기술하여 채점관의 정성 평가 가산점을 도출하는 것이 핵심 전략입니다.",
        departmentRecommendation:
          "합격선 흐름의Volatility(변동성)이 가장 낮고 탄탄한 아웃풋 효율을 보장해주는 미디어커뮤니케이션학부 슬롯 매칭을 확정했습니다.",
      },
      departments: [
        {
          department: "미디어커뮤니케이션학부",
          fieldGroup: "social_science",
          latestRate: 39.2,
          historyRates: { "2026": 39.2, "2025": 49.1, "2024": 40.2 },
        },
      ],
    },
  ],

  // ========================================================
  // 🎯 [완벽 고정] [4] 하향 안정형 조합 (하향 3 + 적정 2 + 상향 1)
  // ========================================================
  하향: [
    {
      id: "down_1",
      tag: "상향 1",
      university: "중앙대학교",
      campus: "서울",
      summary: {
        track: "논술전형",
        difficultyCode: "HIGH",
        difficultyLabel: "상",
        selectionMethodText: "논술 70% + 교과 30%",
        essayRatio: 70,
        naesinRatio: 30,
        csatRequirement: "3합 6",
        examDateText: "2026년 11월 28일(토) 예정",
        latestCompetitionRate: 62.8,
        suitabilityScore: 61,
        myTotalScore: 78,
        cutoffScore: 81,
        isCsatComplied: true,
      },
      radarChartData: [
        { subject: "논술 난이도", score: 4.3 },
        { subject: "유형 복합도", score: 3.9 },
        { subject: "도표/자료해석", score: 3.5 },
        { subject: "영어 제시문", score: 0.0 },
        { subject: "수리 문항", score: 4.0 },
      ],
      explanations: {
        comment: "하향 팩 중 유일한 스나이핑 카드",
        notes: ["최저 통과가 관건"],
        recommendationReason:
          "안정 카드가 많으므로 밸류 높은 상향 1장을 배정했습니다.",
        selectionReason:
          "수민님이 주문하신 하향 3팩 패키지의 전략적 균형을 위해, 하단에 5개의 절대 방어 기지를 구축해 둔 담보력을 기반으로, 1장만큼은 로또성 역전극을 노릴 수 있는 상위권 중앙대를 스나이핑 카드로 과감히 꽂아 넣었습니다.",
        essayFeedback:
          "인문 논리 구성은 이미 합격 완성 궤도입니다. 상경계 당락을 가르는 3번 수리 문항의 정밀도를 파이널 시기에 한 단계만 더 클리닉해 주면 소신 대역전극이 충분히 현실화됩니다.",
        entranceStrategy:
          "3합 6 최저 통과선이 확보되는 순간 지원 적합도 마진이 급등합니다. 수능 직후 중앙대 상경 전용 수리 공식 및 서술 매커니즘 템플릿 학습에 모든 화력을 핀포인트 집중합니다.",
        departmentRecommendation:
          "수민님의 정량 데이터 연산 강점 밸류와 완벽히 맞아떨어지는 전통의 간판 모집 단위인 경영학부 배치를 최종 확정합니다.",
      },
      departments: [
        {
          department: "경영학부",
          fieldGroup: "business",
          latestRate: 62.8,
          historyRates: { "2026": 62.8, "2025": 85.1, "2024": 69.8 },
        },
      ],
    },
    {
      id: "down_2",
      tag: "적정 1",
      university: "숭실대학교",
      campus: "서울",
      summary: {
        track: "일반전형",
        difficultyCode: "HIGH",
        difficultyLabel: "상",
        selectionMethodText: "논술 70% + 교과 30%",
        essayRatio: 70,
        naesinRatio: 30,
        csatRequirement: "2합 5",
        examDateText: "2026년 11월 21일(토) 예정",
        latestCompetitionRate: 48.72,
        suitabilityScore: 80,
        myTotalScore: 82,
        cutoffScore: 78,
        isCsatComplied: true,
      },
      radarChartData: [
        { subject: "논술 난이도", score: 4.2 },
        { subject: "유형 복합도", score: 3.8 },
        { subject: "도표/자료해석", score: 5.0 },
        { subject: "영어 제시문", score: 0.0 },
        { subject: "수리 문항", score: 2.5 },
      ],
      explanations: {
        comment: "가장 든든한 중심축 적정 카드",
        notes: ["도표 가중치 최적화"],
        recommendationReason:
          "논술 반영 비율이 매우 높아 정교한 답안이 무기입니다.",
        selectionReason:
          "하향 팩 전체 라인업 중 중추적인 기둥 역할을 담당하는 핵심 카드입니다. 수민님의 도표 데이터 분석 만점 보정 인덱스가 완벽히 구현되어 안정적인 고득점 합격을 보장합니다.",
        essayFeedback:
          "수치 데이터 간의 인과관계를 일목요연하게 텍스트로 요약 및 융합해내는 구조력이 매우 수려합니다. 군더더기 없는 논증 리듬으로 정성 채점관 점수를 온전히 획득하고 있습니다.",
        entranceStrategy:
          "논술 반영 비율이 막강하여 내신 교과에 의한 불이익 리스크가 완전 차단되어 있습니다. 평소의 높은 수능최저 충족률만 발휘되면 예비 번호 없는 최초합 패스가 유력합니다.",
        departmentRecommendation:
          "가장 많은 인원수 쿼터를 보유하여 최초합 마진이 가장 넓고 예비 회전 가속도까지 가장 우수한 경영학과 슬롯 배정을 유지합니다.",
      },
      departments: [
        {
          department: "경영학과",
          fieldGroup: "business",
          latestRate: 48.72,
          historyRates: { "2026": 48.72, "2025": 105.73, "2024": 87.1 },
        },
      ],
    },
    {
      id: "down_3",
      tag: "적정 2",
      university: "국민대학교",
      campus: "서울",
      summary: {
        track: "일반전형",
        difficultyCode: "MID",
        difficultyLabel: "중",
        selectionMethodText: "논술 70% + 교과 30%",
        essayRatio: 70,
        naesinRatio: 30,
        csatRequirement: "2합 6",
        examDateText: "2026년 11월 28일(토) 예정",
        latestCompetitionRate: 35.2,
        suitabilityScore: 85,
        myTotalScore: 84,
        cutoffScore: 75,
        isCsatComplied: true,
      },
      radarChartData: [
        { subject: "논술 난이도", score: 3.5 },
        { subject: "유형 복합도", score: 3.0 },
        { subject: "도표/자료해석", score: 3.5 },
        { subject: "영어 제시문", score: 0.0 },
        { subject: "수리 문항", score: 0.0 },
      ],
      explanations: {
        comment: "표준 정형화 논제 전형",
        notes: ["감점 요소가 적은 서술 필요"],
        recommendationReason: "예상 커트라인을 여유 있게 상회합니다.",
        selectionReason:
          "논제 변형이 극도로 좁은 정형화된 출제 가이드를 일관되게 고수하는 대학입니다. 단기 기출 트레이닝 매칭율이 아주 높아 이변 없이 고득점 안착이 가능한 안정 카드입니다.",
        essayFeedback:
          "핵심 요약 키워드를 전면에 배치하는 두괄식 레이아웃 구성이 대단히 명료합니다. 세부 지시 조건들을 문장 내에 꼼꼼히 채워 넣는 정교함만 더해주면 합격을 확실시할 수 있습니다.",
        entranceStrategy:
          "2합 6 최저 난이도가 낮고 교과 감점폭이 무의미합니다. 국민대 특유의 답안 작성 정형 포맷에 수민님의 정갈한 문장 기술 스펙을 엮어내는 단기 마스터 패키지를 수행합니다.",
        departmentRecommendation:
          "합격선 흐름의 변동 마진이 안정적이고 커리어 만족도가 훌륭한 주력 모집 단위인 경영학부 매칭을 적용했습니다.",
      },
      departments: [
        {
          department: "경영학부",
          fieldGroup: "business",
          latestRate: 35.2,
          historyRates: { "2026": 35.2, "2025": 45.1, "2024": 38.0 },
        },
      ],
    },
    {
      id: "down_4",
      tag: "하향 1",
      university: "세종대학교",
      campus: "서울",
      summary: {
        track: "일반전형",
        difficultyCode: "MID",
        difficultyLabel: "중하",
        selectionMethodText: "논술 70% + 교과 30%",
        essayRatio: 70,
        naesinRatio: 30,
        csatRequirement: "2합 6",
        examDateText: "2026년 11월 22일(일) 예정",
        latestCompetitionRate: 32.1,
        suitabilityScore: 92,
        myTotalScore: 88,
        cutoffScore: 70,
        isCsatComplied: true,
      },
      radarChartData: [
        { subject: "논술 난이도", score: 3.0 },
        { subject: "유형 복합도", score: 2.8 },
        { subject: "도표/자료해석", score: 3.0 },
        { subject: "영어 제시문", score: 0.0 },
        { subject: "수리 문항", score: 0.0 },
      ],
      explanations: {
        comment: "서술 능력이 합격선을 크게 상회하는 카드",
        notes: ["안정선 방어선"],
        recommendationReason: "큰 실수만 없으면 무난한 패스가 예상됩니다.",
        selectionReason:
          "수민님의 현재 모의논술 텍스트 분석 및 단락 요약 스펙이 대학교 합격 가이드 라인을 압도적으로 추월해 있습니다. 하향 안전판으로서 결함이 전혀 없는 강력한 서울권 보루입니다.",
        essayFeedback:
          "지문의 가독성이 평이하여 오독 리스크가 낮습니다. 정형화된 비교 대조 논제를 물 흐르듯 명확하게 서술해내고 있어, 실전에서 만점 수준에 가까운 점수를 선점할 수 있습니다.",
        entranceStrategy:
          "글자 수 상하한 규칙 엄수 및 원고지 작성 오차 방지 등 기본 기본기 페이스만 차분하게 유지해 주면 됩니다. 절대적인 심리적 안정을 도출할 보험 카드로 정착시킵니다.",
        departmentRecommendation:
          "하향 안정 패스의 목적 달성과 더불어 트렌디한 글로벌 인프라 만족도까지 동시에 거머쥘 수 있는 국제학부 슬롯 매칭을 확정했습니다.",
      },
      departments: [
        {
          department: "국제학부",
          fieldGroup: "humanities",
          latestRate: 32.1,
          historyRates: { "2026": 32.1, "2025": 32.4, "2024": 30.1 },
        },
      ],
    },
    {
      id: "down_5",
      tag: "하향 2",
      university: "단국대학교",
      campus: "죽전",
      summary: {
        track: "일반전형",
        difficultyCode: "LOW",
        difficultyLabel: "하",
        selectionMethodText: "논술 80% + 교과 20%",
        essayRatio: 80,
        naesinRatio: 20,
        csatRequirement: "수능최저 없음",
        examDateText: "2026년 11월 14일(토) 예정",
        latestCompetitionRate: 24.5,
        suitabilityScore: 97,
        myTotalScore: 91,
        cutoffScore: 65,
        isCsatComplied: true,
      },
      radarChartData: [
        { subject: "논술 난이도", score: 2.5 },
        { subject: "유형 복합도", score: 2.0 },
        { subject: "도표/자료해석", score: 2.5 },
        { subject: "영어 제시문", score: 0.0 },
        { subject: "수리 문항", score: 0.0 },
      ],
      explanations: {
        comment: "최저 부담 없는 절대 방어 슬롯",
        notes: ["시간 배분 넉넉함"],
        recommendationReason: "변수가 거의 없는 확실한 보험 카드입니다.",
        selectionReason:
          "수능최저학력 리스크가 낮고 문항의 난이도 스펙이 매우 직관적입니다. 실전 당일 컨디션 변수가 발생하더라도 최종 패스 컷 라인을 확실하게 묶어낼 수 있는 견고한 후방 기지입니다.",
        essayFeedback:
          "지문의 핵심을 정직하고 명료한 어조로 가공해내는 밸런스가 매우 탁월합니다. 불필요한 사족 없이 요구 조건만을 정확히 관통하는 문장 호흡력이 단국대 채점 기준을 상회합니다.",
        entranceStrategy:
          "시험 종료 20분 전 답안 전반의 기술적 오탈자와 주어-서술어 관계 호응을 차분하게 재검토할 템포를 확보할 수 있습니다. 완벽히 굳히기에 들어가는 슬롯으로 매핑합니다.",
        departmentRecommendation:
          "안정 마진 확보 및 원서 조합의 리스크 분산 목적을 가장 정직하게 달성해 줄 수 있는 핵심 학과인 국어국문학과 배치를 확정 유지합니다.",
      },
      departments: [
        {
          department: "국어국문학과",
          fieldGroup: "humanities",
          latestRate: 24.5,
          historyRates: { "2026": 24.5, "2025": 28.0, "2024": 24.5 },
        },
      ],
    },
    {
      id: "down_6",
      tag: "하향 3",
      university: "가천대학교",
      campus: "글로벌",
      summary: {
        track: "논술전형",
        difficultyCode: "LOW",
        difficultyLabel: "하",
        selectionMethodText: "논술 80% + 교과 20%",
        essayRatio: 80,
        naesinRatio: 20,
        csatRequirement: "1개 3등급",
        examDateText: "2026년 11월 15일(일) 예정",
        latestCompetitionRate: 42.1,
        suitabilityScore: 99,
        myTotalScore: 95,
        cutoffScore: 60,
        isCsatComplied: true,
      },
      radarChartData: [
        { subject: "논술 난이도", score: 1.5 },
        { subject: "유형 복합도", score: 1.2 },
        { subject: "도표/자료해석", score: 2.0 },
        { subject: "영어 제시문", score: 0.0 },
        { subject: "수리 문항", score: 0.0 },
      ],
      explanations: {
        comment: "단답 약술형 전형",
        notes: ["시간 부족 리스크 제로"],
        recommendationReason: "높은 적합도 지표를 보이는 절대 방어기지 카드입니다.",
        selectionReason:
          "EBS 교재 연계도가 높은 약술형 국어/수학 단답형 문항입니다. 수민님의 뛰어난 수능형 단답 요약 역량상 매우 안정적인 절대 안전 기지 카드입니다.",
        essayFeedback:
          "장황한 장문 서술이 배제된 문항 구조상, 핵심 단답 정답 매칭 지표가 만점권에 도달했습니다. 출제 의도와 일치하는 명확한 공식 노출력이 압도적인 수준을 형성하고 있습니다.",
        entranceStrategy:
          "1개 3등급 최저는 이미 상시 충족 상태입니다. 시험 직전 EBS 수능특강/수능완성 수민님 전용 교재의 인문/사회 지문 오답노트 주제어들만 가볍게 아이트래킹 해주는 수준으로 마무리 정돈합니다.",
        departmentRecommendation:
          "약술형 포맷의 규칙성이 가장 정교하게 작동하며 합격 스코어가 확실하게 마크되는 상징 학과인 경영학부 완전 하향 안전 배치를 확정합니다.",
      },
      departments: [
        {
          department: "경영학부",
          fieldGroup: "business",
          latestRate: 42.1,
          historyRates: { "2026": 42.1, "2025": 51.4, "2024": 42.1 },
        },
      ],
    },
  ],
};
