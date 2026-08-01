# Frontend 실사용 Endpoint 확정 및 500 응답 처리 감사

- 감사일: 2026-07-31
- 범위: Frontend 상세 리포트 조회 흐름
- 방식: Read-Only 코드 추적, 기존 테스트 확인, 운영 Endpoint 비인증 GET 확인
- 선행 사실: Backend 상세 리포트 조회가 alias 충돌로 HTTP 500을 반환하는 P0 버그가 별도로 확정되어 있음

## 요약 판정

| 질문 | 판정 |
|---|---|
| Frontend가 사용하는 상세 조회 client path | `GET /reports/{reportId}` |
| 저장소 `.env` 기준 실제 요청 URL | `GET https://nonsulfit-backend-python-production.up.railway.app/reports/{reportId}` |
| 제시된 후보 중 의미상 대응 경로 | Backend의 `GET /api/v1/reports/{reportId}` 상세 조회 |
| `/nonsulfit/result/{publicId}` 사용 여부 | Primary 상세 화면에서는 사용하지 않음. 미사용 legacy adapter에만 격리됨 |
| `/reports/{reportId}/canonical` 사용 여부 | 없음 |
| 500 수신 시 동작 | 기존 결과 제거 후 명시적 네트워크 오류 화면 표시 |
| 이전 cache/state 유지 | 없음 |
| 상세 조회 자동 재시도/polling | 없음 |
| Silent catch | 없음 |
| 최종 결론 | **NO** |

> **결론:** 확정된 500은 현재 Frontend에서 “이전 성공 리포트를 조용히 계속 표시”시키지 않는다. 상세 조회가 500으로 실패하면 이전 결과를 지우고 오류 화면을 표시한다. 따라서 이 500만으로는 “Golden Fixture를 수정해도 화면이 이전 상태 그대로”라는 증상을 설명할 수 없다.

## 1. 실사용 Endpoint 확정 결과

### 1.1 Primary 상세 화면 호출 체인

1. 상세 route는 `/result/:reportId`이며 `Result` 컴포넌트를 렌더링한다 (`src/App.tsx:31-37`).
2. `Result`는 route parameter `reportId`를 읽어 `useNonsulResult(reportId)`에 전달한다 (`src/pages/Result/Result.tsx:28-37`).
3. `useNonsulResult`는 `fetchReportDetail(reportId)`를 호출한다 (`src/hooks/useNonsulResult.ts:74-87`).
4. `fetchReportDetail`은 Axios client로 `GET /reports/${encodeURIComponent(reportId)}`를 한 번 호출한다 (`src/api/reports.ts:17-24`).
5. Axios `baseURL`은 `VITE_API_BASE_URL`이다 (`src/api/axios.ts:3-9`). 저장소 `.env:1` 값은 `https://nonsulfit-backend-python-production.up.railway.app`이므로 이 체크아웃에서 조합되는 URL은 `https://nonsulfit-backend-python-production.up.railway.app/reports/{reportId}`이다.

따라서 Frontend source가 직접 지정하는 실사용 URL 패턴은 **`GET /reports/{reportId}`**이다. Backend 또는 배포 proxy가 이 요청을 `/api/v1/reports/{reportId}` handler에 연결하는지는 Frontend 저장소만으로 확정할 수 없지만, 제시된 후보 중 상세 Report API에 대응하는 것은 `GET /api/v1/reports/{reportId}`이다.

### 1.2 다른 후보 경로

| 후보 | Primary 상세 화면 사용 여부 | 근거 |
|---|---|---|
| `GET /api/v1/reports/{reportId}` | Frontend client path는 `/reports/{reportId}`. Backend 내부 prefix/route 대응은 Frontend만으로 미확인 | `src/api/reports.ts:17-24`, `src/api/axios.ts:3-9` |
| `GET /api/v1/nonsulfit/result/{publicId}` | 사용하지 않음 | legacy 함수는 `src/adapters/legacyApi.ts:15-17`에만 있고 Primary 호출 체인에서 import/호출되지 않음 |
| `GET /api/v1/nonsulfit/result` | 상세 화면에서 사용하지 않음 | legacy 목록 함수만 `src/adapters/legacyApi.ts:10-12`에 존재 |
| `GET /api/v1/reports/{reportId}/canonical` | 구현/호출 없음 | `src/api/reports.ts:17-24`; 저장소 검색 결과 없음 |

