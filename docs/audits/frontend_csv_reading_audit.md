# Frontend CSV Reading / Hydration Failure Audit

- Audit date: 2026-08-05 (Asia/Seoul)
- Scope: `nonsulfit-frontend` HEAD `ce3c94a`; backend contract evidence from adjacent `nonsulfit-backend-python` HEAD `92ea062`
- Constraint: production code was not changed. This document is the only repository change.
- Verdict: **A fresh Step01 → Step02 journey cannot satisfy the CSV API's existing-input precondition. This is a CONFIRMED P0 failure boundary.** Once an existing backend input exists, the canonical backend response maps and hydrates all six fields correctly by code path and mapper fixtures; no overwrite effect was found. Actual React DOM hydration is not covered by a behavioral test.

## Most likely causes

1. **CONFIRMED — P0: fresh-flow API precondition mismatch.** Step01 only updates React context and navigates. The first backend save is performed from Step03, after the CSV control in Step02. The backend CSV route calls `StudentService.get_payload` before parsing/merging and returns `404 STUDENT_INPUT_NOT_FOUND` when no saved input exists. Reproduction is already executable in `tests/test_nonsulfit_csv_api.py:109-128`.
2. **CONFIRMED behavior / SUSPECTED production applicability — P2: legacy response aliases are not read by the CSV mapper.** A response containing `contentComprehension`, `understanding`, and `express` maps those three fields to `null`, then `selectCsvCompetency` rejects the entire hydration. The audited backend serializes canonical `contentUnderstanding`, `promptUnderstanding`, and `expression`, so this is not the current canonical backend's output.
3. **CONFIRMED test gap — P3: mapper-to-DOM hydration has no behavioral test.** The only Step02 test uses source regex assertions. It cannot detect an event, rerender, provider remount, or controlled-input regression. Static evidence shows a single functional merge and no overwrite effect, so an actual UI overwrite remains **SUSPECTED only**, not confirmed.

## Data flow and checkpoints

| Boundary | Actual field/value shape | Type / nullable | Fallback or rejection | Reproduction result |
|---|---|---|---|---|
| File → upload handler | `input.files[0]` → `csvFile`; `.csv` extension required | `File \| null` | no file: idle; wrong extension: local error | Request construction contract test passes; prior runtime audit recorded the same `File` through append (`src/pages/Step/Step02.tsx:41-58`, `CSV_UPLOAD_FILE_FIELD_AUDIT.md:68-80`) |
| upload → FormData → API | `FormData.append("file", file)`; POST `/api/v1/nonsulfit/input/csv`; `triggerAnalysis=false` | required multipart `file`; query optional boolean | handler returns when file absent/uploading; browser supplies multipart boundary | CONFIRMED contract match (`src/api/csvInput.ts:9-16`; backend `app/api/v1/nonsulfit.py:109-118`) |
| A: backend parser | parsed keys `reading`, `content_understanding`, `prompt_understanding`, `structure`, `expression`, optional `comment` | five `Decimal`, required as a complete set; comment optional string | missing/invalid/out-of-range scores reject; absent/empty comment preserves existing comment | Backend parser/API tests: 9/9 pass. Fixture yields `90,90,85,95,85,"논리적…"` |
| Pre-A merge prerequisite | existing stored `NonsulfitInputRequest` | required | missing existing input → `404 STUDENT_INPUT_NOT_FOUND` before successful response | CONFIRMED failing fresh-flow condition (`csv_input_service.py:126-139`; API test lines 109-128) |
| B: backend wire response | `input.essayCompetency`; `csvImport`; no extra `data` envelope | score values serialize as decimal strings; comment `string \| null`; `analysis*` null for this FE request | backend emits canonical camelCase aliases | Model fixture emitted `"90"`, `"85"`, etc.; backend API fixture asserts all six values (`test_nonsulfit_csv_api.py:45-66`) |
| B → `CsvUploadResponse` | FE declares canonical score fields as `number \| null` | declared number differs from actual decimal-string wire type | compile-time only; raw HTTP is passed as `unknown` | **P3 contract drift**, runtime mapper intentionally accepts strings (`csvUpload.ts:1-21`; mapper lines 99-102) |
| C: mapper output | canonical camelCase object; scores converted with `Number`; comment retained separately | five `number \| null`; comment `string \| null` | camelCase then generated snake_case; invalid score → null; comment invalid/absent → null | Canonical and snake fixtures pass. Numeric strings pass. Legacy aliases fail. Nested `data` envelope fails |
| C → selector | requires all five numeric fields non-null | returns five numbers + optional comment | one missing/invalid score rejects the whole update | `selectCsvCompetency` at mapper lines 68-79; normal fixture passes |
| D: state object | functional merge into `essayInfo`; scores converted to strings; comment → `feedback` | score state `string`; feedback string | preserves all other state; absent comment preserves `prev.feedback` with `??` | Static path is correct (`Step02.tsx:65-74`) |
| E: Step02 controls | `reading`, `content_understanding`, `prompt_understanding`, `structure`, `expression`; textarea `feedback` | controlled values | no local fallback | Same context object is read at lines 11, 155-171, 220-225; no effect/reset exists in Step02 |

