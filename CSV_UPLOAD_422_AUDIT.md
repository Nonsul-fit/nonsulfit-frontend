# CSV Upload 422 Integration Audit

감사일: 2026-07-27

## 결론

프론트엔드의 운영 `VITE_API_BASE_URL`은 호스트까지만 포함하지만 CSV 함수는
`/nonsulfit/input/csv`를 사용했다. 따라서 관측된 최종 요청은 확정 계약인
`/api/v1/nonsulfit/input/csv`에서 `/api/v1`이 누락됐다.

운영 백엔드는 현재 기존 프론트엔드를 위한 임시 compatibility router도 함께
등록하므로 누락 경로가 즉시 404가 되지는 않는다. 그러나 이 경로는 OpenAPI에
포함되지 않은 임시 경로이며 확정 계약 위반이다. 프론트엔드 호출을 canonical
경로로 최소 수정했다.

## H1. Request URL — 계약 위반 확인, 수정

- 프론트 운영 baseURL:
  `https://nonsulfit-backend-python-production.up.railway.app`
- 수정 전 실제 URL:
  `POST /nonsulfit/input/csv?triggerAnalysis=false`
- 수정 후 실제 URL:
  `POST /api/v1/nonsulfit/input/csv?triggerAnalysis=false`
- 백엔드 등록: `app.include_router(api_router, prefix="/api/v1")`
- 무 prefix router는 `include_in_schema=False`인 임시 호환 경로다.

## H2. Query Parameter — 일치

FastAPI 선언은
`trigger_analysis: bool = Query(default=True, alias="triggerAnalysis")`다.
boolean이며 optional이다. 프론트의
`params: { triggerAnalysis: false }`는 계약과 일치하고 분석을 실행하지 않는다.

## H3. multipart field name — 일치

FastAPI 선언은 `file: UploadFile = File(...)`이다. 프론트도
`FormData.append("file", file)`을 사용한다. 임의 필드명이나 DTO body는 없다.

## H4. Content-Type — 위반 없음

프론트는 실제 `FormData`를 Axios에 전달하며 `Content-Type`을 요청별로 강제
지정하지 않는다. Axios/browser가 `multipart/form-data; boundary=...`를
생성한다. 공통 client의 JSON 기본값이 있어도 Axios의 FormData 변환 단계에서
boundary 포함 multipart header로 정규화된다. 수동 boundary 지정은 추가하지
않았다.

## H5. File 객체 — 일치

선택된 브라우저 `File` 객체 자체를 append한다. `file.name`,
`JSON.stringify(file)`, 문자열 또는 프론트 CSV 파싱 결과를 전송하지 않는다.

## H6. Authorization — 일치

CSV 함수는 공통 `api` client를 사용한다. request interceptor가
`localStorage.accessToken`을 읽어 `Authorization: Bearer <token>`을 추가한다.
동일 운영 endpoint를 무인증 호출한 재검증 응답은 401
`INVALID_ACCESS_TOKEN`이므로 관측된 422는 Authorization 누락의 응답이 아니다.

## H7. Request/Validation 증거

- Query: `triggerAnalysis=false`
- Form Data: `file=(선택된 CSV File binary)`
- 예상 Content-Type: `multipart/form-data; boundary=<browser-generated>`
- 공통 오류 형식:
  `{ success: false, error: { code, message, details, fields } }`

백엔드는 FastAPI 기본 `detail/loc/msg/type`을 그대로 반환하지 않고
`RequestValidationError`도 위 공통 형식의 `error.fields`로 변환한다. 제공된
관측 자료에는 422 response body가 없으므로 특정 CSV validation code를
추가로 단정하지 않았다. 확인된 전송 계약 위반은 URL prefix 누락 한 건이다.

## H8. Backend Contract — 확인

- Endpoint: `POST /api/v1/nonsulfit/input/csv`
- Body: multipart, required field `file: UploadFile`
- Query: optional boolean `triggerAnalysis`, default `true`
- Response: `CsvInputImportResponse`
- 역량 위치: `input.essayCompetency`
- 비실행 응답: `analysis`, `analysisRunId`, `status` 모두 null

백엔드 테스트의 동일 요청은 UTF-8 BOM CSV, `file` field,
`triggerAnalysis=false` 조합으로 200을 검증한다.

## Root Cause 및 수정

Root Cause는 호스트 전용 baseURL과 prefix 없는 CSV 상대 경로 조합으로 최종
요청에서 `/api/v1`이 누락된 것이다. `src/api/csvInput.ts`의 상대 경로만
canonical 경로로 수정했다. multipart, field name, query 전달 및 공통 API
client는 계약과 일치하므로 변경하지 않았다.

## 재검증 결과

- 최종 URL contract test 통과
- CSV adapter/오류 envelope test 통과
- 전체 테스트 통과
- TypeScript build 통과
- 변경 파일 ESLint 통과
- `git diff --check` 통과
