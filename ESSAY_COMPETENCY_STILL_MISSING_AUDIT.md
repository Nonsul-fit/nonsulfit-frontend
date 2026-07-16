# Essay Competency Still Missing Audit

- 감사일: 2026-07-16
- 대상 브랜치/HEAD: `main` / `7e7c9704d0c07d75c34a725ed9d42aa1009d410b`
- 범위: 조사 및 리포트 작성만 수행. 제품 코드는 수정하지 않음.
- 런타임 제약: 이 세션에서는 문제가 발생한 브라우저의 Network 응답, Backend 로그 및 데이터베이스에 접근할 수 없었다.

## 1. 요약 결론

이전 수정은 현재 `main`에 실제로 반영되고 커밋되어 있다. 로컬 추적 상태에서 `main`과 `origin/main`은 모두 `7e7c970`을 가리키며 작업 트리의 해당 세 파일은 `main`과 차이가 없다.

현재 frontend 코드와 mapper 직접 실행 결과를 기준으로 다음을 확인했다.

- Step3는 `essayInfo`를 읽고 매퍼에 전달한다.
- 필수 처리는 다섯 역량 점수에만 적용된다.
- 도표/영어/수학 선호도는 Step2가 실제로 수집하며 mapper에서는 optional이다.
- 정상 Step2 값을 넣어 직접 실행한 최종 payload에는 `essayCompetency`가 존재한다.
- Backend 입력 스키마로 제시된 `reading`, `contentUnderstanding`, `promptUnderstanding`, `structure`, `expression` 필드명이 정확히 출력된다.
- 매퍼 예외가 발생하면 HTTP 요청 전 동기적으로 중단되므로, 예외가 조용히 흡수되어 역량만 빠진 payload가 전송되는 경로는 없다.

따라서 저장소 정적 감사와 로컬 payload 재현만으로는 H1(미반영), H2(선호도 필수 예외), H3(입력 필드명 불일치)를 기각할 수 있다.

그러나 특정 report의 실제 request/response가 없으므로 H4(과거 analysis run/report를 조회)와 새로 추가한 H5(배포본 불일치 또는 Backend가 `essayCompetency`를 저장/스냅샷에 반영하지 않음)는 최종적으로 구분할 수 없다. 현재 증상이 최신 코드에서 생성된 새 run에서 발생했다는 사용자 관찰이 정확하다면, 남는 가장 유력한 조사 대상은 Backend의 `PUT /nonsulfit/input` 수신 이후 저장 및 report `studentCompetency` 생성 구간이다.

## 2. 가설과 예측

| ID | 가설 | 예측 |
|---|---|---|
| H1 | 이전 수정이 현재 브랜치/커밋에 없음 | HEAD의 Step3/contract/mapper에 `essayInfo` 또는 `essayCompetency`가 없음 |
| H2 | 선호도 등에 `requireNumber`가 걸려 mapper가 실패하고 조용히 제출됨 | 정상 Step2 값에서도 매퍼가 예외를 던지거나, 예외 후 역량 없는 요청이 전송됨 |
| H3 | Backend 입력 필드명과 payload 필드명이 불일치 | 직접 생성한 payload에 legacy/snake_case 키가 출력됨 |
| H4 | 실제 화면이 입력 이전 analysis run의 report를 조회 | 완료된 새 run의 report ID와 화면 URL의 report ID가 다름 |
| H5 | 최신 frontend가 아닌 배포본을 사용하거나 Backend가 입력을 저장/report 스냅샷으로 전달하지 않음 | 배포 asset commit 불일치, 또는 request에는 값이 있지만 report 응답은 `{}`/null |

## 3. 1단계 — 수정 사항 반영 여부

### 3.1 Git 상태

감사 시점의 최근 커밋은 다음과 같다.

```text
7e7c970 fix:리포트 기반 수정
9c4a2a2 feat:오각형 레디어 부분 추가
e1347a3 audit:frontend&Backend 코드 감사
```

`git branch -vv` 결과는 다음과 같다.

```text
* main 7e7c970 [origin/main] fix:리포트 기반 수정
```

`git diff main -- src/pages/Step/Step03.tsx src/adapters/analysisInputMapper.ts src/contracts/analysisInput.ts`는 출력이 없었다. 즉 변경은 미커밋 working tree에만 있는 것이 아니라 현재 `main`에 포함되어 있다.

