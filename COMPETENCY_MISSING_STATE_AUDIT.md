# 논술 역량 미입력 상태 감사

- 감사일: 2026-07-16
- 대상: NonsulFit Frontend `main` (`9c4a2a2`)
- 범위: 조사 및 리포트 작성만 수행. 제품 코드는 수정하지 않음.
- 제약: 이 세션에서는 브라우저 Network 응답과 Backend 저장소에 접근할 수 없었다. 따라서 문제가 된 특정 report의 실응답 및 입력/analysis run 생성 시각 비교는 **확인 필요**로 남긴다.

## 1. 요약 결론

현재 소스 기준으로 가장 직접적이고 재현 가능한 원인은 **논술 역량 입력값이 분석 생성 요청에 포함되지 않는 end-to-end 데이터 단절**이다.

1. Step 2는 다섯 점수를 `FormContext.essayInfo`에 저장하고 필수값 검증도 한다 (`src/pages/Step/Step02.tsx:11-32`, `:50-65`).
2. 그러나 최종 제출을 담당하는 Step 3은 context에서 `studentInfo`, `academicInfo`만 꺼내며 `essayInfo`는 읽지 않는다 (`src/pages/Step/Step03.tsx:20`).
3. `mapFormToAnalysisInput` 호출에도 두 객체만 전달한다 (`src/pages/Step/Step03.tsx:79-88`).
4. `NonsulFormState`와 `AnalysisInputPayload` 타입 자체에도 논술 역량 필드가 없고 (`src/contracts/analysisInput.ts:11-23`, `:41-62`), 매퍼가 만드는 payload에도 `student`, `schoolGrade`, `testGrades`만 있다 (`src/adapters/analysisInputMapper.ts:13-48`).
5. 이 payload가 그대로 `PUT /nonsulfit/input`으로 전송된다 (`src/api/analysis.ts:31-35`).

즉 사용자가 화면에서 값을 입력했다는 사실과 Backend가 해당 값을 받은 사실은 같지 않다. 현재 코드 경로에서는 입력한 논술 역량이 분석 요청에서 누락되므로, Backend가 analysis run 생성 시 빈 역량 스냅샷을 만들고 report 응답에 `studentCompetency: {}`를 돌려주는 결과와 정확히 부합한다.

조회 측 `reportV2Mapper`의 필드 경로와 다섯 snake_case 키는 감사에서 제시된 wire shape과 일치한다. `UnivCompetencyComparison`의 empty 판정도 “다섯 값이 모두 있어야 함”이 아니라 “객체에 키가 하나라도 있는가”이므로, 현재 증상을 만드는 주원인으로 보이지 않는다.

별도 UI 문제인 `미입력` 줄바꿈은 작은 3열 카드 안에서 큰 `text-xl` 값과 `내 점수` 라벨을 한 줄 flex로 배치하면서 값에 `white-space: nowrap`/`shrink-0`가 없기 때문에 발생한다.

## 2. 가설과 예측

| 가설 | 예측 | 감사 결과 |
|---|---|---|
| H1. report 응답의 `studentCompetency`가 실제로 `{}` 또는 전부 null | 매퍼 이후에도 값이 없고 empty UI가 표시됨 | **유력/하류 현상으로 지지**. 특정 실응답은 확인하지 못했지만 제출 누락으로 `{}`가 만들어질 명확한 상류 경로를 확인함 |
| H2. 응답에는 값이 있으나 조회 매퍼가 경로나 키를 잘못 읽음 | 정상 fixture도 `{}` 또는 null로 정규화됨 | **기각**. 최상위 경로와 다섯 snake_case 키가 일치하고 계약 테스트가 정상/부분/빈 상태를 통과하도록 구성됨 |
| H3. 컴포넌트가 값이 있어도 항상 empty로 판정 | non-empty 객체에도 `EmptyCompetencyState`가 렌더링됨 | **기각**. 판정은 `Object.keys(...).length > 0`; 키 하나만 있어도 레이더 분기임 |
| H4. 입력 전에 생성된 과거 report 스냅샷을 조회 | report 생성 시각이 입력 시각보다 이전임 | **확인 필요**. 특정 report의 `analysisRunId/generatedAt` 및 입력 시각이 없어 판정 불가. 과거 report라면 정상 동작일 수 있음 |
| H5. 입력 UI 상태가 분석 생성 요청에 포함되지 않음 | 사용자가 입력/검증을 통과해도 request payload에 역량이 없음 | **확정**. Step 3, input contract, mapper, API 전송 전 구간에서 `essayInfo`가 누락됨 |

## 3. 워크플로우 다이어그램

