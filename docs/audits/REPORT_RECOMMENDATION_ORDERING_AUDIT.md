# Report Recommendation Ordering Audit

감사 기준: 2026-08-03 현재 `nonsulfit-frontend` 정적 코드, 계약 fixture, 회귀 테스트

## 1. Executive summary

현재 Report 카드의 최종 순서는 **Backend가 `generatedReportV2.recommendedPrograms`에 넣어 보낸 배열 순서(insertion order)** 이다. Frontend에는 `finalScore`, `selectionRank`, `displayBucket`, `category`, 대학명 또는 날짜를 기준으로 한 정렬이 없다.

정확한 현재 우선순위는 다음과 같다.

1. API `recommendedPrograms[]` 원본 배열 순서
2. mapper validation을 통과한 항목만 유지(탈락한 항목을 제외한 상대 순서는 유지)
3. 그 외 tie-breaker 없음

즉 `selectionRank`와 `finalScore`가 payload에 있어도 순서 결정에는 쓰이지 않는다. ES의 stable sort에 의존하는 것도 아니다. 애초에 `sort()`를 호출하지 않는다.

현재 `Result`는 bucket별 화면이 아니라 `"all"`을 전달하므로 `stable → target → reach` 또는 반대 방향으로 강제 regrouping하지 않는다. 여러 bucket이 섞인 원본 배열이면 그대로 섞인 상태로 렌더링한다.

이 저장소는 Frontend 전용이다. Algorithm, Portfolio Builder, Backend report 생성/DB snapshot 구현은 포함하지 않으므로, 그 내부에서 원본 배열을 어떤 기준으로 구성하는지는 확인할 수 없다. Frontend에서 입증 가능한 것은 **상류가 정한 배열 순서를 변경하지 않고 최종 UX에 노출한다**는 점이다.

## 2. 실제 ordering flow와 책임

| 단계 | 확인 결과 | 순서 책임 |
|---|---|---|
| Algorithm | 구현 없음. `finalScore`/후보 순위 계산 및 최초 후보 순서를 확인할 수 없음 | 미확인(별도 저장소 필요) |
| `recommendedPrograms` 생성 | Frontend는 생성하지 않고 `GET /reports/:reportId` 응답을 소비 | Backend/API contract가 사실상 최초 순서를 소유 |
| Portfolio Builder | 구현 없음. Frontend 계약에는 `portfolioStrategy.{safety,match,reach}.programIds`만 존재 | 배치 정보는 상류 책임; 전체 배열 ordering은 미확인 |
| `displayBucket` 생성 | canonical V2에서는 Backend가 보낸 각 항목의 필수 `displayBucket`을 검증/보존. legacy에서는 `item.displayBucket`, 없으면 `target` | V2: Backend. Legacy fallback: Frontend mapper |
| Backend Report Mapping | 구현 없음. 실제 snapshot projection/order query 확인 불가 | 미확인 |
| Frontend mapper | `flatMap`으로 입력 배열을 순회하며 유효 항목을 동일 순서로 반환. `selectionRank`/`finalScore` 정렬 없음 | 순서 보존 책임 |
| Frontend selection | 현재 `bucket="all"`; `filter(() => true)`로 얕은 새 배열만 생성 | 순서 보존 책임 |
| Rendering | React `list.map(...)` 순서대로 grid button 생성 | 최종 렌더 순서 책임 |

근거:

- API: `src/api/reports.ts:30-38`
- body 추출 및 mapping: `src/adapters/reportV2Mapper.ts:45-79`
- mapper의 순서 보존 `flatMap`: `src/adapters/reportV2Mapper.ts:154-235`
- invalid 항목 제거: `src/adapters/reportV2Mapper.ts:183-216`
- legacy `backendList.map`: `src/adapters/reportV2Mapper.ts:306-362`
- `all` selection: `src/hooks/useNonsulResult.ts:23-49`
- 실제 `"all"` 호출: `src/pages/Result/Result.tsx:45-53`
- 최종 `list.map`: `src/components/molecules/result/UnivTabs.tsx:15-67`
- 입력 순서 보존 회귀 테스트: `src/adapters/__tests__/frontendContractConsumption.test.ts:80-91`

## 3. 사용 필드와 정확한 우선순위

