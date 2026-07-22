# NonsulFit Design System
## Strategic Intelligence for University Admissions

> Version 1.0  
> Product: 논술핏 (NonsulFit)  
> Design Direction: Premium Decision Intelligence SaaS  
> Primary Goal: 사용자가 10초 안에 “무엇을 입력하고, 무엇을 분석하며, 어떤 결과를 받는지” 이해하게 한다.

---

# 1. Design Vision

논술핏의 디자인은 단순한 입시 정보 사이트가 아니라,  
**학생의 입시 의사결정을 구조화하는 전략 인텔리전스 SaaS**처럼 보여야 한다.

핵심 인상은 다음 네 가지다.

- 신뢰할 수 있다.
- 정교하다.
- 차분하다.
- 실제 의사결정에 도움이 된다.

디자인은 “AI가 대단하다”를 강조하지 않는다.  
대신 다음을 명확하게 보여준다.

- 어떤 데이터를 입력하는가
- 어떤 기준으로 분석하는가
- 어떤 대학이 추천되는가
- 왜 추천되는가
- 어떤 위험이 있는가
- 무엇을 먼저 준비해야 하는가

---

# 2. Brand Positioning

## 2.1 Core Statement

> 감이 아니라 근거로 설계하는 논술 지원 전략

## 2.2 Product Category

- Decision Intelligence SaaS
- University Admissions Strategy Platform
- Data-driven Essay Admissions Portfolio Builder

## 2.3 Emotional Position

논술핏은 학생에게 불안감을 자극하지 않는다.

잘못된 방향:

- 지금 준비하지 않으면 늦습니다.
- 합격 가능성이 급격히 떨어집니다.
- 남들은 이미 시작했습니다.

권장 방향:

- 현재 위치를 객관적으로 확인하세요.
- 위험 요소와 강점을 분리해 확인하세요.
- 여섯 번의 지원 기회를 균형 있게 구성하세요.

---

# 3. Design Principles

## 3.1 Evidence First

시각적으로 큰 숫자만 보여주지 않는다.

반드시 숫자 옆에 아래 항목 중 하나 이상을 제공한다.

- 추천 이유
- 위험 요소
- 준비 우선순위
- 분석 기준
- 조건 변화 시 영향

잘못된 예:

```text
합격 확률 84%
```

권장 예:

```text
전략 점수 84
추천 이유: 영어 제시문 독해 강점
주의 요소: 수능 최저 변동성
```

---

## 3.2 Calm Precision

과도한 색, 애니메이션, 그래디언트를 사용하지 않는다.

기본 화면은 아래 비율을 유지한다.

```text
70% Neutral Surface
20% Deep Navy
8% Professional Blue
2% Semantic Colors
```

Semantic Color는 상태 표현에만 사용한다.

- Reach: Red
- Target: Amber
- Safety: Green

---

## 3.3 Product Before Marketing

예쁜 추상 일러스트보다 실제 제품 구조를 우선한다.

랜딩페이지 주요 비주얼 우선순위:

1. 실제 리포트 대시보드
2. 입력 폼
3. 지원 포트폴리오
4. 추천 이유·위험 요소
5. 분석 엔진 다이어그램
6. 추상 데이터 배경

---

## 3.4 Progressive Disclosure

처음부터 모든 정보를 보여주지 않는다.

사용자 흐름:

```text
핵심 가치
→ 입력 정보
→ 분석 구조
→ 결과 리포트
→ 세부 추천 근거
→ 시뮬레이션
→ 사례
→ CTA
```

고밀도 정보는 탭, 선택 카드, 아코디언을 통해 단계적으로 공개한다.

---

# 4. Color System

## 4.1 Core Palette

| Token | Hex | Usage |
|---|---:|---|
| `--blue` | `#2563EB` | 주요 CTA, 활성 상태, 핵심 데이터 |
| `--blue-700` | `#1D4ED8` | Hover, 강조 버튼 |
| `--blue-100` | `#DBEAFE` | 보조 배경, 아이콘 배경 |
| `--blue-50` | `#EFF6FF` | 선택 카드, 정보 배경 |
| `--navy` | `#0B1220` | Hero 대비, Dashboard, CTA |
| `--navy-2` | `#111827` | 본문 강한 텍스트 |
| `--surface` | `#F8F9FF` | 전체 페이지 기본 배경 |
| `--white` | `#FFFFFF` | 카드 및 입력 요소 |
| `--text` | `#111827` | 기본 텍스트 |
| `--muted` | `#667085` | 설명 텍스트 |
| `--line` | `#E5E7EB` | 기본 Border |
| `--line-2` | `#D9E2F1` | 강조 Border |