```text
[Step02: essayInfo에 5개 점수 저장/검증] — 정상
                     ↓
[Step03 → mapFormToAnalysisInput] — essayInfo 누락 (확정된 단절)
                     ↓
[PUT /nonsulfit/input] — student/schoolGrade/testGrades만 전송
                     ↓
[Backend analysis run 스냅샷] — 특정 실데이터 확인 필요;
                                  현재 요청으로는 빈 역량이 될 가능성이 매우 높음
                     ↓
[GET report: studentCompetency] — 특정 실응답 확인 필요; UI 증상은 `{}`와 일치
                     ↓
[reportV2Mapper 정규화] — 경로/키 정상, `{}`는 `{}`로 보존
                     ↓
[Result.tsx prop 전달] — 가공 없이 그대로 전달
                     ↓
[UnivCompetencyComparison empty 판정] — 빈 객체이면 false
              ┌──────┴──────┐
              ↓             ↓
       non-empty 객체       `{}`
       정상 오각형          EmptyCompetencyState + 카드 5개 `미입력`
                            ↑ 실제 화면
```

## 4. 감사 1 조사 결과

### 4.1 입력 UI에는 값이 저장된다

`FormContext`는 다섯 Backend 키와 동일한 이름으로 `essayInfo`를 보관한다.

- `reading`
- `content_understanding`
- `prompt_understanding`
- `structure`
- `expression`

근거: `src/context/FormContext.tsx:28-38`.

Step 2도 같은 키로 입력 컴포넌트를 만들고 (`src/pages/Step/Step02.tsx:50-65`), 다음 단계로 이동하기 전에 이 값들을 필수값으로 검증한다 (`src/pages/Step/Step02.tsx:17-32`). 따라서 “화면에서 입력했고 다음 단계로 이동했다”는 관찰은 frontend context에 값이 있었다는 근거는 되지만, 서버 전송의 근거는 아니다.

### 4.2 최종 분석 요청에서 `essayInfo`가 완전히 누락된다

Step 3의 context destructuring은 다음과 같다.

```tsx
const { studentInfo, academicInfo, setAcademicInfo } = useFormContext();
```

근거: `src/pages/Step/Step03.tsx:20`.

최종 매퍼 호출도 다음 두 영역만 전달한다.

```tsx
const payload = mapFormToAnalysisInput({
  studentInfo: { ... },
  academicInfo: { ... },
});
```

근거: `src/pages/Step/Step03.tsx:79-88`.

누락은 호출부에만 국한되지 않는다.

- `NonsulFormState`에 `essayInfo`가 없음: `src/contracts/analysisInput.ts:41-62`
- `AnalysisInputPayload`에 competency/essay section이 없음: `src/contracts/analysisInput.ts:11-23`
- 매퍼 결과에는 `student`, `schoolGrade`, `testGrades`만 있음: `src/adapters/analysisInputMapper.ts:22-46`
- 그 결과가 별도 보강 없이 API body가 됨: `src/api/analysis.ts:31-35`
- `rg "essayInfo" src` 결과 사용처는 `FormContext.tsx`와 `Step02.tsx`뿐이다. 제출 계층에는 사용처가 없다.

이것이 H5를 확정하는 정적 근거다. Backend가 별도의 최신 학생 입력을 다른 endpoint에서 조회하지 않는 한, 현재 frontend 요청만으로는 다섯 값을 스냅샷에 넣을 수 없다. 제공된 Backend 감사에 따르면 report는 analysis run 생성 시점 스냅샷을 사용하므로 이 누락과 화면 증상 사이의 인과관계가 강하다.

### 4.3 report 조회 매퍼의 경로는 현재 계약과 일치한다

`reportV2Mapper`는 전체 HTTP body와 `generatedReportV2` 내부를 분리한다 (`src/adapters/reportV2Mapper.ts:53-70`). `studentCompetency`는 우선 전체 응답 최상위에서 읽고, 직접 payload 형태를 위한 내부 fallback도 둔다.

```ts
studentCompetency: normalizeStudentCompetency(
  read(response, "studentCompetency") ?? read(source, "studentCompetency"),
),
```

근거: `src/adapters/reportV2Mapper.ts:103-118`.

`read`는 camel key와 그 최상위 snake_case alias를 지원하므로 `studentCompetency`와 `student_competency`를 모두 읽을 수 있다. 내부 다섯 키는 별도 camel 변환 없이 다음 snake_case 문자열을 정확히 참조한다 (`src/adapters/reportV2Mapper.ts:407-413`).

```ts
"reading"
"content_understanding"
"prompt_understanding"
"structure"
"expression"
```

Backend 감사의 키와 문자 단위로 일치하며 camelCase 잔존이나 오타가 없다.

정규화 규칙은 다음과 같다 (`src/adapters/reportV2Mapper.ts:415-431`).

- 값이 객체가 아니거나 객체 키가 0개이면 `{}`.
- 입력 객체가 non-empty라면 다섯 정규 키를 모두 생성.
- 원본 값이 `null`이면 `null` 유지.
- 유한한 JavaScript `number`이면 유지.
- 그 밖의 타입/누락 키는 `null`.