| 필드/기준 | 현재 ordering 사용 | 비고 |
|---|---:|---|
| API 배열 insertion order | **예** | 유일한 실제 기준 |
| `selectionRank` | 아니오 | 타입에 optional로 존재하고 object spread로 보존되지만 comparator 없음 |
| `rank` | 아니오 | canonical 타입/소비 코드에 없음 |
| `finalScore` | 아니오 | mapper가 숫자로 정규화하며, 상세 점수 표시용 |
| legacy `totalScore` | 간접 보존만 | legacy mapping에서 `finalScore`로 옮기나 정렬하지 않음 |
| `displayBucket` | 현재 전체 화면에서는 아니오 | 위치 badge/의미에 사용. bucket selector 사용 시 membership filter만 수행 |
| `category` | 아니오 | 표시용이며 bucket/order에 관여하지 않음 |
| 대학명/학과명 | 아니오 | tie-breaker 없음 |
| 날짜 | 아니오 | canonical sortable date 계약 없음 |
| stable sort | 해당 없음 | `.sort()`/`.toSorted()` 호출 자체 없음 |

따라서 `selectionRank`와 배열 순서가 충돌하면 **배열 순서가 승리**한다. 테스트도 rank `3, 1, 2` 입력을 `3, 1, 2` 순서로 유지하도록 명시한다.

## 4. Frontend 중복 정렬 및 displayBucket 이후 정렬

Frontend 재정렬 코드는 없다. 따라서 Backend 결과를 점수나 rank로 덮어쓰지 않는다.

`selectDisplayProgramsByBucket()`의 세부 동작은 다음과 같다.

- `all`: `programs.filter(() => true)` — 모든 항목과 상대 순서 유지
- 특정 bucket + `portfolioStrategy.*.programIds`가 비어 있지 않음: ID를 `Set`으로 만들고 원본 `programs.filter(...)`
- 특정 bucket + IDs가 비어 있음: `program.displayBucket`으로 원본 `programs.filter(...)`

중요하게, `programIds`가 `[B, A]`이고 `recommendedPrograms`가 `[A, B]`여도 결과는 `[A, B]`다. `programIds`는 membership authority일 뿐 ordering authority가 아니다.

현재 `Result.tsx`는 항상 `all`을 사용하므로 displayBucket 생성 이후 다음 강제 정렬은 모두 없다.

- `stable → target → reach`: 없음
- `reach → target → stable`: 없음
- bucket 내부 `finalScore DESC`: 없음
- bucket 내부 `selectionRank ASC`: 없음

동일 bucket 내부 순서 역시 원본 `recommendedPrograms` 상대 순서다. invalid row가 mapper에서 제거돼도 남은 row의 상대 순서는 유지된다.

## 5. 날짜 정렬 가능성

### 필드 존재 여부

| 후보 | Canonical V2 타입/fixture | Legacy 응답/mapper | 실제 Report 정렬 가능성 |
|---|---|---|---|
| `examDate` | 없음 | `program.examDate?: string` 존재 | legacy에서만 표시 문자열로 간접 보존 |
| `applicationDate` | 없음 | 없음 | 불가 |
| `schedule` | 없음 | 없음 | 불가 |
| `logistics` | 없음 | 없음 | 불가 |
| `program_snapshot` / `programSnapshot` | 없음 | 없음 | 확인 불가 |
| `report_snapshot` / `reportSnapshot` | Report payload에 없음 | 없음 | 확인 불가 |
| `metadata.examDateText` | 정식 타입 필드 아님(`Record<string, unknown>`) | `program.examDate`에서 생성 | 문자열 표시에는 가능, 신뢰성 있는 정렬에는 부적합 |

관련 근거는 `src/types/reportPayloadV2.ts:57-76`, `src/adapters/reportV2Mapper.ts:16-31,344-355`, `src/fixtures/contracts/report-v2.camel.json:11-53`이다.

결론: **레거시 데이터 일부를 임의 파싱하는 프로토타입은 가능하지만, 현재 구조로 production-grade 시험일 정렬은 불가능하다.** V2 fixture에는 날짜가 없고, 레거시 값도 ISO date가 아닌 자유 형식 문자열일 수 있으며 fallback `"대학 홈페이지 참조"`가 섞인다. timezone, 미정/기간/복수 시험일의 의미도 정의돼 있지 않다.

날짜 정책을 지원하려면 Backend report snapshot에 최소 다음 canonical projection을 저장해야 한다.

```ts
interface ProgramScheduleSnapshot {
  examStartsAt: string | null;        // ISO 8601 with timezone
  applicationStartsAt: string | null;
  applicationEndsAt: string | null;
  status: "confirmed" | "tentative" | "unknown";
  sourceUpdatedAt: string | null;
  displayText?: string;
}
```

정렬에는 `examStartsAt`을 사용하고 `displayText`는 화면 표시만 담당해야 한다. null은 기본적으로 마지막에 둔다.

## 6. 상향·적정·안정 순서 변경 가능성

현재는 설정만 바꿔 순서를 변경할 수 없다. 환경변수, feature flag, `ORDER_POLICY`, bucket priority config가 없기 때문이다.

