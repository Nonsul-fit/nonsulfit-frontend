# CSV Upload File Field Audit

감사일: 2026-07-27

## 결론

선택된 `File`과 `FormData.append("file", file)`은 정상이었다. 그러나 공통 Axios
client의 기본 `Content-Type: application/json` 때문에 Axios transform 단계가
FormData를 JSON으로 변환했다. 실제 XHR body는 multipart가 아니라
`{"file":{}}`였고, FastAPI가 multipart `file` field를 받지 못해
`Field required`를 반환했다.

## H1. FormData 생성

`uploadCsvInput`에서 브라우저 native `FormData`가 매 호출마다 생성된다.

```text
body instanceof FormData (api.post 직전): true
```

## H2. append와 File 상태

불러오기 버튼 클릭 직전 런타임 기록:

```text
file instanceof File: true
file.name: field-audit.csv
file.size: 122
file.type: text/csv
FormData key: file
FormData value: 동일 File 객체
```

`null`, `undefined`, 빈 배열 또는 filename 문자열 전달은 없었다.

## H3. api.post 두 번째 인자

`api.post(url, body, config)`의 두 번째 인자는 append가 완료된 native
`FormData`였다. 일반 object나 명시적 JSON을 전달하는 호출 코드는 없다.

## H4. API Client 변환

공통 client는 생성 시 모든 요청에 다음 기본 header를 지정했다.

```text
Content-Type: application/json
```

request interceptor는 Authorization만 추가하고 body를 바꾸지 않는다.
별도 `transformRequest`도 없다. 하지만 Axios 기본 transform은 JSON
Content-Type과 FormData 조합을 JSON 직렬화 대상으로 처리했다.

## H5. 실제 Network Payload

수정 전 `XMLHttpRequest.send` 경계에서 기록한 실제 값:

```text
HTTP method: POST
Content-Type: application/json
body type: [object String]
body: {"file":{}}
```

즉 Chrome Network의 요청은 `Form Data / file (binary)`가 아니라 JSON Request
Payload였다. 백엔드 응답의 `field: file, message: Field required`와 정확히
일치한다.

## H6. File Input 전달 경로

```text
input.files[0]
→ handleFileChange의 file
→ React csvFile state
→ handleCsvUpload의 csvFile
→ uploadCsvInput(file)
→ FormData.append("file", file)
```

각 경계에서 동일한 `File`의 name, size, type이 유지됐다. state 전달은 Root
Cause가 아니다.

## Root Cause

공통 Axios client의 JSON 기본 Content-Type이 multipart 요청에도 유지되어
Axios가 FormData를 `{"file":{}}` JSON 문자열로 변환한 것이 Root Cause다.

## 수정 파일과 이유

- `src/api/csvInput.ts`: CSV 요청에서만 JSON 기본 header를 해제했다.
- `src/adapters/__tests__/csvAndDeleteUi.contract.test.ts`: multipart 요청이 JSON
  기본 header를 상속하지 않도록 회귀 검증을 추가했다.

`multipart/form-data`를 문자열로 강제 지정하지 않았다. Content-Type을
`undefined`로 넘겨 브라우저가 실제 boundary를 포함한 multipart header를
생성하도록 했다. 다른 JSON API의 공통 client 동작은 변경하지 않았다.

## 재검증 결과

수정 후 CSV 요청의 `XMLHttpRequest.send` body는 native FormData이며,
`file` entry 값은 binary File이다. XHR 코드가 Content-Type을 수동 설정하지
않으므로 브라우저 전송 계층이 `multipart/form-data; boundary=...`를 생성한다.
build, 전체 테스트, 변경 파일 lint 및 diff 검사를 통과했다.
