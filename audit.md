# 추천 대학 카드 6개 동시 노출 — 사전 Audit

- 감사 범위: 결과 페이지(`/result/:reportId`)에서 추천 대학 카드가 API 응답부터 화면 렌더링까지 거치는 데이터/컴포넌트 경로 전수 조사
- 목적: 데스크톱에서 최종 추천 카드 6개를 한 화면에 동시 노출하기 위한 사전 근거 확보
- 제약: **이번 작업에서 코드/스타일/테스트/설정 파일은 수정하지 않음.** 저장소에서 변경된 파일은 본 문서(`audit.md`) 하나뿐.
- 근거 확보 방법: 관련 소스 파일 전수 Read, `grep`/`find`로 carousel·swiper·pagination·slice 등 키워드 전수 검색, 관련 자동화 테스트 79개 실행(전부 통과) — 아래 각 절에 `파일:라인` 형태로 근거 명시.

---

## 1. 카드 렌더링 데이터 흐름

```
GET /reports/:reportId
  → src/api/reports.ts:fetchReportDetail()
  → src/adapters/reportV2Mapper.ts:reportV2Mapper()
      - extractReportV2Body(): response.generatedReportV2 우선 추출
      - normalizePortfolioStrategy(): portfolioStrategy.safety/match/reach.programIds 정규화
      - createPortfolioDisplayLookup(): programId → displayBucket(stable/target/reach) 매핑 테이블 생성
      - normalizeRecommendedPrograms(): 각 program에 displayBucket(원본 필드 > portfolio lookup > metadata > "target" 순 fallback), category(원본 문자열 그대로, 없으면 "MODERATE") 부여
  → ReportMappingResult { status, data: ReportPayloadV2, errors }
  → src/hooks/useNonsulResult.ts:useNonsulResult(reportId) → { result, isLoading, networkError }
  → src/pages/Result/Result.tsx (결과 페이지 최상위 컴포넌트, router: src/router/resultRoutes.ts "/result/:reportId")
      - generatedReportV2 = result.data
      - autoFilter = getFirstNonEmptyBucket(...) → 최초 진입 시 자동 선택되는 "단일" 버킷
      - filter = manualFilter ?? autoFilter   // FilterType: "적정" | "상향" | "하향" (단일 선택)
      - recommendedPrograms = selectDisplayProgramsByBucket(
          generatedReportV2.recommendedPrograms,
          generatedReportV2.portfolioStrategy,
          displayBucketByFilter[filter]   // stable | target | reach 중 "하나"
        )
      ⚠ 이 시점에서 전체 6개 중 활성 버킷에 속한 항목만 남고 나머지는 배열에서 제거됨
  → src/components/molecules/result/ResultHeader.tsx (필터 버튼 UI: 적정/상향/하향, "전체" 옵션 없음)
  → src/components/molecules/result/UnivTabs.tsx (카드 목록 Wrapper 겸 개별 카드, list={recommendedPrograms})
      - grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4, 카드 h-28 고정
      - 카드 내부 표시 필드: TagChip(category), sectionFallback 배지, universityName, campus/departmentName 뿐
  → 카드 클릭 시 activeIdx 갱신 → currentProgram = recommendedPrograms[activeIdx]
  → 상세 패널(모달/아코디언 아님, 페이지 내 고정 섹션):
      - src/components/organisms/result/UnivDetailSummary.tsx  (campus, tag, comment, examDateText, csatRequirement, essayRatio/schoolRecordRatio 도넛)
      - src/components/organisms/result/EvaluationReport.tsx   (rationale, keyInsight, strategyNotes, departmentName, cautionNote, finalScore, csatRequirement O/X, 경쟁률, 적합도)
      - src/components/organisms/result/UnivCompetencyComparison.tsx (studentCompetency 레이더차트 + 시험일정 캘린더, currentUniversityList로 전체 목록 순회하나 "표시"는 캘린더 점 배지 뿐)
```

**핵심 구조 특성**: `UnivTabs`가 유일하게 "6개를 나열할 수 있는" 그리드 컴포넌트이지만, 그 앞단(`Result.tsx`)에서 이미 단일 버킷으로 필터링된 배열만 전달받는다. 나머지 컴포넌트(`UnivDetailSummary`, `EvaluationReport`, `UnivCompetencyComparison`)는 카드가 아니라 **`activeIdx` 1개에 대한 상세 패널**이며 Modal/Accordion 형태는 존재하지 않는다(리포트 구조상 지속 노출되는 섹션).

---

## 2. 카드 데이터 소스 추적표

