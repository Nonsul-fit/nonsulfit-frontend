# 추천 대학 카드 6개 일렬 배치 Wireframe

## 1. 변경 목적

현재 결과 페이지의 `적정 / 상향 / 하향` 필터 버튼을 제거하고,  
최종 추천 대학 6개를 기존 카드 스타일 그대로 한 줄에 모두 노출한다.

변경 범위는 추천 카드 배치 영역으로 한정한다.

- 기존 페이지 헤더 위치 유지
- 기존 대학 상세 패널 위치 유지
- 기존 포트폴리오 전략 이하 섹션 위치 유지
- 기존 카드 선택 및 상세 전환 동작 유지
- 백엔드/API 계약 변경 없음
- `category`, `displayBucket`, 점수 데이터 변경 없음

---

## 2. Desktop Wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ 입시 포트폴리오 진단 리포트                               │
│ 최적화된 6개 대학 조합 리포트입니다. 카드를 선택해 상세 결과를 확인하세요. │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ [1 적정] [2 적정] [3 적정] [4 상향] [5 상향] [6 하향]                      │
│ 연세대    서강대    성균관대  한양대    중앙대    한국외대                  │
│ 서울      서울      서울      서울      서울      글로벌                    │
│ 점수      점수      점수      점수      점수      점수                      │
│ 최저      최저      최저      최저      최저      최저                      │
│ 일정      일정      일정      일정      일정      일정                      │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 선택된 대학 상세 패널                                                        │
│                                                                              │
│ [대학명/캠퍼스]   [위치·시험일·문제유형·최저]   [평가기준 도넛 차트]       │
│ [선생님 한줄평]                                                             │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 포트폴리오 전략 및 기존 하위 섹션                                           │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 카드 배치 규칙

### Desktop

```text
1440px 이상: 6열 × 1행
1280px 이상: 6열 × 1행
1024px 이상: 6열 × 1행 유지, 카드 내부 정보 최소화
```

권장 Grid:

```text
grid-cols-6
gap-3 또는 gap-4
```

카드 높이는 동일하게 유지한다.

```text
min-height: 220~260px
```

카드 폭이 좁기 때문에 아래 정보만 카드에 남긴다.

- 순번
- 지원 구간 배지
- 대학명
- 캠퍼스 또는 학과명
- 최종 점수
- 수능 최저 요약
- 논술 적합도
- 시험 일정
- 선택 화살표

긴 설명, 경쟁률 상세, 지원 근거, 리스크 설명은 기존 상세 패널에 유지한다.

---

## 4. Tablet / Mobile Fallback

```text
768~1023px: 3열 × 2행
640~767px: 2열 × 3행
639px 이하: 1열 × 6행
```

모바일에서는 가로 스크롤을 사용하지 않는다.

```text
Desktop: grid-cols-6
Tablet: grid-cols-3
Mobile: grid-cols-1 또는 grid-cols-2
```

---

## 5. 제거 대상

다음 UI는 제거한다.

```text
[적정] [상향] [하향]
```

관련 단일 버킷 선택 상태도 제거하거나 비활성화한다.

제거 대상:

- `manualFilter`
- `autoFilter`
- `filter`
- `displayBucketByFilter`
- `otherNonEmptyFilters`
- 단일 버킷 필터 버튼
- 필터별 Empty State 분기

---

## 6. 유지 대상

다음 동작은 그대로 유지한다.

- 카드 클릭 시 선택 상태 변경
- 선택 카드 Navy 배경 또는 Active Border
- `activeIdx` 기반 상세 패널 전환
- `UnivDetailSummary`
- `EvaluationReport`
- `UnivCompetencyComparison`
- `TagChip`
- `sectionFallback` 보정 배지
- 기존 점수 및 상세 데이터
- 기존 하위 리포트 섹션

---

## 7. 데이터 흐름 변경

### Before

```text
recommendedPrograms 전체
→ 적정/상향/하향 중 1개 버킷 선택
→ selectDisplayProgramsByBucket()
→ 선택된 버킷 카드만 UnivTabs 전달
```

### After

```text
recommendedPrograms 전체
→ selectDisplayProgramsByBucket(..., "all")
→ 6개 전체 UnivTabs 전달
→ 카드 선택 시 기존 상세 패널 갱신
```

---

## 8. 컴포넌트별 변경

### `src/pages/Result/Result.tsx`

변경:

- 단일 버킷 필터 상태 제거
- 전체 추천 배열 사용
- `selectDisplayProgramsByBucket(..., "all")` 호출
- Header에 filter 관련 props 전달 제거
- 카드 배열 변경 시 `activeIdx` 범위 보정

유지:

- Loading
- Error
- Empty
- 상세 패널
- 하위 리포트 섹션

### `src/components/molecules/result/ResultHeader.tsx`

변경:

- 적정/상향/하향 버튼 제거
- 제목과 설명만 유지
- 우측 영역은 비워두거나 기존  버튼만 유지

### `src/components/molecules/result/UnivTabs.tsx`

변경:

```text
기존:
grid-cols-2 sm:grid-cols-3 lg:grid-cols-6

수정:
grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6
```

- 6열 1행 구조 유지
- 카드 내부 정보가 좁은 폭에서도 잘리지 않도록 정렬
- 대학명 최대 2줄
- 학과명 최대 1~2줄
- 카드 전체 클릭 영역 유지

---

## 9. 표시 의미

카드의 지원 구간 배지는 `displayBucket`을 기준으로 표시한다.

```text
stable → 안정
target → 적정
reach → 상향
```

`category` 값은 변경하지 않는다.

`category`와 `displayBucket`이 다를 경우:

- 카드의 지원 구간 배지: `displayBucket`
- 원래 위험도: 기존 상세 분석 영역에서만 표시
- `sectionFallback=true`이면 `보정` 배지 유지

---

## 10. Acceptance Criteria

- [ ] 적정/상향/하향 필터 버튼이 제거된다.
- [ ] API가 반환한 추천 카드 6개가 모두 DOM에 존재한다.
- [ ] 1280px 이상에서 6개 카드가 한 줄에 노출된다.
- [ ] 카드 순서는 API 배열 순서를 유지한다.
- [ ] 첫 번째 카드는 기본 선택 상태를 유지한다.
- [ ] 다른 카드를 클릭하면 기존 상세 패널만 갱신된다.
- [ ] 카드별 `displayBucket` 배지가 유지된다.
- [ ] `category` 값은 변경되지 않는다.
- [ ] 보정 카드에는 기존 `보정` 배지가 유지된다.
- [ ] 768px에서는 3열, 모바일에서는 1~2열로 안전하게 줄바꿈된다.
- [ ] 가로 스크롤을 추가하지 않는다.
- [ ] 기존 상세 리포트 및 하위 섹션의 위치와 구조를 변경하지 않는다.
- [ ] 기존 계약 테스트 79개가 모두 통과한다.

---

## 11. 수정 범위

필수 수정:

```text
src/pages/Result/Result.tsx
src/components/molecules/result/ResultHeader.tsx
src/components/molecules/result/UnivTabs.tsx
```

조건부 수정:

```text
src/components/atoms/TagChip.tsx
```

수정 금지:

```text
API 계약
Backend
ReportPayloadV2
portfolioStrategy
category 계산
displayBucket 계산
상세 리포트 컴포넌트 구조
포트폴리오 전략 이하 섹션
```