커밋 `7e7c970`은 다음 관련 파일을 포함한다.

- `src/pages/Step/Step03.tsx`
- `src/adapters/analysisInputMapper.ts`
- `src/contracts/analysisInput.ts`
- mapper/flow 테스트와 fixture

커밋 시각은 2026-07-16 11:40:23 +0900이다.

주의: `[origin/main]`은 로컬 remote-tracking ref가 HEAD와 같다는 의미다. 이번 감사에서 `git fetch`나 실제 배포 플랫폼 조회는 수행하지 않았으므로, 배포 환경이 이 커밋을 빌드해 서비스 중이라는 것까지 증명하지는 않는다.

### 3.2 Step3 반영 코드

Step3는 context에서 `essayInfo`를 읽는다.

```tsx
const { studentInfo, essayInfo, academicInfo, setAcademicInfo } =
  useFormContext();
```

근거: `src/pages/Step/Step03.tsx:20-21`.

매퍼 입력에도 그대로 포함한다.

```tsx
const payload = mapFormToAnalysisInput({
  studentInfo: { ... },
  essayInfo,
  academicInfo: { ... },
});
```

근거: `src/pages/Step/Step03.tsx:80-90`.

**H1 판정: 기각.** 현재 브랜치에는 이전 수정이 반영되어 있다.

## 4. 2단계 — `requireNumber`와 optional 선호도

mapper는 다음 다섯 필드에만 `requireNumber`를 적용한다.

- `reading`: `src/adapters/analysisInputMapper.ts:35-38`
- `contentUnderstanding`: `:39-42`
- `promptUnderstanding`: `:43-46`
- `structure`: `:47-50`
- `expression`: `:51-54`

이 값은 Step2에서도 필수 검증 대상이다 (`src/pages/Step/Step02.tsx:17-32`).

선호도는 `requireNumber`가 아니라 `optionalNumberField`를 사용한다.

- `chart_score` → `chartPreference`: `src/adapters/analysisInputMapper.ts:55-58`
- `english_passage_score` → `englishPreference`: `:59-62`
- `math_question_score` → `mathPreference`: `:63-66`

`optionalNumberField`는 값이 없으면 빈 객체를 반환해 해당 키를 생략한다 (`src/adapters/analysisInputMapper.ts:241-245`). 예외를 던지지 않는다.

또한 Step2는 이 세 값을 실제로 수집한다.

- `chart_score`: `src/pages/Step/Step02.tsx:76`
- `english_passage_score`: `:77`
- `math_question_score`: `:78`
- 선택 버튼이 1/2/3 number를 저장: `:89-105`

따라서 “Step2가 수집하지 않는 선호도에 필수 처리가 걸려 정상 제출이 실패한다”는 전제가 현재 코드와 일치하지 않는다.

**H2 판정: 기각.** 정상 Step2 입력에서 선호도 때문에 `requireNumber` 예외가 발생하지 않는다.

## 5. 3단계 — 예외 발생 시 상위 처리

Step3의 순서는 다음과 같다 (`src/pages/Step/Step03.tsx:80-109`).

```text
mapFormToAnalysisInput(...)  // 동기 호출
        ↓ 성공 시
submitAnalysisInput(payload) // Promise
        ↓
.then(...).catch(...)
```

`mapFormToAnalysisInput`은 `try/catch` 안에 있지 않다. 뒤의 `.catch`는 `submitAnalysisInput`이 반환한 Promise만 처리하므로 mapper가 동기적으로 던지는 `AnalysisInputValidationError`를 잡지 못한다.

그 결과 필수 다섯 값 중 하나가 없다면:

1. payload 생성이 중단된다.
2. `submitAnalysisInput`은 호출되지 않는다.
3. analysis run ID가 설정되지 않는다.
4. `/loading`으로 이동하지 않는다.

이는 사용자 경험 측면에서 별도 오류 표시가 부족한 문제지만, “예외가 조용히 흡수되어 essayCompetency만 빠진 요청이 전송된다”는 경로는 아니다. 반대로 실제로 새 analysis run이 생성되고 완료 report로 자동 이동했다면 mapper는 성공했다고 보는 것이 타당하다.