| 필드 | 발생 위치 | 실제 사용 여부 | 비고 |
|---|---|---|---|
| `recommendedPrograms` | API → `reportV2Mapper.ts:86-90` | 사용됨, **슬라이스/페이지네이션 없음** | `reportFlow.contract.test.ts:90-103`가 `.slice(0, limit)` 부재를 회귀 테스트로 고정 |
| `generatedReportV2.recommendedPrograms` | `Result.tsx:49,60,72-79,100-101` | 사용됨(전체 배열 보관) | 화면에는 이 전체 배열이 아니라 `selectDisplayProgramsByBucket()` 결과만 전달됨 |
| `portfolioStrategy` | `reportV2Mapper.ts:80-90`, `useNonsulResult.ts:41-49` | 사용됨 | `programIds`가 있으면 이를 우선 사용해 표시 대상을 결정, 없으면 `displayBucket` 필드로 폴백 |
| `displayBucket` | `RecommendedProgramItem.displayBucket` | **화면 배치(필터/탭) 기준으로 사용됨** — 계약 원칙 준수 | `UnivTabs`가 아니라 `Result.tsx`의 `selectDisplayProgramsByBucket`이 배치 필터링 담당 |
| `category` | `TagChip.tsx:7-23` | **카드 라벨(하향/적정/상향)로 표시됨** | ⚠ 아래 "계약 리스크" 참고 |
| `portfolioGroup` | 코드베이스 전체 검색 결과 **존재하지 않음** | 미사용 | `PortfolioBucketName`("safety"/"match"/"reach")이 유사 역할을 수행하며 `portfolioGroup`이라는 필드/타입명 자체가 없음 |
| `rank` | 코드베이스 전체 검색 결과 **존재하지 않음** | 미사용 | 순위 표시 UI 없음. 배열 순서(API가 내려준 순서)를 그대로 렌더링 순서로 사용(`UnivTabs.tsx:18` `list.map`) |
| `finalScore` | `RecommendedProgramItem.finalScore` | `EvaluationReport.tsx:51,70` "나의 총점"/"적합도 지표"에 노출 | 카드(`UnivTabs`)에는 노출되지 않음 — 상세 패널 전용 |

### 계약 원칙 준수 여부

- **슬라이스/필터로 임의 제거하는가**: `Result.tsx`는 slice를 쓰지 않는다. 대신 `selectDisplayProgramsByBucket()`으로 "현재 선택된 버킷 1개"만 남기는 **필터링**을 한다(`hooks/useNonsulResult.ts:23-49`). 결과적으로 6개 미만만 화면에 남는 것은 슬라이스가 아니라 **단일 버킷 선택 UX 설계** 때문이다.
- **안정/적정/상향별 별도 배열을 만드는가**: 만들지 않는다. `selectDisplayProgramsByBucket()`은 매번 활성 필터 하나에 대해서만 계산되고, 세 버킷을 동시에 배열로 들고 있는 상태(state)는 `Result.tsx`에 없다(`otherNonEmptyFilters`는 "다른 탭에 결과가 있다"는 boolean성 정보만 계산, `Result.tsx:82-96`).
- **동일 카드 중복 삽입 가능성**: `createPortfolioDisplayLookup()`(`reportV2Mapper.ts:271-285`)이 `programId`별로 첫 번째 매칭 버킷만 채택(`if (!lookup.has(programId))`)하므로 매퍼 단계에서 한 프로그램이 두 버킷에 동시 속하는 것은 방지된다. 프론트 렌더링 단계에서 별도의 중복 방지 로직(예: `Set` 기반 dedupe)은 없으나, 데이터 소스 자체가 유일 `programId` 배열이라 렌더 단계 중복 이슈는 현재 관측되지 않음.
- **6개 미만이 되는 조건**: (a) API가 6개 미만을 내려주는 경우, (b) 활성 필터 버킷에 6개 중 일부만 속하는 경우(가장 흔한 경로), (c) `reportV2Mapper.normalizeRecommendedPrograms()`가 `programId`/`universityName`/`departmentName` 중 하나라도 없는 항목을 **스킵**하는 경우(`reportV2Mapper.ts:186-192`, `errors.push` 후 `return []`) — partial 상태로 일부 카드가 누락될 수 있음(`reportV2Mapper.test.ts:146-153` `reportV2Mapper_skips_invalid_program_returns_partial_status`로 검증됨).
- **category와 displayBucket 혼동 여부**: 매퍼 레벨에서는 혼동하지 않는다. `normalizeRecommendedPrograms()`는 `category`를 `displayBucket` 결정에 절대 사용하지 않으며(`reportV2Mapper.ts:200-205`), 이는 `reportV2Mapper.test.ts:155-190`(`reportV2Mapper_never_uses_category_as_primary_display_bucket`)와 `reportFlow.contract.test.ts:52-88`(`regression_category_change_does_not_move_card_position`)로 회귀 고정되어 있다.
  - ⚠ 다만 **표시(UI) 레벨에서 의미론적 충돌 리스크**가 있다: `TagChip.tsx:11-22`는 `category`(`SAFE`/`MODERATE`/`RISKY`)를 각각 `하향`/`적정`/`상향`이라는, `displayBucket`(`stable`/`target`/`reach`)의 한글 라벨(`Result.tsx:33-37` `filterByDisplayBucket`)과 **완전히 동일한 문자열**로 표시한다. 포트폴리오 밸런싱 로직상 `category=RISKY`인 프로그램이 `displayBucket=stable`(하향 탭)에 배치되는 것은 계약상 정상 케이스인데, 이 경우 카드에는 "상향" 칩이 찍힌 채 "하향" 탭 안에 놓이게 되어 **사용자에게는 카드 라벨과 탭 위치가 모순되어 보인다.** 데이터 계약은 지켜지고 있으나 표현 계층에서 두 개념이 같은 한글 단어를 재사용해 혼동을 유발하는 구조적 리스크로 분류함(원인 분류표의 OTHER 참고).

---