### Actual A–E fixture trace

| Checkpoint | Fixture value |
|---|---|
| A parser | `{reading: Decimal(90), content_understanding: Decimal(90), prompt_understanding: Decimal(85), structure: Decimal(95), expression: Decimal(85), comment: "논리적 구조는 좋으나, 결론부 요약이 아쉽습니다."}` |
| B response | `input.essayCompetency = {reading:"90", contentUnderstanding:"90", promptUnderstanding:"85", structure:"95", expression:"85", comment:"논리적 구조는 좋으나, 결론부 요약이 아쉽습니다."}` |
| C mapper | `{reading:90, contentUnderstanding:90, promptUnderstanding:85, structure:95, expression:85, comment:"…"}` |
| D state | previous state spread, then `reading:"90"`, `content_understanding:"90"`, `prompt_understanding:"85"`, `structure:"95"`, `expression:"85"`, `feedback:"…"` |
| E controls | five `ScoreInputBox.value` props read those state keys; textarea reads `essayInfo.feedback` |

Checkpoint A/B is behaviorally covered by backend tests and C by frontend tests. D/E is proven only by source wiring, not by a mounted React fixture; therefore the final DOM observation is **NOT EXECUTED**.

## Field trace matrix

The accepted CSV is a vertical two-column document; the first column contains labels rather than a six-column header row. The first cell must normalize to `학생명`, `항목`, `항목명`, or `통계항목`.

| Field | CSV label (canonical example) | Parsed key | API response key | TS contract | Mapper source | Mapper output | State field | Step02 field |
|---|---|---|---|---|---|---|---|---|
| reading | `영역별 절사평균 - 독해력` | `reading` | `reading` | `number \| null` | `read(competency,"reading")` | `reading:number\|null` | `reading:string` | `ScoreInputBox[reading]` |
| contentUnderstanding | `영역별 절사평균 - 내용 이해력` | `content_understanding` | `contentUnderstanding` | `number \| null` | camel or `content_understanding` | `contentUnderstanding:number\|null` | `content_understanding:string` | `ScoreInputBox[content_understanding]` |
| promptUnderstanding | `영역별 절사평균 - 문제 이해력` (also 논제 이해) | `prompt_understanding` | `promptUnderstanding` | `number \| null` | camel or `prompt_understanding` | `promptUnderstanding:number\|null` | `prompt_understanding:string` | `ScoreInputBox[prompt_understanding]` |
| structure | `영역별 절사평균 - 구성력` (also 구조) | `structure` | `structure` | `number \| null` | `read(competency,"structure")` | `structure:number\|null` | `structure:string` | `ScoreInputBox[structure]` |
| expression | `영역별 절사평균 - 표현력` | `expression` | `expression` | `number \| null` | `read(competency,"expression")` | `expression:number\|null` | `expression:string` | `ScoreInputBox[expression]` |
| comment | `전체 첨삭 총평 모음` | `comment` | `comment` | optional `string \| null` | text-only `read(competency,"comment")` | `comment:string\|null` | `feedback:string` | `textarea[name=feedback]` |

Legacy alias trace: the backend input schema accepts `contentComprehension`/`content_comprehension`, `understanding`, and `express` but serializes them as canonical `contentUnderstanding`, `promptUnderstanding`, and `expression` (`student.py:104-134`). The frontend CSV mapper does **not** accept the three legacy response aliases. Existing report-only types still use them (`src/types/nonsulService.ts:15-35`), which is a separate legacy output contract and not evidence that the CSV endpoint emits them.

## Contract audit