또한 화면은 bucket group을 만들지 않고 단일 배열을 그대로 렌더링하므로, `stable/target/reach` 순서를 바꾸려면 comparator 또는 bucket flattening 코드를 추가해야 한다. `getFirstNonEmptyBucket(..., priorityOrder)`는 시작 bucket을 고르는 helper일 뿐 카드 배열 순서를 바꾸지 않으며 현재 Result ordering에도 사용되지 않는다.

따라서 현 상태의 답은 다음과 같다.

- Backend가 `recommendedPrograms` 배열을 원하는 bucket 순서로 내려주도록 변경: Frontend 수정 없이 가능하지만 정책이 암묵적이며 계약이 약함
- Frontend에서 bucket order를 변경: 코드 수정 필요
- 설정값만 변경: 불가능

## 7. 정책 비교

| 정책 | 장점 | 단점 / UX 영향 | Backend 영향 | Frontend 영향 |
|---|---|---|---|---|
| ① `FinalScore DESC` | 최고 추천을 즉시 노출; 설명 쉬움 | 지원 포트폴리오 균형과 시험 일정 맥락이 사라짐; 근소한 점수차를 과대해석 | `finalScore` 의미/버전/동점 규칙 보장 | comparator 추가 가능 |
| ② `Rank ASC` | Algorithm의 종합 판단을 가장 직접 보존; 안정적 계약 가능 | rank 산정 근거가 불투명하면 UX 신뢰 저하; 현재 optional | `selectionRank` 필수·unique·snapshot 고정 필요 | 명시 comparator 및 null 정책 필요 |
| ③ `Date ASC` | 임박 시험 중심의 실행 UX에 좋음 | 추천 품질보다 일정이 앞섬; 미정/복수/과거 날짜 처리 필요 | canonical schedule snapshot 필수 | 날짜 파싱/상태/nullable 처리 필요 |
| ④ `Stable → Target → Reach` | 보수적 사용자에게 심리적 안정; 안전 카드부터 확인 | 핵심 도전 기회가 뒤로 밀림; 한국어 의미상 `stable=하향` 명시 필요 | bucket 보장만 필요 | bucket weight comparator 필요 |
| ⑤ `Reach → Target → Stable` | aspirational UX; 관심과 탐색 유도 | 과도한 기대/리스크 anchoring 가능 | bucket 보장만 필요 | bucket weight comparator 필요 |
| ⑥ `Date → Bucket → Score` | 원서/시험 실행 계획에 최적; 같은 날 전략적 구조 | 날짜 없는 현재 계약에서는 불가; 추천 리포트가 캘린더처럼 보일 수 있음 | schedule snapshot 및 score 필요 | multi-key comparator, null/동점 규칙 필요 |
| ⑦ `Bucket → Date → Score` | 포트폴리오 균형을 먼저 이해하고 각 구간 내 실행 순서 제공 | bucket 경계 때문에 더 임박한 카드가 뒤로 갈 수 있음 | bucket + schedule + score 필요 | group-aware multi-key comparator 필요 |
| ⑧ 사용자 `Custom` | 사용자 목표(상향 우선/일정 우선)에 맞춤; 통제감 | 선택 피로, 정책 저장/설명 필요; 일관된 기본값 필수 | 선택적으로 preferences 저장 | selector UI, persistence, accessible labels 필요 |

## 8. 권장 기본 정책

### 단기: `selectionRank ASC`를 canonical default로

리포트의 본질이 Algorithm + Portfolio Builder의 종합 추천이라면 Frontend가 다시 `finalScore` 한 필드로 재해석해서는 안 된다. Backend가 최종 선정 과정의 의미를 반영한 `selectionRank`를 필수/고유/연속 값으로 확정하고, Frontend는 이를 명시적으로 `ASC` 정렬하는 것이 가장 안전하다.

권장 동점/결측 우선순위:

```text
selectionRank ASC NULLS LAST
→ finalScore DESC NULLS LAST
→ programId ASC
```

현재 배열 순서를 마지막 tie-breaker로 쓰면 Backend query/serialization의 우연한 순서가 다시 계약에 들어오므로, deterministic key인 `programId`가 낫다.

### 일정 기능 도입 후: 사용자 view로 `Bucket → Date → Score`

정렬을 하나만 강제하기보다 기본 추천순과 별도로 “지원 전략별” view를 제공하는 것이 UX에 더 적합하다.

- 기본: 추천순 (`selectionRank ASC`)
- 지원 전략별: `target → reach → stable`을 권장 초기값으로 검증하되 product 실험 가능하게 config화
- 일정순: `examStartsAt ASC NULLS LAST → selectionRank ASC`
- 사용자 설정: 위 preset 선택 및 저장