## 3. Breakpoint별 레이아웃 표

기준 파일: `src/pages/Result/Result.tsx:117`(루트 컨테이너), `src/components/molecules/result/UnivTabs.tsx:17`(카드 그리드)

| Viewport | 루트 컨테이너 폭 | UnivTabs grid-cols | 카드 높이 | 실제 도달 카드 수(전형적 3분할 시) | 비고 |
|---|---|---|---|---|---|
| 1440px | `max-w-7xl` = **1280px 고정**(뷰포트보다 좁음) | `lg:grid-cols-6`(6열) | `h-28`(112px, 고정) | 활성 필터 1개 버킷 분량만(예: 6개 중 1~3개) | 그리드 자체는 6열을 지원하지만 데이터가 6개 안 옴 |
| 1280px | `max-w-7xl` = 1280px(뷰포트와 거의 일치) | `lg:grid-cols-6` | `h-28` | 동일 | `xl` 브레이크포인트 전용 스타일 없음 — 1280과 1440이 레이아웃상 동일하게 동작 |
| 1024px | `max-w-7xl`(내용폭은 1024px로 제한) | `lg:grid-cols-6`(1024px부터 `lg` 적용) | `h-28` | 동일 | 6열 그리드 진입 임계점 |
| 768px | 컨테이너 폭 = 768px | `sm:grid-cols-3`(640px 이상, `lg` 미도달) | `h-28` | 동일(3열로 줄바꿈) | |
| 390px | 컨테이너 폭 = 390px | 기본 `grid-cols-2` | `h-28` | 동일(2열) | |

- **grid vs flex**: `UnivTabs`는 CSS Grid(`grid grid-cols-*`) 사용, flex 아님. `Result.tsx` 루트는 `space-y-8`(수직 스택), 카드 그리드가 아님.
- **최소/최대 카드 너비**: 명시적 `min-width`/`max-width` 없음 — grid-cols 등분에 의해 암묵적으로 결정. `sm:grid-cols-3` 구간(640~1023px)에서 카드 3등분, 각 카드 폭이 좁아지면 `h-28` 고정 높이 대비 텍스트(`universityName`, `campus/departmentName`)가 잘릴 가능성 있음(overflow 처리는 `overflow-hidden`만 클래스에 존재, `UnivTabs.tsx:27`).
- **horizontal scroll / carousel / swiper / pagination / "더 보기"**: 저장소 전체 grep(`swiper|carousel|Swiper|Carousel`, `overflow-x`, `pagination`) 결과 **전무**. 즉 카드 노출을 막는 원인은 스크롤/캐러셀/페이지네이션 구조가 아니다.
- **안정/적정/상향 섹션별 독립 Row 여부**: 독립 Row 아님 — 셋 중 **하나만** 선택되어 하나의 Row(`UnivTabs`)로 렌더링됨. 세 섹션이 동시에 별도 Row로 존재하지 않는다.
- **DOM에는 있지만 viewport 밖인지 / 조건부 렌더링으로 일부만 표시되는지**: 후자다. 나머지 5개(6개 기준)는 viewport 밖이 아니라 **애초에 DOM에 렌더링되지 않는다**(`recommendedPrograms` 배열 자체가 필터링되어 `UnivTabs`에 전달되기 전에 축소됨, `Result.tsx:72-80`). CSS/viewport 문제가 아니라 React 상태/데이터 문제.

---

## 4. 원인 분류표 — "6개 동시 표시"를 막는 원인

