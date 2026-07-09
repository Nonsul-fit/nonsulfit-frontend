## Audit Scope

Reference contracts:

- `FRONTEND_BACKEND_CONTRACT.md` - not found in current workspace
- `REPORT_PAYLOAD_V2_CONTRACT.md` - not found in current workspace
- `REPORT_SECTIONS_CONTRACT.md` - not found in current workspace
- `ERD_DESIGN_RATIONALE_V2.md` - not found in current workspace

API client:

- `src/api/axios.ts`
- `src/api/auth.ts`
- `src/types/nonsulService.ts`
- `src/components/organisms/ChatBtn.tsx`

Types/interfaces:

- `src/types/nonsulService.ts`
- `src/types/admission.ts`
- `src/types/university.ts`
- `src/components/molecules/result/ResultHeader.tsx`
- `src/components/molecules/result/UnivTabs.tsx`

Hooks:

- `src/hooks/useNonsulResult.ts`
- `src/hooks/useFormValidation.ts`
- `src/hooks/useForm.ts`

State/store:

- `src/context/FormContext.tsx`
- `src/context/AuthContext.tsx`

Report pages:

- `src/pages/Result/Result.tsx`
- `src/pages/Result/ResultList.tsx`
- `src/pages/Result/mockResultData.ts`
- `src/pages/Loading/LoadingPage.tsx`

Recommendation/report cards and result components:

- `src/components/molecules/result/ResultHeader.tsx`
- `src/components/molecules/result/UnivTabs.tsx`
- `src/components/organisms/result/UnivDetailSummary.tsx`
- `src/components/organisms/result/EvaluationReport.tsx`
- `src/components/organisms/result/UnivCompetencyComparison.tsx`
- `src/components/atoms/Card.tsx`
- `src/components/atoms/TagChip.tsx`

Chat page/component:

- `src/components/organisms/ChatBtn.tsx`

Analysis input form:

- `src/pages/Step/Step01.tsx`
- `src/pages/Step/Step02.tsx`
- `src/pages/Step/Step03.tsx`
- `src/context/FormContext.tsx`
- `src/types/admission.ts`
- `src/components/organisms/FormCard.tsx`
- `src/components/molecules/step/ScoreInputBox.tsx`
- `src/components/molecules/step/SelectionCard.tsx`
- `src/components/molecules/step/StepNavigation.tsx`
- `src/components/molecules/step/StepHeader.tsx`

Status polling:

- `src/pages/Loading/LoadingPage.tsx`
- `src/types/nonsulService.ts`

Legacy savedAnalysisReportId/publicId usage:

- `src/types/nonsulService.ts`
- `src/hooks/useNonsulResult.ts`
- `src/pages/Result/Result.tsx`
- `src/components/organisms/ChatBtn.tsx`
- `src/pages/Loading/LoadingPage.tsx`
- `src/pages/Result/ResultList.tsx`

Field mapping/adapter helpers:

- `src/pages/Step/Step03.tsx`
- `src/hooks/useNonsulResult.ts`
- `src/types/nonsulService.ts`
- `src/pages/Result/ResultList.tsx`
- `src/types/university.ts`

## API Flow Findings