정수 JSON number `78`과 float 표기 `78.0`은 파싱 후 모두 JavaScript `number`이므로 둘 다 통과한다. 문자열 `"78"`은 의도적으로 null 처리된다. 제공된 Backend 계약에서는 문자열이 정상 경로에 없으므로 계약 위반이 아니라면 문제가 아니다. 특정 실응답이 문자열인지 여부는 Network 확인이 필요하다.

fixture도 `studentCompetency`를 `generatedReportV2` 바깥 최상위에 두고 snake_case 내부 키와 number 값을 사용한다 (`src/fixtures/contracts/report-v2.camel.json:57-63`). 테스트는 정상 값, 실제 0과 null의 구분, `{}`를 각각 검증한다 (`src/adapters/__tests__/reportV2Mapper.test.ts:69-104`).

### 4.4 empty 판정은 “다섯 값 모두 존재” 조건이 아니다

컴포넌트 판정은 다음 한 줄이다.

```ts
const hasCompetencySnapshot = Object.keys(studentCompetency ?? {}).length > 0;
```

근거: `src/components/organisms/result/UnivCompetencyComparison.tsx:51`.

따라서:

- `{}`/`null`/`undefined`: 전체 empty 안내.
- 키가 하나라도 존재: 레이더 렌더링.
- 다섯 키가 존재하고 값이 전부 null이어도: 레이더 분기이며 각 카드는 `미입력`.

실제 화면에서 **전체 안내 문구와 카드 5개 `미입력`이 동시에 보인다면**, 전달된 객체는 `{}`/null/undefined였음을 의미한다. 전체 안내는 `hasCompetencySnapshot === false`에서만 나오지만, 카드 목록은 분기 바깥에서 항상 다섯 개 생성되기 때문이다 (`src/components/organisms/result/UnivCompetencyComparison.tsx:123-206`). 이는 H3가 아니라 H1 계열의 빈 prop을 지지한다.

### 4.5 Result는 매퍼 결과를 그대로 전달한다

Result는 `result?.data`를 `generatedReportV2`로 두고 (`src/pages/Result/Result.tsx:48-54`), 별도 변환 없이 다음과 같이 전달한다.

```tsx
<UnivCompetencyComparison
  currentUniversity={currentProgram}
  currentUniversityList={recommendedPrograms}
  studentCompetency={generatedReportV2?.studentCompetency}
/>
```

근거: `src/pages/Result/Result.tsx:165-169`. 중간 필터나 다른 데이터 소스는 없다.

### 4.6 H4: 과거 스냅샷 여부

현재 report 타입에는 `metadata.analysisRunId`와 `metadata.generatedAt`가 정의되어 있다 (`src/types/reportPayloadV2.ts:146-155`). 그러나 fixture 외에 문제가 된 report의 값이나 학생 입력 저장 시각은 저장소에 없다. 브라우저 Network 접근도 불가능해 다음 비교는 수행하지 못했다.

1. 문제 report의 `metadata.analysisRunId`, `metadata.generatedAt` 확인.
2. 논술 역량 입력/저장 시각 또는 그 입력으로 생성된 analysis run ID 확인.
3. report의 run이 입력 이전이면 H4 확정: 새 분석이 필요하며 과거 report 재현성은 정상 동작.
4. report의 run이 입력 이후인데 `studentCompetency: {}`라면 이번에 확인한 제출 누락 H5로 재현 가능.

중요하게도 현재 frontend는 새 분석 요청에도 논술 역량을 싣지 않으므로, 단순히 “새 분석을 다시 돌린다”만으로 해결된다고 보장할 수 없다. 먼저 실제 request body 또는 Backend가 참조하는 별도 저장 경로를 확인해야 한다.

## 5. 감사 1 가설 검증표

| ID | 판정 | 핵심 근거 |
|---|---|---|
| H1 | 유력 | 전체 안내 조건은 빈 객체뿐이며, 제출 payload 누락이 Backend의 `{}`를 설명함 |
| H2 | 기각(현재 계약 기준) | 최상위 경로, fallback, 다섯 snake_case 키, number/null 처리 모두 계약과 일치 |
| H3 | 기각 | `Object.keys(...).length > 0`; 일부 키만 있어도 정상 레이더 분기 |
| H4 | 확인 필요 | 특정 report의 run/생성 시각과 입력 시각 부재 |
| H5 | 확정 | Step 2의 `essayInfo`가 Step 3 → contract → mapper → PUT body 전 구간에서 누락 |

## 6. 감사 1 최종 판정

분류상 단순한 조회 매핑 버그(H2)나 empty 판정 버그(H3)가 아니다. **Frontend 입력 제출 경로의 데이터 누락(H5)이 Backend/report 데이터 부재(H1)를 만드는 구조**가 확인됐다.