| 유형 | 파일:위치 | 컴포넌트/함수 | 현재 동작 | 6개 동시 노출을 막는 이유 | 수정 필요 | 예상 영향도 |
|---|---|---|---|---|---|---|
| **CONDITIONAL_RENDER** (1순위, 가장 직접적) | `src/pages/Result/Result.tsx:72-80` | `recommendedPrograms` useMemo | `selectDisplayProgramsByBucket(all, portfolio, displayBucketByFilter[filter])` 로 단일 버킷만 계산 | `UnivTabs`에 애초에 1개 버킷 분량만 전달됨 | **필요** | 높음 — 이 지점을 고치지 않으면 다른 모든 수정이 무의미 |
| **SECTION_SPLIT** (2순위) | `src/components/molecules/result/ResultHeader.tsx:14-31` | `filterButtons` (적정/상향/하향, 단일 선택) | 사용자가 세 버킷 중 하나만 배타적으로 선택 가능, "전체" 옵션 없음 | UI 자체가 3버킷 동시 조회를 허용하지 않음 | **필요** | 높음 — Result.tsx의 필터 로직과 쌍으로 수정돼야 함 |
| **DATA_LIMIT** (파생적, 조건부) | `src/adapters/reportV2Mapper.ts:186-192` | `normalizeRecommendedPrograms` | `programId`/`universityName`/`departmentName` 누락 시 해당 항목 스킵, `partial` 상태 반환 | 백엔드 응답 불완전 시 6개 미만이 될 수 있음(현재 UI 필터 문제와는 별개 원인) | 필요 없음(방어 로직으로 적절) | 낮음 — 정상 API 응답이면 발생 안 함 |
| **CONTAINER_WIDTH** | `src/pages/Result/Result.tsx:117` | 루트 `div.max-w-7xl` | 1440px 뷰포트에서도 콘텐츠 폭이 1280px로 고정 | 6열 그리드가 활성화돼도 카드 1개당 가용 폭이 좁아짐(3열×2행 등으로 재설계 시 여유 폭 필요) | 검토 필요(레이아웃 후보에 따라) | 중간 |
| **CARD_MIN_WIDTH / GRID_LAYOUT** | `src/components/molecules/result/UnivTabs.tsx:17,27` | `UnivTabs` 그리드 및 카드 | `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`, 카드 `h-28` 고정, `min-width` 없음 | 현재는 6열 자체는 가능하나, 카드 정보 밀도를 높이면(3열×2행 등) 이 그리드 정의를 교체해야 함 | 검토 필요(레이아웃 변경 시) | 중간 |
| **OTHER** (표시 계층 라벨 충돌) | `src/components/atoms/TagChip.tsx:11-22` | `TagChip` | `category`(SAFE/MODERATE/RISKY)를 `displayBucket`과 동일한 "하향/적정/상향" 문자열로 표시 | 직접적인 "6개 노출 차단" 원인은 아니지만, 6개를 통합 그리드로 노출할 경우 category 배지와 탭(버킷) 라벨이 동시에 보이면서 불일치가 더 잘 드러남 | 검토 권장(라벨 문구 분리) | 낮음~중간 |
| PAGINATION | 해당 없음 | — | — | 저장소 전체 grep 결과 pagination 로직 없음 | 불필요 | — |
| CAROUSEL | 해당 없음 | — | — | swiper/carousel 패키지·컴포넌트 없음(grep 결과 없음) | 불필요 | — |
| OVERFLOW | 해당 없음 | — | — | `overflow-x`/스크롤 컨테이너 없음(grep 결과 없음) | 불필요 | — |
| DUPLICATE_FILTER | 해당 없음(현재는 안전) | `reportV2Mapper.ts:271-285` `createPortfolioDisplayLookup` | `programId`당 첫 매칭 버킷만 채택 | 중복 카드 생성 경로 없음 | 불필요 | — |
| RESPONSIVE_BREAKPOINT | 부수적 | `UnivTabs.tsx:17` | `lg`(1024px) 이상에서만 6열 진입, 그 이하는 자동 축소 | 모바일/태블릿에서는 설계상 6개 동시 노출이 목표가 아니므로 원인이 아님 | 불필요(모바일은 별도 fallback 설계 대상, 6절 참고) | — |

---

## 5. 목표 레이아웃 적합성 평가

| 평가 기준 | A. 3열×2행 | B. 6열×1행 | C. 3개 열(버킷)×카드 2개 | D. 통합 Grid + 위험도 Badge |
|---|---|---|---|---|
| 대학명/학과명 가독성 | 좋음(카드 폭 여유) | 나쁨(카드 폭 6등분, `h-28`처럼 압축 불가피) | 좋음(열 폭 여유) | 좋음(A와 동일 폭 가정 시) |
| 점수/핵심 지표 가독성 | 좋음 | 매우 나쁨(현재 `UnivTabs` 카드엔 지표 자체가 없음, 6등분 폭에 추가 불가) | 좋음, 단 버킷별 정렬로 지표 비교가 열 내부에 갇힘 | 좋음, 전체 6개 지표 동시 비교 용이 |
| 카드 높이 일관성 | 확보 쉬움(2행 고정) | 확보 쉬움(1행) | 버킷별 개수가 다르면(예: 안정 3/적정 2/상향 1) 열마다 카드 수가 달라 하단 여백 불균형 | 확보 쉬움 |
| 1440px 스크롤 없이 6개 인지 | 가능(1280px 폭 안에 3×2 배치 여유 충분) | 가능하나 각 카드가 지나치게 좁아짐(1280px÷6≈213px, gap 제외 시 더 좁음) | 가능하나 버킷 불균형 시 레이아웃이 뒤틀림 | 가능(A와 동일 그리드 폭) |
| 1280px 대응 | 동일하게 가능 | 카드 폭이 더 좁아짐(임계) | 가능 | 가능 |
| 기존 카드 컴포넌트 재사용성 | `UnivTabs`의 grid 정의만 교체하면 됨, 카드 내부 마크업은 확장 필요 | `UnivTabs`의 grid-cols 값만 유지, 카드 내부 정보는 늘릴 공간이 없음 | `displayBucket` 필터링 로직(`selectDisplayProgramsByBucket`)을 3회 호출하는 방식으로 재사용 가능하나 `Result.tsx` 구조 변경 폭 큼 | `UnivTabs` 확장 + `TagChip`을 카드 내부 배지로 재사용 가능 — 재사용성 가장 높음 |
| 모바일 반응형 전환 난이도 | 낮음(`grid-cols-1` sm 단계만 추가) | 낮음(이미 2/3열 반응형 존재) | 높음(3열 자체가 모바일에서 무너짐, 별도 스택 설계 필요) | 낮음(A와 동일) |
| displayBucket 의미 보존 | 보존(카드 내부 Badge로 표현 가능) | 보존(동일) | **가장 명확히 보존**(열 자체가 버킷) | 보존(Badge로 표현, 단 Badge 문구를 category와 분리해야 함 — 4절 OTHER 참고) |
| 상세 정보 과밀도 | 중간(핵심 지표만 카드에 넣고 나머지는 상세 패널 유지 시 적절) | 매우 높음 위험(카드 폭이 좁아 정보 밀도를 낮출 수밖에 없음) | 중간 | 중간(A와 동일) |
| 접근성 | 그리드 순서=DOM 순서로 스크린리더 탐색 자연스러움 | 동일 | 버킷별 그룹 헤딩(`<h3>안정</h3>` 등) 추가 시 오히려 접근성 유리 | 그리드+Badge 조합은 배지에 `aria-label` 추가 필요 |
| 수정 범위 | 중간(`Result.tsx` 필터 로직 + `UnivTabs` 그리드) | 작음(그리드는 이미 있음) BUT 정보 밀도 문제로 실질 수정 범위 커짐 | 큼(`Result.tsx` 상태 구조 전면 변경) | 중간(A와 유사, `TagChip` 라벨 분리 추가) |