HTTP 요청 자체가 실패한 경우에는 Promise `.catch`가 `serverError`를 설정한다 (`src/pages/Step/Step03.tsx:97-108`). 이 경우에도 새 run/report로 이동하지 않는다.

## 6. 4단계 — 실제 request body 재현

다음 Step2 값으로 `mapFormToAnalysisInput`을 직접 실행했다.

```text
reading=81
content_understanding=72
prompt_understanding=63
structure=54
expression=45
chart_score=3
english_passage_score=2
math_question_score=1
feedback="오늘 입력"
```

생성된 `essayCompetency`는 다음과 같다.

```json
{
  "reading": 81,
  "contentUnderstanding": 72,
  "promptUnderstanding": 63,
  "structure": 54,
  "expression": 45,
  "chartPreference": 3,
  "englishPreference": 2,
  "mathPreference": 1,
  "comment": "오늘 입력"
}
```

`submitAnalysisInput`은 이 payload를 별도 가공 없이 `api.put("/nonsulfit/input", payload)`의 JSON body로 전달한다 (`src/api/analysis.ts:31-35`). Axios 인스턴스의 base URL은 `VITE_API_BASE_URL`이며 JSON content type을 사용한다 (`src/api/axios.ts:3-9`).

Backend 입력 스키마로 제공된 필드명과 정확히 일치한다. legacy 출력 전용인 `contentComprehension`, `understanding`, `express`는 생성되지 않는다.

**H3 판정: 제공된 Backend 스키마 기준 기각.** Frontend가 만드는 request key에는 불일치가 없다.

## 7. 5단계 — analysis run과 report 연결

정상 신규 분석 흐름은 다음과 같다.

1. `PUT /nonsulfit/input` 응답에서 `analysisRunId`를 받음 (`src/api/analysis.ts:31-39`).
2. Step3가 이 ID를 context와 `/loading` route state에 저장 (`src/pages/Step/Step03.tsx:92-95`).
3. LoadingPage가 해당 run ID를 polling hook에 전달 (`src/pages/Loading/LoadingPage.tsx:15-21`).
4. status endpoint 응답의 `analysisRunId`와 `reportId`를 읽음 (`src/adapters/analysisStatusMapper.ts:28-50`).
5. `COMPLETED`가 되면 그 응답의 `reportId`로 `/result/:reportId`에 이동 (`src/pages/Loading/LoadingPage.tsx:29-37`).

즉 frontend 코드에는 새 run을 만들고도 임의로 과거 report ID로 이동하는 명시적 fallback이 없다. status API가 정확한 새 report ID를 반환한다면 새 report로 이동한다.

다만 다음 런타임 증거가 없어 특정 사건의 H4는 확정/기각할 수 없다.

- `PUT /nonsulfit/input` 응답의 analysisRunId
- status polling 응답의 analysisRunId/reportId
- 실제 화면 URL의 reportId
- `GET /reports/{reportId}` 응답의 `metadata.analysisRunId`, `generatedAt`, `studentCompetency`

**H4 판정: 확인 필요.** 코드상 과거 report 선택 경로는 없지만, 실제 ID 연쇄를 확보하지 못했다.

## 8. report 조회 및 UI가 의미하는 상태

report mapper는 응답 최상위의 `studentCompetency`를 우선 읽는다 (`src/adapters/reportV2Mapper.ts:103-118`). 다섯 내부 키는 다음 snake_case를 정확히 사용한다 (`src/adapters/reportV2Mapper.ts:407-430`).

- `reading`
- `content_understanding`
- `prompt_understanding`
- `structure`
- `expression`

UI는 각 값이 유한한 number가 아니면 `null`로 간주해 `미입력`으로 표시한다 (`src/components/organisms/result/UnivCompetencyComparison.tsx:44-59`, `:197-201`).

따라서 카드 5개가 전부 `미입력`이라는 사실만으로는 다음 두 응답을 구분할 수 없다.

1. `studentCompetency: {}` 또는 필드 자체 부재
2. 다섯 키는 있지만 값이 모두 `null` 또는 number가 아닌 타입

전체 왼쪽 안내까지 함께 표시된다면 `Object.keys(studentCompetency ?? {}).length === 0`이므로 mapper 결과는 빈 객체다 (`src/components/organisms/result/UnivCompetencyComparison.tsx:51`, `:123-180`). 왼쪽 레이더 틀은 나오지만 카드만 미입력이라면 non-empty 객체의 값들이 null/invalid일 가능성이 높다.