---

## 4.2 Semantic Palette

| State | Main | Background | Text Usage |
|---|---:|---:|---|
| Reach | `#EF4444` | `#FEF2F2` | 상향 지원, 위험도 |
| Target | `#F59E0B` | `#FFFBEB` | 적정 지원 |
| Safety | `#10B981` | `#ECFDF5` | 안정 지원 |
| Info | `#2563EB` | `#EFF6FF` | 일반 정보 |
| Warning | `#F97316` | `#FFF7ED` | 주의 요소 |

Semantic Color는 큰 배경에 사용하지 않는다.  
Badge, Icon, Border, 작은 상태 카드에 제한한다.

---

## 4.3 Dark Section Rules

Dark Section은 아래에만 사용한다.

- Analysis Report Dashboard
- Final CTA
- High-emphasis Summary
- Premium Feature Section

권장 배경:

```css
background: #0B1220;
```

Dark Section 내부 텍스트:

```text
Primary Text: #FFFFFF
Secondary Text: #CBD5E1
Muted Text: #94A3B8
Active Blue: #60A5FA
```

---

# 5. Typography

## 5.1 Font Stack

CDN 없이 사용하는 경우:

```css
font-family:
  Pretendard,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  Roboto,
  "Noto Sans KR",
  Arial,
  sans-serif;
```

외부 폰트를 사용할 수 있는 환경:

```text
Display: Hanken Grotesk
Korean Body: Pretendard
Fallback: Inter / Noto Sans KR
```

---

## 5.2 Type Scale

| Role | Desktop | Mobile | Weight | Line Height |
|---|---:|---:|---:|---:|
| Hero Display | 72–78px | 46–60px | 900 | 1.04 |
| Section Title | 48–58px | 34–42px | 900 | 1.08 |
| Card Title | 18–28px | 17–24px | 800–900 | 1.25 |
| Lead Body | 18–20px | 16–18px | 400–500 | 1.7 |
| Body | 14–16px | 14–16px | 400–500 | 1.65 |
| Label | 11–13px | 11–13px | 800–900 | 1.2 |
| Data Number | 30–64px | 28–52px | 900 | 1 |

---

## 5.3 Korean Typography Rules

모든 주요 제목에 적용:

```css
word-break: keep-all;
text-wrap: balance;
letter-spacing: -0.04em;
```

본문:

```css
word-break: keep-all;
line-height: 1.65;
```

권장 줄 길이:

```text
Hero Copy: 최대 680px
Section Copy: 최대 760px
Card Body: 250~380px
```

한 문단이 4줄 이상 길어지지 않게 한다.

---

# 6. Layout System

## 6.1 Container

```css
--max: 1240px;

.container {
  width: min(calc(100% - 40px), var(--max));
  margin: 0 auto;
}
```

Mobile:

```css
width: calc(100% - 28px);
```

---

## 6.2 Section Spacing

Desktop:

```text
Standard Section: 112px top / bottom
Compact Section: 72–84px
Hero: 92px top / 92px bottom
Final CTA: 120px top / bottom
```

Mobile:

```text
Standard Section: 76–84px
Hero: 64–72px
```

---

## 6.3 Grid

주요 2-column 섹션:

```css
grid-template-columns: 0.95fr 1.05fr;
gap: 64px ~ 72px;
```

Dashboard:

```css
grid-template-columns: 240px 1fr 310px;
```

Feature Card:

```css
grid-template-columns: repeat(4, 1fr);
```

Tablet:

```text
2 columns
```

Mobile:

```text
1 column
```

---

# 7. Surface & Elevation

## 7.1 Radius

| Token | Value | Usage |
|---|---:|---|
| Small | 14px | Input, Badge, Small Button |
| Medium | 20px | Card, Dropdown |
| Large | 28px | Major Panel |
| XL | 34–36px | Hero Mockup, Dashboard |

---

## 7.2 Shadows

```css
--shadow-1: 0 12px 30px rgba(15, 23, 42, .07);
--shadow-2: 0 24px 64px rgba(15, 23, 42, .12);
--shadow-3: 0 40px 110px rgba(15, 23, 42, .18);
```

사용 기준:

- `shadow-1`: Feature Card
- `shadow-2`: Input Preview, Table, Standard Mockup
- `shadow-3`: Hero Product Mockup, CTA, Dashboard

Hover 시 Shadow만 키우지 말고 `translateY(-3px ~ -5px)`를 함께 사용한다.