### 권장안: **D. 카드 6개 통합 Grid + 카드 내부 위험도 Badge** (3열×2행 그리드로 구현)

- A안과 그리드 형태는 사실상 동일하지만, D안은 `displayBucket`을 "카드 배치용", `category`를 "카드 내부 Badge용"으로 명시적으로 분리해 표현한다는 점에서 4절에서 지적한 category/displayBucket 라벨 충돌 리스크를 구조적으로 해소한다.
- `UnivTabs.tsx`의 기존 grid 정의(`grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`)를 `lg:grid-cols-3`(3열)로 바꾸고 행이 2개가 되도록 카드 높이를 늘리는 정도로 구현 가능해 기존 컴포넌트 재사용성이 가장 높다.
- B안(6열×1행)은 1280px 컨테이너 폭 제약(`CONTAINER_WIDTH`, 4절) 안에서 카드당 가용 폭이 너무 좁아져 정보 밀도를 낮춰야 하므로 기각.
- C안(버킷별 3열)은 `displayBucket` 의미를 가장 명확히 보존하지만 버킷 간 카드 수 불균형(예: 6개가 3/2/1로 나뉘는 경우) 시 레이아웃이 깨지고, `Result.tsx`의 상태 구조(현재 단일 필터 기반)를 3배열 동시 상태로 전면 재설계해야 해 수정 범위가 가장 큼.

---

## 6. 카드 내부 정보 밀도 감사 (실제 코드 출력 기준만)

| 정보 | 현재 어디서 렌더링되는가 | 리스트 카드 필수 / 상세 이동 가능 |
|---|---|---|
| 대학명(`universityName`) | `UnivTabs.tsx:52`, `UnivDetailSummary.tsx:47` | **필수** |
| 학과명(`departmentName`) | `UnivTabs.tsx:59`(campus 없을 때 fallback), `EvaluationReport.tsx:125` | **필수** |
| 안정/적정/상향 표시(`category` 기반 `TagChip`) | `UnivTabs.tsx:34` | **필수**(단, 라벨을 `displayBucket`과 구분되게 표기 권장, 5절 참고) |
| 원래 위험도(`category` 원시값) | 현재 `TagChip` 라벨로만 간접 노출, 원시 문자열(SAFE/MODERATE/RISKY) 자체는 UI에 출력되지 않음 | 상세 이동 가능(원시값은 디버깅/내부용) |
| 최종 점수(`finalScore`) | `EvaluationReport.tsx:51,70`(상세 패널 전용, 현재 카드에는 없음) | 카드에 추가 시 필수급, 현재는 상세 이동 상태 |
| 추천 순위(`rank`) | **코드 어디에도 존재하지 않음** | 해당 없음 — 필드/렌더링 자체가 없어 평가 불가 |
| 수능최저 충족 정보 | `EvaluationReport.tsx:55-61`(O/X만), `UnivDetailSummary.tsx:97-99`(csatRequirement 텍스트) | 상세 이동 가능(O/X 요약은 카드에 넣을 만함) |
| 논술 적합도 | `EvaluationReport.tsx:68-72`("적합도 지표" = `finalScore` 재사용) | 상세 이동 가능 |
| 경쟁률 | `EvaluationReport.tsx:64-66` | 상세 이동 가능 |
| 시험 일정 | `UnivDetailSummary.tsx:90`, `UnivCompetencyComparison.tsx:216-219` | 상세 이동 가능 |
| 지원 근거(`rationale`) | `EvaluationReport.tsx:39-40,93` | 상세 이동 가능(길이가 길어 카드에 부적합) |
| 리스크 근거(`cautionNote`) | `EvaluationReport.tsx:46,129-136` | 상세 이동 가능(경고 배지 정도로 축약 가능) |
| 상세 분석 버튼 | **현재 존재하지 않음** — 카드 클릭이 곧 `activeIdx` 변경이며 별도 "상세보기" 버튼/모달/아코디언 UI 없음 | 신규 UI 필요(6개 통합 그리드로 갈 경우 카드→상세 이동 트리거가 명시적으로 필요해짐) |