목록 화면도 새 Report API인 `GET /reports`를 사용하며, 선택한 항목의 `reportId`로 `/result/{reportId}`에 이동한다 (`src/api/reports.ts:9-15`, `src/pages/Result/ResultList.tsx:124-140`). `publicId`를 상세 조회에 대입하는 fallback은 이 경로에 없다.

## 2. 500 응답 처리 로직

HTTP 500이 발생했을 때의 실제 상태 전이는 다음과 같다.

1. Axios 응답 interceptor는 401만 refresh/retry 대상으로 취급한다 (`src/api/axios.ts:34-74`).
2. 500은 별도 변환이나 fallback 없이 `Promise.reject(error)`로 반환된다 (`src/api/axios.ts:76`).
3. `fetchReportDetail`의 `await api.get(...)`이 reject되므로 mapper는 실행되지 않는다 (`src/api/reports.ts:20-24`).
4. `useNonsulResult`의 catch가 오류를 받는다 (`src/hooks/useNonsulResult.ts:79-97`).
5. catch에서 `result`를 `null`로 설정하고 `networkError`에 오류를 저장한다 (`src/hooks/useNonsulResult.ts:92-96`).
6. `Result`는 `networkError`를 `ContractError("NETWORK_ERROR")`로 변환한다 (`src/pages/Result/Result.tsx:37-43`).
7. `contractError`가 최우선 렌더 분기이므로 기존 리포트 UI 대신 `ContractErrorState`를 렌더링한다 (`src/pages/Result/Result.tsx:104-120`).
8. 사용자에게 “연결 상태를 확인해 주세요. 서버와 통신하는 중 문제가 발생했습니다.”가 표시된다 (`src/components/organisms/common/ContractErrorState.tsx:32-35,38-60`).

따라서 판정은 **에러 표시**이다. 500을 성공 응답, legacy endpoint 응답 또는 기존 화면 데이터로 대체하는 분기는 없다.

## 3. Stale State 잔존 여부

### 판정: 남아있지 않음

상세 데이터는 React Query cache나 전역 store가 아니라 `useNonsulResult` 내부 component state에만 저장된다 (`src/hooks/useNonsulResult.ts:62-69`). 요청을 시작할 때 아래 상태 초기화가 먼저 실행된다.

- `setIsLoading(true)`
- `setNetworkError(null)`
- `setResult(null)`

근거는 `src/hooks/useNonsulResult.ts:74-77`이다. 요청 실패 catch에서도 다시 `setResult(null)`을 실행한다 (`src/hooks/useNonsulResult.ts:92-96`). 그러므로 다음 두 경우 모두 이전 성공 결과는 렌더 state에서 제거된다.

- 같은 상세 컴포넌트에서 `reportId`가 바뀌어 새 요청이 시작되는 경우
- 새 요청이 500으로 실패하는 경우

기존 테스트 `stale cache replacement test`도 요청 전에 `setResult(null)`이 존재하고 effect가 `reportId`에 의존하는지를 정적으로 검증한다 (`src/adapters/__tests__/frontendContractConsumption.test.ts:93-104`).

단, **열려 있는 동일 `reportId` 화면은 서버 데이터가 바뀌었다는 이유만으로 자동 재조회하지 않는다.** effect 의존성이 `[reportId]`뿐이므로 route parameter가 그대로인 동안에는 이미 메모리에 로드된 결과가 계속 보인다 (`src/hooks/useNonsulResult.ts:71-109`). 이는 “서버 Fixture 수정 후 화면을 reload/navigation하지 않았다”는 조건에서는 이전 화면이 유지될 수 있다는 뜻이다. 하지만 이 현상은 500 fallback이 아니라 **자동 refetch가 없는 별도 동작**이다. 새 조회가 실제로 시작되면 이전 결과는 즉시 제거된다.

## 4. 재시도 및 polling 동작

### 상세 리포트 GET

- `useNonsulResult`는 mount 또는 `reportId` 변경 시 한 번만 조회한다 (`src/hooks/useNonsulResult.ts:71-109`).
- 500에 대한 자동 재시도, retry counter, interval, polling, 다른 endpoint fallback은 없다.
- Axios interceptor의 유일한 자동 재시도는 401 access token refresh 성공 후 동일 요청을 한 번 다시 보내는 경로다 (`src/api/axios.ts:39-68`).
- 500은 interceptor 마지막 reject로 즉시 종료된다 (`src/api/axios.ts:76`).
- 오류 UI의 “다시 시도하기” 버튼은 동일 상세 GET을 재호출하지 않고 `/result` 목록으로 이동한다 (`src/pages/Result/Result.tsx:108-112`, `src/components/organisms/common/ContractErrorState.tsx:51-58`).