---

# 8. Landing Page Information Architecture

## 8.1 Header

구성:

```text
Logo
Input Preview
Analysis Engine
Strategy Report
Score Simulation
Cases
Primary CTA
```

규칙:

- Sticky
- Scroll 시 흰색 배경과 Shadow 활성화
- 모바일에서는 Hamburger Menu
- CTA 문구는 기능 중심

권장 CTA:

```text
3분 분석 시작
내 전략 확인하기
지원 가능 대학 확인하기
```

금지:

```text
Get Started
Learn More
Check Now
```

---

## 8.2 Hero

Hero는 10초 안에 아래 세 가지를 전달한다.

```text
무엇을 입력하는가
무엇을 분석하는가
무엇이 나오는가
```

권장 카피:

```text
논술 지원,
이제는 감이 아니라
근거입니다.
```

Supporting Copy:

```text
내신, 모의고사, 논술 유형, 대학별 전형 조건을 함께 분석해
지원 가능한 대학군과 상향·적정·안정 6개 조합을 제안합니다.
```

---

## 8.3 Hero Product Demo

3단계 구조:

```text
Step 01 Input
→ Step 02 Analysis
→ Step 03 Result
```

Input Card:

- 내신
- 모의고사
- 희망 계열
- 논술 강점

Analysis Card:

- 수능 최저 안정도
- 논술 유형 적합도
- 포트폴리오 균형

Result Card:

- 대학명
- 지원군
- 전략 점수
- 핵심 추천 이유

Hero에서 합격 확률이라는 용어를 과도하게 강조하지 않는다.

권장:

```text
전략 점수
종합 적합도
지원 안정도
```

---

# 9. Core Components

## 9.1 Primary Button

```css
background: #2563EB;
color: white;
border-radius: 16px;
min-height: 54px;
font-weight: 800;
box-shadow: 0 14px 30px rgba(37,99,235,.22);
```

Hover:

```css
transform: translateY(-2px);
background: #1D4ED8;
```

---

## 9.2 Secondary Button

```css
background: white;
border: 1px solid #E5E7EB;
color: #0B1220;
```

Secondary CTA는 Hero에서만 Primary CTA와 나란히 사용할 수 있다.

---

## 9.3 University Card

필수 요소:

```text
Tier Badge
University Name
Major
Strategy Score
```

선택 시:

```css
transform: translateY(-4px);
background: rgba(37,99,235,.20);
border-color: rgba(96,165,250,.55);
```

Tier Badge:

```text
Reach → Red
Target → Amber
Safety → Green
```

---

## 9.4 Recommendation Detail Panel

세 개의 고정 섹션을 사용한다.

```text
추천 이유
주의 요소
준비 우선순위
```

각 섹션은 서로 다른 목적을 가진다.

### 추천 이유

학생 강점과 대학 조건의 일치 설명

### 주의 요소

최저, 학생부, 경쟁률, 과목 변동성

### 준비 우선순위

사용자가 다음에 해야 하는 행동

---

## 9.5 Input Preview

입력 항목:

- 내신 평균 등급
- 모의고사 국어
- 모의고사 수학
- 모의고사 영어
- 모의고사 탐구
- 논술 강점 유형
- 희망 계열

입력 시 아래 값이 즉시 변화해야 한다.

```text
예상 지원 가능 대학 수
최저 안정도
추천 포트폴리오 범위
```

입력 카드의 목적은 실제 가입 폼이 아니라  
**사용 장벽이 낮다는 것을 보여주는 것**이다.

---

## 9.6 Simulation

Slider는 최대 두 개만 한 화면에 둔다.

권장 변수:

- 영어 등급
- 수학 등급

출력:

- 지원 가능 대학 수
- 수능 최저 안정도
- 안정 지원 대학 수

시뮬레이션은 실제 알고리즘과 연결되지 않은 경우 반드시 샘플 표시를 한다.

---

## 9.7 Before / After Case

Before:

- 대학 이름 중심
- 상향 편중
- 최저 위험 미반영
- 논술 유형 미반영

After:

- Reach / Target / Safety
- 추천 이유
- 리스크 관리
- 준비 우선순위

권장 구조:

```text
Before: 막연한 리스트
After: 전략적 포트폴리오
```

---

## 9.8 Comparison Table

비교 항목:

- 대학 선정 기준
- 추천 방식
- 수능 최저 분석
- 논술 적합도
- 최종 결과

NonsulFit 열에 Primary Blue를 사용한다.

---

# 10. Motion & Interaction