**6개 동시 노출 시 카드가 커지는 근본 원인**: 지금은 카드(`UnivTabs`)가 최소 정보만 담고 나머지 전부(점수, 경쟁률, 최저, 일정, 근거, 주의사항)를 "선택된 1개"에 대한 대형 상세 패널(`EvaluationReport`+`UnivDetailSummary`+`UnivCompetencyComparison`, 총 3개의 `lg:grid-cols-12/3` 섹션)로 렌더링하는 구조이기 때문에, 이 상세 정보를 그대로 6장의 카드에 복제하면 카드 1장이 사실상 현재 상세 패널 크기에 근접하게 되어 화면이 감당할 수 없다. 따라서 카드에는 위 표의 "필수"급 정보 + 핵심 지표 1~2개(예: 최종 점수, 최저 O/X)만 남기고, 나머지는 "상세 분석" 트리거(신규 UI)로 분리하는 것이 6절 감사의 핵심 시사점이다.

---

## 7. 상태별 렌더링 확인

| 상태 | 현재 코드의 처리 | 근거 |
|---|---|---|
| loading | 스피너 + "리포트 데이터를 불러오는 중..." | `Result.tsx:133-139` |
| error(네트워크/계약) | `ContractErrorState` + 재시도 버튼(`/result`로 이동) | `Result.tsx:128-132`, `useNonsulResult.ts:91-95` |
| empty(추천 0개, 다른 탭에도 없음) | `ReportEmptyState` + "성적 입력하러 가기" CTA | `Result.tsx:192-198` |
| 추천 1~5개 | 있는 만큼만 `UnivTabs` grid에 렌더링(별도 최소개수 검증 없음) | `UnivTabs.tsx:18` `list.map` |
| 정확히 6개(단, 활성 필터 기준) | 필터 버킷에 6개가 몰리면 `lg:grid-cols-6`에서 2행 없이 1행 6열로 표시 가능 | `UnivTabs.tsx:17` |
| 7개 이상(버킷당) | 그리드가 자동으로 다음 행으로 줄바꿈(고정 6열 유지), 개수 제한 로직 없음 | `UnivTabs.tsx:17`(고정 grid-cols, 별도 `.slice()` 없음 — `reportFlow.contract.test.ts:90-103`로 slice 부재 회귀 고정) |
| 필드 null/undefined | `metadata` 필드들은 옵셔널 체이닝+기본값(`?? "본교"`, `?? "추천"` 등)으로 방어, `sectionFallback`/`fallbackReason`으로 보정 여부 표시 | `UnivDetailSummary.tsx:22-28`, `UnivTabs.tsx:35-42` |
| 긴 대학명/학과명 | 카드에 `overflow-hidden`만 적용(줄바꿈/말줄임 처리 없음), 좁은 열(2/3열)에서 텍스트 잘림 가능성 | `UnivTabs.tsx:27` `overflow-hidden` |
| 동일 대학 복수 학과 | `programId`가 유일 키이므로 동일 대학이 여러 카드로 중복 표시 가능(정상 동작), 대학명 중복에 대한 별도 그룹핑 없음 | `UnivTabs.tsx:24` `key={program.programId}` |
| fallback 배치 카드(`sectionFallback`) | "보정" 배지 표시(카드/상세 패널 모두) | `UnivTabs.tsx:35-42`, `UnivDetailSummary.tsx:55-62` |
| API 재조회/refresh | `useNonsulResult`가 `reportId` 변경 시에만 재요청(`useEffect` 의존성), 수동 새로고침 버튼 없음. 에러 시 재시도는 `/result` 목록으로 이동뿐(재요청 아님) | `useNonsulResult.ts:71-108`, `Result.tsx:131` |
| 모바일 화면 | `grid-cols-2`(390px), 필터/헤더는 `flex-col`로 스택 | `UnivTabs.tsx:17`, `ResultHeader.tsx:34` |

---

## 8. 테스트 감사

### 실행 결과 (기존 테스트, 수정 없이 그대로 실행)

```
node --test src/adapters/__tests__/*.test.ts src/__tests__/contracts/*.test.ts
# tests 79
# pass 79
# fail 0
```

### 존재하는 관련 테스트와 검증 범위

| 테스트 파일 | 검증 내용 |
|---|---|
| `src/adapters/__tests__/reportV2Mapper.test.ts` | camel/snake 정규화, `displayBucket` 계산 우선순위, `category`가 `displayBucket` 결정에 쓰이지 않음(`reportV2Mapper_never_uses_category_as_primary_display_bucket`), partial 상태 처리 |
| `src/__tests__/contracts/reportFlow.contract.test.ts` | `category` 변경이 카드 위치(`displayBucket`)를 바꾸지 않음(`regression_category_change_does_not_move_card_position`), 프론트가 `.slice()`로 추천 결과를 자르지 않음(`regression_frontend_never_slices_recommendation_results`), `displayBucket`이 `stable/target/reach`만 사용(`safety/match` 금지) |
| `src/adapters/__tests__/scoreSemantics.test.ts` | "합격 확률" 문구 금지, 점수 필드에 `%` 단위 오용 금지 |

### 검증되지 않는 항목 (누락된 회귀 테스트 — 작성하지 않고 제안만 함)