| Area | Expected | Current | Status | Notes |
|---|---|---|---|---|
| Input submit | `PUT /nonsulfit/input` | `saveInputData` calls `PUT /nonsulfit/input` from `src/types/nonsulService.ts`; `src/pages/Step/Step03.tsx` invokes it. | Partial | Endpoint matches, but submitted payload is legacy-shaped rather than clearly generated from the backend presentation contract. |
| analysisRunId storage | Store `analysisRunId` from input response | No `analysisRunId` usage found. Submit success ignores response and navigates to loading. | Fail | Current flow cannot poll analysis-specific status. |
| Status polling | `GET /nonsulfit/analyses/{analysisRunId}/status` | `src/types/nonsulService.ts` calls `GET /nonsulfit/status`; `src/pages/Loading/LoadingPage.tsx` polls that helper. | Fail | Uses global/legacy status endpoint and no run id. |
| Report fetch after completion | `GET /reports` or `GET /reports/{reportId}` | Completion handler fetches `GET /nonsulfit/result`, chooses max numeric `id`, then navigates to `/result/{id}`. Detail fetch uses `GET /nonsulfit/result/{savedAnalysisReportId}`. | Fail | Uses legacy result endpoints and treats legacy `id` as route/report identifier. |
| Report list | `GET /reports` | `src/pages/Result/ResultList.tsx` and `src/hooks/useNonsulResult.ts` call `GET /nonsulfit/result`. | Fail | No `/reports` usage found. |
| Report detail | `GET /reports/{reportId}` | `src/types/nonsulService.ts` calls `GET /nonsulfit/result/{savedAnalysisReportId}`. | Fail | No `/reports/{reportId}` usage found. |
| Chat history | `GET /reports/{reportId}/chat/messages` | `src/components/organisms/ChatBtn.tsx` calls `GET /nonsulfit/chat/{savedAnalysisReportId}`. | Fail | Uses legacy chat endpoint and legacy id prop. |
| Chat send | `POST /reports/{reportId}/chat/messages` | `src/components/organisms/ChatBtn.tsx` calls `POST /nonsulfit/chat/{savedAnalysisReportId}`. | Fail | Uses legacy chat endpoint and response shape directly. |
| Legacy fallback: status | Confirm fallback only | `GET /nonsulfit/status` is the primary polling path. | Fail | Not isolated as fallback. |
| Legacy fallback: result list | Confirm fallback only | `GET /nonsulfit/result` is primary list/latest-report path. | Fail | Not isolated as fallback. |
| Legacy fallback: result detail | Confirm fallback only | `GET /nonsulfit/result/{savedAnalysisReportId}` is primary detail path. | Fail | Not isolated as fallback. |
| Legacy fallback: public result | Confirm fallback only | No `GET /nonsulfit/result/{publicId}` naming found; route param is generic `id`. | Needs Review | Behavior may still be legacy-id based, but no explicit `publicId` symbol found. |
| Legacy fallback: chat | Confirm fallback only | `GET/POST /nonsulfit/chat/{savedAnalysisReportId}` is primary chat path. | Fail | Not isolated as fallback. |

## Naming Convention Findings

| Field | Expected | Current Usage | Status |
|---|---|---|---|
| `analysisRunId` | camelCase state/id for analysis runs | Not found. | Fail |
| `reportId` | camelCase report identifier for report/chat APIs | Not found. Route param is `id`; chat prop is `savedAnalysisReportId`. | Fail |
| `publicId` | Legacy identifier only if explicitly isolated | No explicit symbol found. | Pass |
| `savedAnalysisReportId` | Legacy name should not drive new flow | Used in `src/types/nonsulService.ts`, `src/pages/Result/Result.tsx`, and `src/components/organisms/ChatBtn.tsx`. | Fail |
| `generatedReportV2` | Render from generated report v2 contract | Not found. Result UI renders a locally mapped view model. | Fail |
| `displayBucket` | Use presentation/display contract field for recommendation bucket | Not found. Result filter maps Korean labels to `RISKY`/`MODERATE`/`SAFE` category. | Fail |
| `category` | If used, should match presentation contract semantics | Used as request param and response field with legacy/backend enum semantics. | Needs Review |
| `chartPreference` | camelCase API field, numeric 1-3 | Produced in submit payload from internal `chart_score`. | Partial |
| `englishPreference` | camelCase API field, numeric 1-3 | Produced in submit payload from internal `english_passage_score`. | Partial |
| `mathPreference` | camelCase API field, numeric 1-3 | Produced in submit payload from internal `math_question_score`. | Partial |
| Snake-case form state | New frontend state should avoid snake_case | `content_understanding`, `prompt_understanding`, `chart_score`, `english_passage_score`, `math_question_score` are form state keys. | Fail |
| DB/internal payload names | Frontend should avoid DB/Python internal names | `src/types/university.ts` includes `program_id`, `university_id`, `academic_field`, `competition_rate_latest`, `exam_date_2026`; `useNonsulResult` reads `prog.program_id`. | Fail |