특정 report에 대해 H4가 동시에 참일 가능성은 남아 있다. 다만 새 report 생성 경로에서도 `essayInfo`가 전송되지 않는 현재 상태에서는, 사용자가 입력 후 즉시 새 분석을 만들었더라도 동일 증상이 발생할 수 있다.

## 7. 감사 2 — `미입력` 줄바꿈 원인

카드는 외부 가용 폭을 3열로 나눈다.

```tsx
<div className="flex-1 grid grid-cols-3 grid-rows-2 gap-3 w-full">
```

근거: `src/components/organisms/result/UnivCompetencyComparison.tsx:183`.

각 카드에는 `p-4`가 적용돼 좌우 내부 폭이 더 줄고 (`:185-188`), 점수 행은 다음처럼 한 줄 flex에서 라벨과 값을 양 끝에 놓는다.

```tsx
<div className="flex justify-between items-baseline">
  <span className="text-[10px] font-black text-primary">내 점수</span>
  <span className="text-xl font-black text-primary">...</span>
</div>
```

근거: `src/components/organisms/result/UnivCompetencyComparison.tsx:193-201`.

정상 숫자 `78.0`은 비교적 좁지만 한글 3글자 `미입력`은 같은 `text-xl`에서 더 넓다. 값 span에는 `whitespace-nowrap`, `break-keep`, `shrink-0`, 최소 폭이 없다. flex item은 기본적으로 축소될 수 있고 한국어는 글자 사이 줄바꿈 기회가 있으므로, 남은 폭이 부족할 때 브라우저가 `미입` / `력`으로 나눈다.

따라서 정확한 원인은 다음 조합이다.

- 고정 3열 카드로 인한 좁은 폭
- 카드의 `p-4`
- 같은 행의 `내 점수` 라벨이 차지하는 폭
- `미입력`에도 숫자와 동일한 `text-xl` 적용
- 값 span의 줄바꿈 금지 및 축소 방지 설정 부재

## 8. 다음 조치 제안 (수정은 수행하지 않음)

### 8.1 입력 데이터 단절

우선 실제 브라우저에서 새 analysis 생성 시 `PUT /api/v1/nonsulfit/input` request body를 확인한다. 다섯 역량이 없다면 정적 감사 결과가 런타임에서도 확정된다.

수정이 필요할 위치는 다음과 같다.

1. `src/contracts/analysisInput.ts`
   - Backend input 계약에 맞는 essay competency section을 `NonsulFormState` 및 `AnalysisInputPayload`에 정의.
2. `src/pages/Step/Step03.tsx:20`, `:79-90`
   - `essayInfo`를 context에서 읽고 매퍼 입력에 포함.
3. `src/adapters/analysisInputMapper.ts:13-48`
   - 다섯 점수와 선호/코멘트 필드를 Backend가 받는 정확한 키/중첩 구조 및 number 타입으로 매핑.
4. `src/adapters/__tests__/analysisInputMapper.test.ts` 및 analysis input fixtures
   - Step 2 값이 최종 payload에 존재한다는 회귀 테스트 추가.

Backend endpoint가 학생 역량을 분석 요청과 별도 저장하도록 설계됐다면, 위 payload 확장 대신 Step 2 완료 시 해당 저장 API를 호출해야 한다. 어느 방식을 택할지는 Backend의 실제 input endpoint 계약을 먼저 확인해야 한다.

### 8.2 스냅샷 시점 확정 절차

1. 하나의 신규 테스트 학생으로 다섯 값을 구분 가능한 값(예: 81/72/63/54/45)으로 입력.
2. 저장/분석 요청의 request body와 응답 `analysisRunId` 기록.
3. 완료 status가 돌려준 정확한 `reportId`로 report 조회.
4. report의 `metadata.analysisRunId/generatedAt`와 제출 run ID 비교.
5. `studentCompetency`가 입력값과 동일한지 확인.
6. 기존 report는 별도로 조회해 스냅샷 불변성 확인.

### 8.3 `미입력` 줄바꿈

가장 작은 수정 후보는 값 span에 `whitespace-nowrap shrink-0`를 추가하는 것이다. 좁은 breakpoint까지 고려하면 미입력일 때만 `text-base` 또는 `text-sm`로 낮추는 조건부 스타일도 병행할 수 있다. 카드 레이아웃을 유지해야 하므로 우선순위는 다음이 적절하다.

1. `whitespace-nowrap shrink-0`
2. 미입력 상태에만 조건부 폰트 축소
3. 필요 시 점수 행의 gap/라벨 크기 또는 카드 padding 미세 조정

수정 대상은 `src/components/organisms/result/UnivCompetencyComparison.tsx:193-201`이다.