`target → reach → stable`은 필수 지원 후보를 먼저 보여주고, 그 다음 도전/보험 선택을 검토하게 한다는 제품 가설이다. 이는 코드 사실이 아니라 UX 제안이므로 실제 출시 전 사용자 테스트/analytics로 검증해야 한다.

## 9. Config 기반 설계안

정렬은 Algorithm/Backend와 Frontend가 서로 다른 규칙을 중복 적용하지 않도록 계약을 분리한다.

```ts
type OrderPolicy =
  | "SELECTION_RANK"
  | "FINAL_SCORE"
  | "EXAM_DATE"
  | "DISPLAY_BUCKET"
  | "DATE_BUCKET_SCORE"
  | "BUCKET_DATE_SCORE"
  | "CUSTOM";

interface RecommendationOrderConfig {
  policy: OrderPolicy;
  direction?: "asc" | "desc";
  bucketOrder: DisplayBucket[];
  nulls: "first" | "last";
  tieBreakers: Array<"selectionRank" | "finalScore" | "programId">;
  version: string;
}
```

권장 책임 경계:

1. Algorithm: 점수 및 후보 rank 계산. UI bucket order를 결정하지 않음.
2. Portfolio Builder: `displayBucket`, `selectionRank`, `placementReason` 확정.
3. Backend Report Mapping/Snapshot: canonical fields와 `orderPolicyVersion`, schedule snapshot 저장. 저장 당시 결과를 재현 가능하게 함.
4. Backend API: authoritative default 배열을 `selectionRank ASC`로 반환하고 계약에 명시.
5. Frontend: 중앙 `orderRecommendedPrograms(programs, config)` 한 곳에서만 view ordering 적용. 컴포넌트에서 임의 sort 금지.
6. Rendering: 전달받은 배열 순서만 렌더링.

Frontend 구현 시 원본 props를 mutate하지 않도록 `toSorted()` 또는 `[...programs].sort()`를 사용하고, comparator를 pure/deterministic하게 유지한다. `portfolioStrategy.programIds`를 order source로 채택하려면 membership `Set`이 아니라 `id → index` lookup을 명시적으로 사용해야 한다.

서버 기본 정책과 사용자 view 정책은 구분해야 한다.

```ts
interface ReportOrderMetadata {
  canonicalPolicy: "SELECTION_RANK";
  canonicalPolicyVersion: string;
  generatedAt: string;
}
```

사용자 변경은 snapshot의 canonical rank를 다시 쓰지 않고 UI preference로만 저장한다. 이 구분이 있어야 같은 리포트의 재현성과 사용자 맞춤을 동시에 보장할 수 있다.

## 10. 필요한 후속 검증 및 테스트

이 감사에서 확인 불가능한 항목은 Backend/Algorithm 저장소에서 다음 순서로 확인해야 한다.

1. Algorithm 후보 리스트 comparator와 동점 처리
2. Portfolio Builder의 selection 및 `selectionRank` 부여 시점
3. `displayBucket` 부여 전/후 sort 또는 bucket flatten 순서
4. ORM/SQL의 명시적 `ORDER BY` 여부
5. JSON/DB snapshot에 배열 순서, rank, score, schedule이 실제 저장되는지
6. report 재조회 시 같은 순서가 재현되는지

추가할 회귀 테스트:

- rank `3,1,2`와 배열 순서가 충돌할 때 각 policy 결과
- 동일 bucket 내 score/date/rank tie-breaker
- 모든 date null/일부 null/동일 date/invalid date
- 모든 6개 bucket 혼합에 대한 각 bucket priority
- `portfolioStrategy.programIds` 순서와 `recommendedPrograms` 순서 충돌
- mapper가 invalid row를 제거한 뒤 deterministic ordering 유지
- 사용자 policy 저장/복원 및 canonical snapshot 불변

## 11. 최종 판정

| 산출물 | 판정 |
|---|---|
| 현재 실제 정렬 Flow | Backend 배열 → validation/filter(순서 보존) → `all` filter(순서 보존) → React map |
| 정렬 책임 위치 | 실제 comparator는 없음. 최종 순서는 Backend/API 배열 작성자가 사실상 소유, Frontend는 보존 |
| 사용 필드 | ordering에는 insertion order만 사용. `selectionRank`, `finalScore`, bucket, category 미사용 |
| 중복 정렬 | 없음 |
| 날짜 정렬 | canonical V2 기준 불가; schedule snapshot 계약 필요 |
| 상향·적정·안정 순서 | 현재 강제 순서 없음; 설정만으로 변경 불가 |
| Config화 | 가능하나 중앙 order service + contract/versioning 추가 필요 |
| 추천 기본 정책 | 단기 `selectionRank ASC`; 일정 데이터 도입 후 별도 `Bucket → Date → Score` view 제공 |