| 제안 테스트명 | 검증 목적 |
|---|---|
| `Result_renders_all_recommended_programs_simultaneously` | 추천 6개가 (버킷 필터와 무관하게) 한 화면에 모두 렌더링되는지 — 현재는 필터가 항상 1개 버킷만 통과시키므로 이 테스트가 없으면 회귀가 조용히 통과함 |
| `UnivTabs_preserves_api_response_order_as_rank` | 카드 표시 순서가 API가 내려준 순서(=rank 대용)를 그대로 유지하는지 |
| `Result_displayBucket_position_stable_across_rerenders` | 리렌더링/필터 전환 후에도 각 카드의 `displayBucket` 위치가 바뀌지 않는지 |
| `TagChip_category_label_does_not_shadow_displayBucket_label` | `category` 기반 Badge 문구가 `displayBucket` 탭 라벨과 동일 문자열을 사용해 혼동을 유발하지 않는지(현재 실패할 것으로 예상되는 테스트) |
| `Result_desktop_1440_shows_6_cards_without_scroll` (뷰포트/E2E) | 1440px에서 스크롤 없이 6개 카드가 모두 보이는지 — Playwright/Cypress 등 E2E 필요, 현재 관련 도구 설정 자체가 저장소에 없음 |
| `UnivTabs_mobile_390_layout_does_not_break` (뷰포트/E2E) | 모바일에서 6개 카드 배치가 깨지지 않는지 |
| `Result_duplicate_program_id_not_double_rendered` | 동일 `programId`가 두 번 렌더링되지 않는지(현재 데이터 소스가 유일 배열이라 저위험이나 회귀 방지용으로 유효) |

E2E/Snapshot/컴포넌트 테스트 도구(`Playwright`, `Cypress`, `@testing-library/react`, `jsdom` 등) 자체가 `package.json`에 없음 — 현재 테스트 스택은 Node 내장 `node --test` + 순수 함수/문자열 검사(매퍼·계약 레벨)뿐이며, 컴포넌트 렌더링/뷰포트 검증은 인프라 자체가 부재함.

---

## 9. 최종 판단 — 10개 질문에 대한 답

1. **현재 API 응답에는 카드 6개가 모두 존재하는가?**
   판단 불가 — 실제 프로덕션 API 응답을 직접 조회하지 않았음(감사 범위상 정적 코드/픽스처/테스트만 확인). 다만 코드 계약상 `recommendedPrograms` 배열 길이 제한 로직은 없고(`reportFlow.contract.test.ts:90-103`), `studentSummary.applicationCount`가 6으로 설정되는 샘플이 존재(`fixtures/contracts/report-v2.camel.json`)하여 6개를 내려주는 것을 전제로 설계된 것으로 보임.

2. **프론트 어느 지점에서 카드 수가 줄어드는가?**
   `src/pages/Result/Result.tsx:72-80`의 `recommendedPrograms` useMemo. `selectDisplayProgramsByBucket()`을 활성 필터(3개 중 1개) 기준으로 호출해 나머지 버킷 항목을 배열에서 제외한다. 부수적으로 `reportV2Mapper.ts:186-192`에서 필수 필드 누락 항목이 스킵될 수 있다.

3. **현재 카드 배치는 정확히 어떤 구조인가?**
   `Result.tsx`가 단일 버킷 필터로 축소한 배열을 `UnivTabs.tsx`(`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`, 카드 `h-28`)가 나열하고, 그 아래 `UnivDetailSummary`/`EvaluationReport`/`UnivCompetencyComparison`이 `activeIdx` 1개에 대한 상세 정보를 고정 섹션으로 표시하는 **"압축 탭 목록 + 단일 상세 패널"** 구조다. Modal/Accordion은 없다.

4. **6개 동시 표시를 막는 가장 직접적인 코드 1~3곳은 어디인가?**
   ① `src/pages/Result/Result.tsx:72-80`(단일 버킷 필터링), ② `src/components/molecules/result/ResultHeader.tsx:14-31`(단일 선택 필터 UI, "전체" 옵션 부재), ③ `src/hooks/useNonsulResult.ts:23-49`(`selectDisplayProgramsByBucket`이 `"all"`을 지원함에도 `Result.tsx`가 호출하지 않음).

5. **3열×2행으로 변경할 경우 최소 수정 파일은 무엇인가?**
   `src/pages/Result/Result.tsx`(필터 로직을 3버킷 동시 통합 또는 `"all"` 호출로 변경), `src/components/molecules/result/UnivTabs.tsx`(grid-cols를 `lg:grid-cols-3` 등으로, 카드 높이/내용 확장), `src/components/molecules/result/ResultHeader.tsx`(필터 UI를 "구분 표시"용으로 재정의하거나 유지 여부 결정). 3개 파일이 최소 범위.

6. **카드 컴포넌트 자체의 너비·높이 수정이 필요한가?**
   필요하다. 현재 `h-28`(112px) 고정 + 최소 정보만 담는 구조는 6절에서 확인했듯 지표(점수/최저/경쟁률 등)를 추가하기엔 부족하다. 3열×2행 기준으로 카드 높이를 늘리고 내부 레이아웃(칩+지표 2~3개)을 추가해야 함.

7. **기존 안정/적정/상향 의미를 유지하면서 통합 Grid가 가능한가?**
   가능하다. `displayBucket`을 카드 내부 Badge(위치 대신 의미 표시용)로 노출하거나 카드 테두리 색상으로 구분하면 통합 Grid 안에서도 버킷 의미를 보존할 수 있다. 단, `category` 기반 `TagChip`과 라벨이 겹치지 않도록 문구를 분리해야 한다(4절 OTHER, 6절 참고).