| Drift | Status | Impact |
|---|---|---|
| Backend response score values are JSON decimal strings; FE `CsvUploadResponse` declares numbers | **CONFIRMED P3** | No current loss because mapper converts numeric strings; the TypeScript contract is inaccurate |
| Backend response includes `csvImport.csvFormat`; FE contract/mapper omit it | **CONFIRMED P3** | Metadata only; no hydration impact |
| Backend supports legacy aliases on input but emits canonical output; mapper supports canonical camel/snake only | **CONFIRMED behavior, P2 if upstream changes** | Legacy response fixture rejects all hydration |
| Backend response is unwrapped; API passes exactly `response.data` to mapper | **MATCH** | H10 rejected for the audited backend/client |
| Backend `essayCompetency` can be null generally; successful CSV requires five parsed scores | **MATCH for successful CSV** | selector intentionally rejects incomplete response |
| FE hardcodes `triggerAnalysis=false`; contract types `analysis`, `analysisRunId`, `status` as null | **MATCH for this call only** | Type would be too narrow if the function exposed `true` later |
| Form state uses snake_case and `feedback`; API/mapper use canonical camelCase/comment | **Intentional adapter boundary** | Explicit Step02 assignments cover all six fields |

## Hypothesis disposition

| Hypothesis | Result | Evidence |
|---|---|---|
| H1 response ↔ FE contract mismatch | **CONFIRMED P3**, not current loss | decimal-string wire values versus numeric TS declaration; `csvFormat` omission |
| H2 snake ↔ camel mismatch | **REJECTED for canonical and snake_case** | `read` supports both conventions; both fixtures pass |
| H3 required/numeric validation drops values | **REJECTED for valid backend output** | numeric strings convert and all five pass; invalid/non-finite becomes null by design |
| H4 initial values overwrite merge | **REJECTED by source** | functional `{...prev, imported fields}` ordering puts CSV values last |
| H5 effect/navigation/context overwrite | **REJECTED by source; runtime test absent** | no Step02 effect/reset; `FormProvider` is above Routes and remains mounted across step navigation |
| H6 numeric strings lost | **REJECTED** | `Number(value)` conversion; actual decimal strings reproduced successfully |
| H7 `||` loses `0`/empty values | **REJECTED for hydration** | scores use null checks; comment uses `??`; zero survives. Separate edge: `Number("") === 0` incorrectly accepts an empty score, but backend never emits it after successful parse |
| H8 header normalization | **CONFIRMED strict format boundary, not a FE mapper issue** | UTF-8 BOM supported; cells trimmed; label normalization removes whitespace/underscore/hyphen/parentheses/slash/middle-dot/colon; horizontal CSV and unsupported first-cell headers reject |
| H9 multipart/API wrapper | **REJECTED in current code** | canonical POST, `file`, native FormData, request-specific Content-Type removal; contract test passes |
| H10 payload depth | **REJECTED for audited backend** | interceptor returns Axios response unchanged; caller supplies `response.data`; backend has no `data` envelope. Synthetic nested envelope rejects as expected |
| H11 comment enters numeric pipeline | **REJECTED** | separate `OPTIONAL_TEXT_FIELDS` and `toNullableString`; absent comment does not fail score selection |
| H12 mapper state differs from Step02 source | **REJECTED by source** | mapper result is assigned to the same FormContext `essayInfo` read by controlled fields |
| Additional: CSV API requires persisted input before Step02 has persisted it | **CONFIRMED P0** | Step01 context-only navigation; save is only Step03 submit; backend requires existing payload |

## Header and parser boundary

- BOM: `_decode` tries `utf-8-sig`, then `cp949`; BOM fixture passes.
- Whitespace: every CSV cell is `.strip()`ed and label normalization removes common separators.
- Layout: only 첨삭닷컴 vertical summary is supported. A conventional horizontal score-header CSV is explicitly rejected with `CSV_CHEOMSAK_FORMAT_REQUIRED`.
- Required scores: all five canonical parsed fields must be present; comment is optional and an empty comment preserves the already stored comment.
- Range/type: commas and the suffix `점` are stripped, then Decimal parsing and inclusive 0–100 validation apply.
- FE message table is incomplete for newer backend errors (`CSV_CHEOMSAK_FORMAT_REQUIRED`, `CSV_HEADER_MISSING`, `CSV_NUMBER_INVALID`, `CSV_SCORE_OUT_OF_RANGE`, `CSV_VERTICAL_FIELD_DUPLICATED`, `CSV_VALUE_MISSING`, `STUDENT_INPUT_NOT_FOUND`), but `parseCsvUploadError` falls back to the backend message, so the error is not hidden.

## Test audit