### 분석 상태 polling과의 구분

`useAnalysisPolling`에는 3초 간격, 최대 3회 연속 오류, 120초 timeout 로직이 있지만 이는 분석 상태 endpoint용이다 (`src/hooks/useAnalysisPolling.ts:22-46,57-69,79-133`). 상세 리포트 `GET /reports/{reportId}`에는 적용되지 않는다.

### 최종 귀결

상세 GET이 500이면 **같은 500을 자동 재시도하지 않고 오류 UI에서 정지**한다. 다른 endpoint나 이전 cache로 귀결되지 않는다.

## 5. Silent Catch 발견 여부

### 판정: 없음

상세 조회 오류는 catch되지만 조용히 무시되지 않는다.

- catch에서 `networkError` state를 설정한다 (`src/hooks/useNonsulResult.ts:92-96`).
- `Result`가 이를 명시적인 `NETWORK_ERROR`로 변환한다 (`src/pages/Result/Result.tsx:39-43`).
- `ContractErrorState`가 사용자용 오류 제목과 설명을 렌더링한다 (`src/pages/Result/Result.tsx:108-112`, `src/components/organisms/common/ContractErrorState.tsx:32-35,42-60`).

Axios interceptor 역시 500을 삼키지 않고 reject한다 (`src/api/axios.ts:76`). legacy detail, canonical detail, fixture fallback을 시도하는 silent catch도 발견되지 않았다.

## 6. Golden Fixture 66669 케이스 재현 결과

### 판정: 500 실브라우저 재현은 확인 불가

2026-07-31 저장소 `.env`의 운영 base URL에 인증 정보 없이 다음 read-only 요청을 수행했다.

```text
GET https://nonsulfit-backend-python-production.up.railway.app/reports/66669
```

응답은 `HTTP 401`, `Content-Type: application/json`이었다. 유효한 사용자 인증 session이 감사 환경에 제공되지 않았으므로, 인증 후 Backend handler까지 도달하여 선행 확정 사실인 500을 다시 관측하거나 브라우저에서 66669의 이전 성공 데이터를 먼저 적재한 뒤 500 전환을 재현할 수 없었다.

다만 500을 Axios rejection으로 주입했을 때의 상태 전이는 코드상 단일 경로이며, status별 500 전용 예외나 fallback이 없다. 따라서 인증된 요청이 선행 사실대로 500을 반환하면 다음 결과가 확정적으로 이어진다.

```text
500 reject
→ useNonsulResult catch
→ result = null
→ networkError 설정
→ ContractErrorState 표시
```

즉, “500을 받고도 이전 데이터가 화면에 남는 상황”은 현재 구현에서 **재현되지 않을 구조**다. 실제 500 응답 자체의 독립 재현만 인증 부재로 확인 불가다.

## 7. 최종 결론

### **NO — 이 500은 원래 증상의 Root Cause가 아니다**

근거:

1. Primary 상세 화면은 새 Report API client의 `GET /reports/{reportId}`만 호출한다.
2. 500은 interceptor에서 그대로 reject되고 다른 endpoint로 fallback되지 않는다.
3. 요청 시작 전과 실패 catch 양쪽에서 기존 `result`를 `null`로 초기화한다.
4. 실패 시 리포트 UI가 아니라 명시적인 네트워크 오류 화면을 표시한다.
5. 상세 조회에는 stale-while-error cache, 자동 재시도 또는 polling이 없다.

따라서 사용자가 실제로 “이전 상태 그대로인 리포트 화면”을 보았다면, 그 관찰 시점에는 다음 중 별도 원인을 조사해야 한다.

- 동일 상세 화면을 계속 열어 둔 상태여서 `[reportId]` effect가 재실행되지 않음
- 수정한 Golden Fixture와 실제 `reportId`/DB row/배포 환경이 다름
- Frontend가 접속한 배포의 `VITE_API_BASE_URL`이 감사한 `.env`와 다름
- CDN/browser cache가 애플리케이션 bundle 또는 문서를 유지함
- Backend가 500이 아닌 다른 성공 경로에서 이전 snapshot을 반환함

이 후보들은 이번 감사에서 원인으로 확정하지 않았으며, 후속 조사 대상이다.