8. **백엔드 또는 API 변경이 필요한가?**
   현재 조사 범위에서는 불필요로 판단됨. `recommendedPrograms`/`portfolioStrategy` 계약은 이미 6개 전체와 버킷 배치 정보를 프론트에 전달하기에 충분한 구조이며, 문제는 프론트의 단일 필터 소비 방식에 있다. 다만 `rank`, `finalScore` 정렬 순서 등 카드 순서를 명시적으로 보장하는 필드가 없다면(현재는 배열 순서에 암묵 의존) 백엔드에 순서 보장 여부를 확인할 필요는 있음.

9. **모바일에서는 어떤 fallback 배치가 가장 안전한가?**
   기존 `grid-cols-2`(390px) 압축 탭 목록 + 하단 단일 상세 패널 구조를 유지하는 것이 가장 안전하다. 모바일에서 6개를 동시에 "카드형 상세"로 펼치면 스크롤 비용이 커지므로, 데스크톱만 통합 Grid로 확장하고 모바일은 현재의 탭 선택 UX를 유지하는 반응형 분기가 합리적(현재도 `lg:` 브레이크포인트로 이미 분기 가능한 구조).

10. **수정 전에 고정해야 할 회귀 테스트는 무엇인가?**
    기존 79개(특히 `regression_frontend_never_slices_recommendation_results`, `regression_category_change_does_not_move_card_position`, `regression_displayBucket_uses_stable_target_reach_not_safety_match`)를 그대로 유지한 채, 8절에서 제안한 `Result_renders_all_recommended_programs_simultaneously`와 `TagChip_category_label_does_not_shadow_displayBucket_label`을 우선 추가해 "6개 동시 노출"과 "라벨 충돌 방지"를 코드 변경 전에 실패하는 테스트로 먼저 고정한 뒤 구현하는 순서를 권장.

---

## 10. 출력 형식 (요청 포맷)

### 1) 수정 파일 목록
Audit이므로 실제 수정 파일 없음(`audit.md` 생성만 발생). 예상 수정 대상 파일:
- `src/pages/Result/Result.tsx`
- `src/components/molecules/result/UnivTabs.tsx`
- `src/components/molecules/result/ResultHeader.tsx`
- `src/components/atoms/TagChip.tsx`(라벨 문구 분리 시)

### 2) 핵심 변경사항 (최대 10줄)
1. 카드 그리드(`UnivTabs.tsx:17`)는 이미 `lg:grid-cols-6`을 지원하지만 6개가 오지 않는다.
2. 진짜 원인은 `Result.tsx:72-80`이 매번 "단일 버킷"만 필터링해 `UnivTabs`로 전달하는 것.
3. `ResultHeader.tsx`의 필터가 배타적 단일 선택(적정/상향/하향)이라 "전체"를 볼 UI 경로가 없다.
4. `selectDisplayProgramsByBucket("all")` 호출 경로는 훅에 이미 존재하나 페이지가 쓰지 않는다.
5. `category`→`displayBucket` 오염은 매퍼/테스트 레벨에서 이미 안전하게 차단되어 있다.
6. 단, `TagChip`이 `category`를 `displayBucket`과 동일한 한글 라벨로 표시해 표현 계층 혼동 리스크가 있다.
7. 카드(`UnivTabs`)는 정보가 매우 얕고, 점수/최저/경쟁률/근거 등은 전부 단일 상세 패널 전용이다.
8. 6개를 카드형으로 통합하면 카드당 정보량 재설계(무엇을 카드에, 무엇을 상세로)가 필수다.
9. carousel/swiper/pagination/overflow-x는 코드에 없어 원인에서 제외된다.
10. "6개 동시 렌더링"을 검증하는 자동 테스트는 현재 전무하다.

### 3) Metric 변화
- 현재 렌더링 카드 수: 활성 필터 버킷 분량(전형적으로 6개 중 1~3개, 코드상 고정값 아님)
- API 수신 카드 수: 확인 불가(정적 코드 감사 범위, 실 API 미호출) — 코드 계약상 슬라이스 없음
- DOM 렌더링 카드 수: `recommendedPrograms`(필터링 후) 배열 길이와 동일 = 활성 버킷 분량
- 1440px viewport 내 동시 가시 카드 수: 활성 버킷 분량과 동일(스크롤/캐러셀 없어 DOM=가시 상태 일치)
- 목표 동시 가시 카드 수: 6
- 예상 수정 파일 수: 3~4개(`Result.tsx`, `UnivTabs.tsx`, `ResultHeader.tsx`, 선택적으로 `TagChip.tsx`)

### 4) 실패 테스트명
없음 — 기존 테스트 79개 모두 통과.

### 5) 최종 테스트 결과
- 실행한 관련 자동 테스트 수: 79개(`src/adapters/__tests__/*.test.ts` + `src/__tests__/contracts/*.test.ts`)
- 결과: 79 pass / 0 fail
- "1440px에서 6개 카드 동시 렌더링"을 직접 검증하는 자동 테스트: **없음** — 컴포넌트/E2E/뷰포트 테스트 인프라 자체가 저장소에 구성되어 있지 않음(8절 참고)