## 10.1 Interaction Philosophy

애니메이션은 “멋”보다 “이해”를 돕기 위해 사용한다.

우선순위:

1. 상태 변화
2. 데이터 변화
3. 선택 결과
4. 스크롤 등장
5. 배경 효과

---

## 10.2 Scroll Reveal

```css
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity .7s ease, transform .7s ease;
}

.reveal.show {
  opacity: 1;
  transform: none;
}
```

주의:

JavaScript가 차단되면 콘텐츠가 사라지지 않도록 한다.

권장 방식:

```html
<body>
<script>
  document.body.classList.add("js-ready");
</script>
```

```css
.reveal {
  opacity: 1;
  transform: none;
}

body.js-ready .reveal {
  opacity: 0;
  transform: translateY(28px);
}
```

---

## 10.3 Progress Bars

초기 상태:

```css
width: 0;
```

Scroll 진입 시:

```js
bar.style.width = bar.dataset.width;
```

Duration:

```text
900ms ~ 1200ms
```

---

## 10.4 Dashboard Selection

카드 클릭 시 변경 대상:

- 대학명
- 지원군
- 점수
- 추천 이유
- 주의 요소
- 준비 우선순위

전환 시간:

```text
200ms ~ 300ms
```

과한 Fade Out은 사용하지 않는다.

---

## 10.5 Canvas Fluid Background

사용 위치:

- Hero
- Final CTA

목적:

```text
Data Flow
Complex Variables
Strategic Intelligence
```

Canvas 효과는 콘텐츠 가독성을 방해하지 않아야 한다.

Hero:

```text
Opacity 0.10 ~ 0.18
```

Dark CTA:

```text
Opacity 0.25 ~ 0.40
```

모바일에서 성능이 낮으면 Canvas Animation을 정적 Gradient로 대체한다.

---

# 11. Responsive Rules

## 11.1 Mobile Priority

모바일에서 반드시 유지할 것:

- Hero 핵심 카피
- 3분 CTA
- 결과 카드
- 지원군 구분
- 추천 이유
- 위험 요소
- 시뮬레이션
- 하단 고정 CTA

모바일에서 숨겨도 되는 것:

- Dashboard Sidebar
- 긴 설명
- 중복 보조 데이터
- 장식용 선
- 과도한 Canvas Blob

---

## 11.2 Mobile Dashboard

Desktop:

```text
Student Sidebar | University Grid | Detail Panel
```

Mobile:

```text
Student Summary
University Cards
Detail Panel
```

University Card는 Mobile에서 1열 또는 2열을 사용한다.

화면 폭 560px 이하:

```text
1 column
```

---

## 11.3 Sticky Mobile CTA

```css
position: fixed;
left: 12px;
right: 12px;
bottom: calc(12px + env(safe-area-inset-bottom));
```

문구:

```text
3분 만에 내 전략 확인하기
```

CTA는 화면 콘텐츠를 지나치게 가리지 않도록 50~54px 높이를 유지한다.

---

# 12. Content Design

## 12.1 Tone

권장:

- 객관적
- 간결함
- 구체적
- 행동 중심
- 불확실성 인정

비권장:

- 지나친 확신
- 합격 보장
- 공포 자극
- AI 과장
- 근거 없는 1위 표현

---

## 12.2 Vocabulary

권장 용어:

```text
지원 가능 대학군
전략 점수
종합 적합도
수능 최저 안정도
논술 유형 적합도
주의 요소
준비 우선순위
지원 포트폴리오
상향·적정·안정
```

피해야 할 용어:

```text
합격 보장
확정 합격
정확한 합격 확률
AI가 완벽히 예측
무조건 합격
```

---

## 12.3 CTA Copy

Primary:

```text
3분 만에 내 전략 확인하기
무료 전략 분석 시작하기
지원 가능 대학 확인하기
```

Secondary:

```text
실제 리포트 먼저 보기
샘플 리포트 확인하기
분석 방식 살펴보기
```

---

# 13. Trust Design

입시 서비스는 디자인 완성도보다 신뢰 구조가 중요하다.

반드시 포함할 요소:

- 데이터 기준 연도
- 전형 정보 출처
- 업데이트 날짜
- 분석 한계
- 합격 비보장 문구
- 샘플 데이터 표시
- 개인정보 처리 안내

권장 문구:

```text
논술핏은 합격을 보장하는 서비스가 아닙니다.
입력된 성적과 전형 정보를 바탕으로 지원 의사결정을 돕는 전략 분석 서비스입니다.
```