## 9. 가설 검증표

| ID | 판정 | 근거 |
|---|---|---|
| H1: 이전 수정 미반영 | **기각(저장소 기준)** | `main`/로컬 `origin/main`이 수정 커밋 `7e7c970`; 관련 코드가 HEAD에 존재 |
| H2: 선호도 필수 예외 후 조용히 제출 | **기각** | 선호도는 optional; mapper 예외는 HTTP 요청 전에 발생하며 Promise catch 대상이 아님 |
| H3: Backend 입력 필드명 불일치 | **기각(제공 스키마 기준)** | 직접 재현 payload가 정확한 camelCase 키를 포함 |
| H4: 과거 run/report 조회 | **확인 필요** | 코드상 새 status의 report ID로 이동하지만 특정 런타임 ID 연쇄가 없음 |
| H5: 배포/Backend 저장·스냅샷 구간 | **유력, 확인 필요** | frontend payload는 정상인데 report UI는 값 부재를 관측; 양 endpoint의 실제 body가 필요 |

## 10. 최종 결론

요청에서 제시한 네 분류 중 저장소 증거로 확정할 수 있는 내용은 다음과 같다.

- **반영 안 됨(H1): 아님.** 수정은 `main`의 `7e7c970`에 커밋되어 있다.
- **예외로 조용히 실패(H2): 아님.** optional 선호도는 예외를 만들지 않고, 필수값 예외는 제출 자체를 막는다.
- **필드명 재불일치(H3): 아님.** 제공된 OpenAPI 필드와 직접 재현 payload가 일치한다.
- **스냅샷 시점 문제(H4): 특정 report에 대해서는 확인 필요.** 코드만으로 실제 run ID를 증명할 수 없다.

따라서 “오늘 최신 코드로 신규 run을 실제 생성했고 그 run이 반환한 report를 보고 있다”는 전제가 Network ID로 확인된다면, 원인은 frontend mapper 이후에 있다. 가장 유력한 남은 경로는 Backend가 `essayCompetency` 입력을 저장하지 않거나, analysis run/report snapshot의 `studentCompetency`로 복사하지 않는 구간이다. 배포가 실제로 `7e7c970`을 서비스하는지도 별도로 확인해야 한다.

현 증거만으로 H4와 H5 중 하나를 단정하는 것은 불가능하다. 특정 report의 Network 자료 없이 H4를 “확정”이라고 쓰는 것은 감사 근거를 넘어선다.

## 11. 다음 조치 제안

코드 수정 전에 동일 사용자 흐름에서 다음 네 응답을 하나의 타임라인으로 보존한다.

1. `PUT /api/v1/nonsulfit/input`
   - Request body의 `essayCompetency` 전체
   - Response의 `analysisRunId`
2. `GET /api/v1/nonsulfit/analyses/{analysisRunId}/status`
   - 최종 `analysisRunId`, `status`, `reportId`
3. 브라우저가 이동한 `/result/{reportId}`의 ID
4. `GET /api/v1/reports/{reportId}`
   - `metadata.analysisRunId`, `metadata.generatedAt`
   - 최상위 `studentCompetency` 원문과 각 값의 JSON 타입

판정 방법:

- 1번 request에 `essayCompetency`가 없으면 배포본이 `7e7c970` 이전이거나 frontend build/deploy 문제다.
- 1번에는 값이 있고 4번이 `{}`/null이면 Backend 저장 또는 snapshot 생성 문제다.
- 2번 report ID와 3/4번 report ID가 다르면 H4 또는 화면 이동/사용자 선택 문제다.
- ID가 모두 같지만 `metadata.analysisRunId`가 다르면 Backend report 연결 문제다.
- 4번에 정상 number가 있는데 UI만 미입력이면 그때 report mapper를 실제 원문 shape 기준으로 다시 감사한다.

배포 검증 시에는 배포 플랫폼의 build commit SHA가 `7e7c9704d0c07d75c34a725ed9d42aa1009d410b`인지 확인한다. 로컬 `origin/main` 일치만으로 배포 완료를 대신 판단하면 안 된다.