## Legacy Adapter Findings

| Legacy Field | Canonical Field | Where Produced | Status |
|---|---|---|---|
| `student.academic` | `academicTrack` | Produced directly in `src/pages/Step/Step03.tsx`. | Fail |
| `student.essayCount` | `applicationCount` | Produced directly in `src/pages/Step/Step03.tsx`; also held as `studentInfo.essayCount` in `src/context/FormContext.tsx`. | Fail |
| `essayCompetency.contentComprehension` | `contentUnderstanding` | Produced directly in `src/pages/Step/Step03.tsx`; consumed from legacy result in `src/hooks/useNonsulResult.ts`. | Fail |
| `essayCompetency.understanding` | `promptUnderstanding` | Produced directly in `src/pages/Step/Step03.tsx`; consumed from legacy result in `src/hooks/useNonsulResult.ts`. | Fail |
| `essayCompetency.express` | `expression` | Produced directly in `src/pages/Step/Step03.tsx`; consumed from legacy result in `src/hooks/useNonsulResult.ts`. | Fail |
| `testGrades[].year/month` | `examYear`/`examMonth` or backend-internal `exam_year`/`exam_month` behind adapter | Produced directly in `src/pages/Step/Step03.tsx`. | Fail |

## Preference Field Findings

| Field | Handling Found | Status |
|---|---|---|
| `chartPreference` | UI selection uses `[1, 2, 3]`; submit converts to `Number(...) || 1`; initial form state is `0`. | Partial |
| `englishPreference` | UI selection uses `[1, 2, 3]`; submit converts to `Number(...) || 1`; initial form state is `0`. | Partial |
| `mathPreference` | UI selection uses `[1, 2, 3]`; submit converts to `Number(...) || 1`; initial form state is `0`. | Partial |
| Preference source keys | Form state uses `chart_score`, `english_passage_score`, `math_question_score`. | Fail |
| String/boolean/0-10 handling | No boolean/string preference handling found. Initial value `0` exists before required validation. | Needs Review |

## Raw Issues

- ISSUE-01: Required contract documents were not found in the current workspace, so this pass is based on code inspection and the prompt-provided contract summary.
- ISSUE-02: New analysis flow is not implemented because `analysisRunId` is never captured or stored after `PUT /nonsulfit/input`.
- ISSUE-03: Status polling uses legacy `GET /nonsulfit/status` as the primary path instead of analysis-run scoped status.
- ISSUE-04: Report list/detail use legacy `/nonsulfit/result` endpoints as primary paths instead of `/reports` endpoints.
- ISSUE-05: Chat uses legacy `/nonsulfit/chat/{savedAnalysisReportId}` endpoints as primary paths instead of report-scoped chat message endpoints.
- ISSUE-06: `savedAnalysisReportId` remains a first-class frontend prop/API parameter for result/chat flow.
- ISSUE-07: Frontend directly produces legacy input fields that should be owned by backend Adapter/Mapper boundaries.
- ISSUE-08: Frontend uses snake_case form state keys for new input state and preference source fields.
- ISSUE-09: Frontend type definitions expose apparent DB/internal snake_case program fields.
- ISSUE-10: Result rendering is based on ad-hoc mapping in `useNonsulResult` rather than `generatedReportV2`/Backend Presentation Contract.
- ISSUE-11: Recommendation bucket rendering uses legacy category enum mapping instead of `displayBucket`.
- ISSUE-12: Preference fields are submitted as 1-3 numbers, but initial state is `0` and validation behavior should be checked against the intended required-value contract.