| Case | Exists? | Coverage quality |
|---|---|---|
| 정상 CSV | Yes | backend parser + API; frontend canonical mapper separately |
| camelCase response | Yes | mapper test |
| snake_case response | Yes | mapper test |
| legacy alias | No committed test | ad-hoc reproduction: rejects with `CSV competency scores are incomplete` |
| 숫자 문자열 | Yes | snake fixture includes `reading:"81"`; ad-hoc all-score decimal strings pass |
| comment 존재/누락 | Yes | mapper and backend tests |
| 빈 값 | Partial | backend empty comment and missing score covered; FE empty numeric string is not covered and maps to zero |
| BOM 포함 CSV | Yes | backend API/service fixtures |
| 잘못된 header | Partial | horizontal/format rejection covered; individual normalization variants are not exhaustively parameterized |
| mapper→Step02 hydration | No | only regex source assertions; no mounted provider/DOM test |
| 기존 입력값+CSV merge | Backend: Yes; frontend: source-only | backend preserves non-CSV values/comment; FE regex checks preference exclusion and comment fallback |
| fresh user without persisted input | Yes, backend only | proves 404; no FE journey test connects this prerequisite to Step02 |
| response `data` envelope | No committed test | ad-hoc reproduction rejects; canonical backend does not emit it |

The current suite validates the mapper but does **not** behaviorally validate actual Step02 hydration.

## Findings and failure classification

| Priority | Failure Point | Root Cause | Evidence | Recommended Fix |
|---|---|---|---|---|
| P0 | Step02 upload → CSV API | Fresh user data exists only in FormContext, while backend CSV merge requires an already persisted input; the only FE save happens in Step03 | `Step01.tsx:11-29,96`; `Step03.tsx:80-95`; `analysis.ts:31-39`; backend `nonsulfit.py:120-131`; backend regression `test_nonsulfit_csv_api.py:109-128` | Minimal decision point: either persist a valid base input before Step02 upload, or define a CSV endpoint that can parse/return values without an existing student record. Add an end-to-end fresh-user test |
| P2 | Mapper C → selector | Legacy `contentComprehension`, `understanding`, `express` are outside `read`'s camel/snake derivation and become null | `csvUploadMapper.ts:7-13,30-34,68-76,92-94`; ad-hoc legacy fixture fails | If legacy response compatibility is required, add explicit aliases at mapper boundary; otherwise document canonical-only response and add a rejection contract test |
| P2 | Mapper numeric conversion | Empty string is converted by `Number("")` to valid zero | `csvUploadMapper.ts:99-102`; ad-hoc fixture maps empty `reading` to `0` | Reject blank/whitespace strings before numeric conversion; regression test empty and whitespace. Not reachable from current successful backend parser |
| P3 | Backend wire ↔ TS contract | Decimal scores serialize as strings but interface claims numbers; `csvFormat` is omitted | backend `student.py:104-134`, `csv_import.py:10-25`; FE `csvUpload.ts:1-21` | Model the raw wire contract accurately, then map to normalized numeric domain type |
| P3 | Step02 test boundary | Regex assertions verify source text, not React state/DOM behavior | `csvAndDeleteUi.contract.test.ts:16-24` | Add mounted FormProvider + Step02 upload fixture asserting five inputs, textarea, preservation, and rerender |

### Per-finding operational details

| Priority | Symptom | Reproduction condition | Affected fields | Minimal change point | Regression needed |
|---|---|---|---|---|---|
| P0 | Upload shows API error; no values can hydrate | authenticated fresh user completes Step01 in client state, then uploads at Step02 before any PUT input | all six | workflow/API precondition boundary before `uploadCsvInput` | Yes, fresh Step01→Step02 journey |
| P2 legacy | success-shaped response is rejected as incomplete | upstream returns the three named legacy aliases | contentUnderstanding, promptUnderstanding, expression; atomic selector blocks all six | mapper `read` alias table | Yes |
| P2 blank | blank score appears as zero | upstream/synthetic response contains `""` for a required score | any of five scores | `toNullableNumber` | Yes |
| P3 raw type | static contract conceals runtime conversion need | backend Decimal response | five scores | raw response interface | Yes, raw fixture type expectations |
| P3 UI test | future rerender/reset defect can pass CI | any implementation regression beyond regex patterns | all six | integration test layer, not production code | Yes |

## Reproduction and verification record

- Frontend suite: **106/106 passed**.
- Backend targeted CSV suite: **9/9 passed** (`test_csv_input_service.py`, `test_nonsulfit_csv_api.py`).
- Ad-hoc no-file-change fixture results: canonical pass; snake_case pass; numeric strings pass; zero preserved; legacy aliases reject; nested `data` envelope rejects; empty numeric string maps to zero.
- No failing repository test exists. The confirmed fresh-flow failure is represented by a backend test that expects the 404 behavior; it is a cross-layer workflow defect, not a failing unit test.
- No browser/network request was sent during this audit. Historical runtime evidence in the repository confirms current multipart construction after the earlier Content-Type fix; production environment state was not assumed.