실제 수치가 없는 경우:

```text
샘플 데이터
예시 학생
데모 리포트
```

표시를 반드시 넣는다.

---

# 14. Accessibility

필수:

- 모든 버튼에 명확한 텍스트
- Icon-only Button에 `aria-label`
- Form Label 연결
- Keyboard Focus 표시
- Color만으로 상태를 구분하지 않음
- Reach / Target / Safety 텍스트 병기
- 최소 터치 영역 44px
- 본문 Contrast 4.5:1 이상

Focus Style:

```css
outline: none;
box-shadow: 0 0 0 4px rgba(37,99,235,.15);
border-color: #2563EB;
```

---

# 15. Performance

## 15.1 Standalone HTML

CDN 없는 버전의 기준:

- 모든 CSS를 `<style>`에 포함
- 모든 JS를 `<script>`에 포함
- 시스템 폰트 사용
- 외부 Icon Font 사용 금지
- SVG 또는 텍스트 아이콘 사용
- 외부 이미지 없이도 화면 완성

---

## 15.2 Canvas Performance

- DPR 최대 2
- Blob 수 3개 이하
- `requestAnimationFrame` 사용
- Tab 비활성 시 Animation 중단
- ResizeObserver 사용
- 모바일 저성능 환경에서는 Opacity 축소

---

# 16. SEO & Metadata

필수:

```html
<title>논술핏 | 근거로 설계하는 논술 지원 전략</title>
<meta name="description" content="...">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#0B1220">
```

추가 권장:

- Open Graph
- Twitter Card
- Canonical URL
- Organization Schema
- SoftwareApplication Schema
- FAQ Schema

---

# 17. Analytics Events

랜딩페이지에서 추적할 이벤트:

```text
hero_primary_cta_click
hero_report_preview_click
input_preview_started
input_preview_completed
university_card_selected
simulation_slider_changed
case_tab_selected
final_cta_click
faq_opened
mobile_sticky_cta_click
```

핵심 전환:

```text
Analysis Start Rate
```

계산:

```text
analysis_start / landing_page_view
```

---

# 18. Production Checklist

## Visual

- [ ] Hero에서 10초 안에 결과 이해 가능
- [ ] 제품 화면이 추상 그래픽보다 큼
- [ ] 추천 이유가 숫자보다 먼저 보임
- [ ] Semantic Color가 상태 표현에만 사용됨
- [ ] 모바일에서 텍스트가 잘리지 않음

## Interaction

- [ ] 대학 카드 선택 시 내용 변경
- [ ] Slider 값 변경 시 결과 업데이트
- [ ] Mobile Menu 작동
- [ ] Sticky CTA 작동
- [ ] FAQ 작동
- [ ] JavaScript 차단 시 콘텐츠 노출

## Trust

- [ ] 데이터 기준 연도 표시
- [ ] 샘플 데이터 표시
- [ ] 합격 비보장 문구 표시
- [ ] 개인정보 안내 연결
- [ ] 실제 데이터와 데모 데이터 구분

## Technical

- [ ] CDN 의존성 없음
- [ ] Lighthouse Performance 90+
- [ ] Accessibility 90+
- [ ] CLS 최소화
- [ ] 모바일 Safari 테스트
- [ ] Android Chrome 테스트
- [ ] Desktop Chrome / Safari 테스트

---

# 19. Recommended Page Structure

```text
01. Announcement
02. Sticky Navigation
03. Hero
    - Core Value
    - 3-Step Product Demo
04. Summary Strip
05. Input Preview
06. Analysis Engine
07. Interactive Report Dashboard
08. Score Simulation
09. Before / After Case
10. Comparison Table
11. Trust & FAQ
12. Final CTA
13. Footer
14. Mobile Sticky CTA
```

---

# 20. Final Design Standard

논술핏 랜딩페이지는 아래 질문에 모두 답해야 한다.

```text
무엇을 입력하나요?
무엇을 분석하나요?
무엇을 받나요?
왜 이 대학이 추천되나요?
어떤 위험이 있나요?
무엇부터 준비해야 하나요?
왜 논술핏을 믿어야 하나요?
지금 무엇을 누르면 되나요?
```

이 중 하나라도 랜딩에서 답하지 못하면 기능을 추가하기보다  
정보 구조와 카피를 먼저 수정한다.

최종 목표는 다음과 같다.

> 사용자가 논술핏을 “AI 입시 추천 서비스”가 아니라  
> “논술 지원 의사결정을 위한 전략 인텔리전스 시스템”으로 인식하게 만드는 것.
