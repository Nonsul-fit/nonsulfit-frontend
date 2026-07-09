# Frontend-Backend Contract Audit Report

## 1. Executive Summary

Overall contract alignment score: **22 / 100**

| Severity | Count |
|---|---:|
| Critical | 2 |
| High | 14 |
| Medium | 7 |
| Low | 3 |

The frontend is **not yet aligned with the new Backend Presentation Contract**. The current implementation primarily renders legacy `/nonsulfit/result` payloads through an ad-hoc `useNonsulResult` mapper, does not model `generatedReportV2` or ReportPayloadV2 sections, and uses legacy identifiers/endpoints as primary application flow. The most serious issue is score semantics: `estimatedChance` is displayed as an admission probability without the required `successRateEstimate` basis.

## 2. Audit Scope

Reviewed categories from the WIP audits:

- API clients: `src/api/axios.ts`, `src/api/auth.ts`, `src/types/nonsulService.ts`, `src/components/organisms/ChatBtn.tsx`
- Types/interfaces: `src/types/nonsulService.ts`, `src/types/admission.ts`, `src/types/university.ts`, result component prop types
- Hooks/state: `src/hooks/useNonsulResult.ts`, form validation hooks, `src/context/FormContext.tsx`, `src/context/AuthContext.tsx`
- Report UI: result list/detail/loading pages and result organisms/molecules
- Input flow: `Step01`, `Step02`, `Step03`, admission/form state types
- Chat: `src/components/organisms/ChatBtn.tsx`
- Legacy id/endpoints: `savedAnalysisReportId`, legacy result/status/chat usage
- Field mapping/adapters: submit payload builder, result mapper, legacy program types

The named contract documents were not found in the current workspace, so this report uses the task-provided contract baseline and the two WIP audit files.

## 3. Contract Baseline

Frontend rendering must depend on the Backend Presentation Contract and `generatedReportV2`, not DB schema, Python internal models, or algorithm-internal payloads. New API fields and frontend state should use camelCase. Python/DB snake_case fields must remain behind backend DTO/Adapter/Mapper/Snapshot boundaries. Legacy public ids and saved analysis report ids may exist only as explicit compatibility/fallback paths, not as the canonical new flow.

## 4. API Flow Compatibility

| Area | Expected | Current | Status | Notes |
|---|---|---|---|---|
| Input submit | `PUT /nonsulfit/input` | `saveInputData` calls `PUT /nonsulfit/input`; `Step03` invokes it. | Partial | Endpoint matches, but submitted payload is legacy-shaped. |
| analysisRunId storage | Store `analysisRunId` from input response | No `analysisRunId` usage found; submit success ignores response. | Fail | Cannot poll analysis-specific status. |
| Status polling | `GET /nonsulfit/analyses/{analysisRunId}/status` | Uses `GET /nonsulfit/status`. | Fail | Global/legacy status endpoint is primary. |
| Report fetch after completion | `GET /reports` or `GET /reports/{reportId}` | Fetches `GET /nonsulfit/result`, chooses max numeric `id`, navigates to `/result/{id}`. | Fail | Assumes latest legacy result id. |
| Report list | `GET /reports` | Uses `GET /nonsulfit/result`. | Fail | No `/reports` usage found. |
| Report detail | `GET /reports/{reportId}` | Uses `GET /nonsulfit/result/{savedAnalysisReportId}`. | Fail | No `/reports/{reportId}` usage found. |
| Chat history | `GET /reports/{reportId}/chat/messages` | Uses `GET /nonsulfit/chat/{savedAnalysisReportId}`. | Fail | Legacy chat endpoint is primary. |
| Chat send | `POST /reports/{reportId}/chat/messages` | Uses `POST /nonsulfit/chat/{savedAnalysisReportId}`. | Fail | Legacy response shape is used directly. |
| Legacy fallback: status | Fallback only | `GET /nonsulfit/status` is primary. | Fail | Not isolated as fallback. |
| Legacy fallback: result list | Fallback only | `GET /nonsulfit/result` is primary. | Fail | Not isolated as fallback. |
| Legacy fallback: result detail | Fallback only | `GET /nonsulfit/result/{id}` is primary. | Fail | Not isolated as fallback. |
| Legacy fallback: public result | Fallback only | No explicit `publicId`; route param is generic `id`. | Needs Review | Semantics remain ambiguous. |
| Legacy fallback: chat | Fallback only | `GET/POST /nonsulfit/chat/{savedAnalysisReportId}` is primary. | Fail | Not isolated as fallback. |

## 5. Field Naming Audit

| Field | Expected | Current Usage | Status | Fix Needed |
|---|---|---|---|---|
| `analysisRunId` | Canonical analysis polling id | Not found. | Fail | Store response id after submit and use for status polling. |
| `reportId` | Canonical report/chat id | Not found; route param is generic `id`. | Fail | Introduce explicit reportId route/API state. |
| `publicId` | Legacy/public id only | No explicit symbol found. | Pass | Preserve only in legacy route/fallback layer. |
| `savedAnalysisReportId` | Compatibility only | Used in service, result page, and chat component. | Fail | Rename canonical flow to `reportId`; isolate old name. |
| `generatedReportV2` | Primary render source | Not found. | Fail | Add typed ReportPayloadV2 handling. |
| `displayBucket` | Card placement field | Not found. | Fail | Use for stable/target/reach placement. |
| `category` | Risk semantics only | Used for request filtering and card labels. | Fail | Stop using as placement/display bucket. |
| `student.academic` | `academicTrack` | Frontend produces legacy field. | Fail | Send canonical field or let backend adapter map. |
| `student.essayCount` | `applicationCount` | Frontend produces legacy field. | Fail | Use canonical application count. |
| `essayCompetency.contentComprehension` | `contentUnderstanding` | Frontend produces and consumes legacy field. | Fail | Move legacy mapping behind backend adapter. |
| `essayCompetency.understanding` | `promptUnderstanding` | Frontend produces and consumes legacy field. | Fail | Move legacy mapping behind backend adapter. |
| `essayCompetency.express` | `expression` | Frontend produces and consumes legacy field. | Fail | Use canonical name. |
| `testGrades[].year/month` | `examYear`/`examMonth` or backend-internal adapter fields | Frontend produces legacy fields. | Fail | Use canonical API names. |
| `chartPreference` | Numeric 1-3 | Submitted as number from internal `chart_score`; initial state is `0`. | Partial | Store canonical name and validate 1-3 before submit. |
| `englishPreference` | Numeric 1-3 | Submitted as number from internal `english_passage_score`; initial state is `0`. | Partial | Store canonical name and validate 1-3 before submit. |
| `mathPreference` | Numeric 1-3 | Submitted as number from internal `math_question_score`; initial state is `0`. | Partial | Store canonical name and validate 1-3 before submit. |
| Snake-case form keys | Avoid in new frontend state | Several form keys use snake_case. | Fail | Rename state to camelCase. |
| DB/internal program fields | Not exposed to frontend | `program_id`, `university_id`, `academic_field`, etc. appear in frontend types. | Fail | Replace with presentation DTO types. |

## 6. ReportPayloadV2 Shape Audit

| Section | Required | Frontend Type | Rendered | Status | Notes |
|---|---:|---|---|---|---|
| `reportVersion` | Yes | Not found | No | Fail | No ReportPayloadV2 type or version gate. |
| `studentSummary` | Yes | Not found | No | Fail | Result UI uses local form context only for selected limit. |
| `recommendationSummary` | Yes | Not found | No | Fail | Result header/card data comes from legacy mapper. |
| `recommendedPrograms` | Yes | Not found | Indirect legacy list only | Fail | Maps `response.result` to `universityList`. |
| `portfolioStrategy` | Yes | Not found | Partial local substitute | Fail | No `safety/match/reach` handling. |
| `tierSummary` | Yes | Not found | No | Fail | No tier summary rendering. |
| `consultantSummary` | Yes | Not found | Partial local substitute | Fail | Uses local `explanations` fields. |
| `patternSummary` | Yes | Not found | No | Fail | No matched pattern rendering. |
| `caseStatisticsSummary` | Yes | Not found | No | Fail | No case statistics section. |
| `riskSummary` | Yes | Not found | No dedicated section | Fail | Risk is represented through legacy category/chance labels. |
| `nextActions` | Yes | Not found | No | Fail | No next actions section. |
| `warnings` | Yes | Not found as report payload field | No | Fail | Chat warnings are only logged. |
| `metadata` | Yes | Not found | No | Fail | No algorithm/source metadata rendering. |
| Nullable/empty defense | Yes | No contract-level types | Partial local fallback | Fail | Fallbacks are local and section-unaware. |
| Legacy field dependence | No | Legacy fields in types/hook | Yes | Fail | Depends on `estimatedChance`, `category`, competency fields, and `program`. |

## 7. Recommendation Card Audit

| Check | Finding | Status |
|---|---|---|
| Card position source | No `displayBucket` or `portfolioStrategy.safety/match/reach`; card list uses legacy category filtering. | Fail |
| Risk display source | `category` drives labels and request params. | Fail |
| SAFE/MODERATE/RISKY mapping | Current Korean mapping is directionally `RISKY -> 상향`, `MODERATE -> 적정`, `SAFE -> 하향`; no canonical `stable/target/reach`. | Partial |
| Category overwrite | No explicit `category` to `displayBucket` overwrite found because `displayBucket` is absent. | Pass |
| riskLevel mutation | No `riskLevel` usage found. | Pass |
| Inverted placement | No explicit SAFE-to-reach or RISKY-to-stable placement found, but placement is not contract-based. | Needs Review |
| `sectionFallback=true` badge | Not rendered. | Fail |
| `fallbackReason` display | Not rendered. | Fail |
| Fallback score/risk semantics | No guard exists to keep fallback from looking like score/risk mutation. | Fail |

## 8. Warning and Risk Separation Audit

| Check | Finding | Status |
|---|---|---|
| `warnings` displayed separately | Report-level warnings are not rendered. | Fail |
| `riskSummary.reasons` used only for risk UI | `riskSummary` is absent. | Fail |
| Warnings not merged into risk summary | No merge found because neither section is implemented. | Needs Review |
| `SECTION_FALLBACK_USED` | No usage found. | Fail |
| `INSUFFICIENT_TOTAL_CANDIDATES` | No usage found. | Fail |
| `INSUFFICIENT_ORIGINAL_BUCKET` | No usage found. | Fail |
| `INSUFFICIENT_STABLE` | No usage found. | Fail |
| `INSUFFICIENT_TARGET` | No usage found. | Fail |
| `INSUFFICIENT_REACH` | No usage found. | Fail |

## 9. Score Semantics Audit

| Check | Finding | Status |
|---|---|---|
| `finalScore` displayed as probability | No `finalScore` usage found. | Pass |
| `estimatedChance` displayed as probability | `estimatedChance` is mapped to `summary.passProbability` and rendered as `예상 합격 확률` with `%`. | Critical |
| `successRateEstimate` probability wording | No `successRateEstimate` or `simulationResults[].minimumPassProbability` usage found. | Fail |
| Problem wording: `합격확률`/`합격 확률` | Active UI uses `예상 합격 확률`; mock data also contains probability wording. | Critical |
| Problem wording: `합격 가능성 X%` | Qualitative copy exists; no separate active `X%` pattern found beyond probability label/value composition. | Needs Review |
| `estimatedChance = 합격률` pattern | `estimatedChance` is effectively treated as probability. | Critical |

## 10. Chat Integration Audit

| Check | Finding | Status |
|---|---|---|
| New chat endpoints | No `/reports/{reportId}/chat/messages` usage. | Fail |
| Legacy chat endpoints | `ChatBtn` uses `/nonsulfit/chat/{savedAnalysisReportId}`. | Fail |
| Snapshot/generatedReportV2 context | No generatedReportV2/report snapshot context is passed to chat. | Fail |
| Coupling to savedAnalysisReportId | Result route id is passed into `ChatBtn savedAnalysisReportId`. | Fail |
| Message type contract | Supports `USER` and `ASSISTANT`; no `SYSTEM`. | Partial |
| Legacy role/content shape | UI expects `{ type, message }`; no `{ role, content }` handling found. | Needs Review |
| Chat warnings | Logged only, not displayed. | Fail |

## 11. Legacy Compatibility Audit

Legacy behavior is not isolated as compatibility. It is the primary application path:

- Status polling uses `/nonsulfit/status`.
- Result list/detail use `/nonsulfit/result` and `/nonsulfit/result/{savedAnalysisReportId}`.
- Chat uses `/nonsulfit/chat/{savedAnalysisReportId}`.
- `savedAnalysisReportId` is treated as the chat/report id.
- The result route param `id` ambiguously stands in for legacy saved report id, public id, and report id.
- Legacy input fields are produced directly by the frontend instead of backend adapters.

## 12. Error Handling and Empty State Audit

| Case | Handling Found | Status |
|---|---|---|
| 401 | Axios refresh-token retry; alert/login redirect on refresh failure. | Partial |
| 403 | No dedicated UI handling. | Fail |
| 404 report not found | No dedicated report-not-found state. | Fail |
| 422 validation error | No dedicated handling; submit branches on 400 only. | Fail |
| Analysis failed status | Loading page handles `FAILED` with alert and navigation. | Pass |
| Report payload missing | No ReportPayloadV2 missing-payload guard. | Fail |
| `generatedReportV2` partial missing | No handling because generatedReportV2 is not consumed. | Fail |
| Recommended candidates 0 | Generic no-result state for empty mapped list. | Partial |
| `warnings` present | Not rendered; chat warnings logged only. | Fail |
| `sectionFallback` present | No handling. | Fail |
| `portfolioStrategy` buckets partially empty | No handling. | Fail |
| `tierSummary` null / empty distribution | No handling. | Fail |
| `patternSummary.matchedPatterns=[]` | No handling. | Fail |
| `successRateEstimate=null` | No handling; legacy `estimatedChance` fallback is used. | Fail |
| `metadata.algorithmVersion` missing | No handling. | Fail |
| Legacy competency fields null | Numeric fallback prevents likely crash but may silently show zero. | Partial |
| `program` missing/null | Placeholder fallback likely prevents crash. | Partial |

## 13. Issue List

| ID | Severity | File | Problem | Contract Violation | Recommended Fix |
|---|---|---|---|---|---|
| ISSUE-01 | Low | `docs/audit/_wip_01_api_naming.md` | Contract docs were not found in workspace. | Audit could not verify exact source documents. | Add contract docs to repo or link canonical paths. |
| ISSUE-02 | High | `src/pages/Step/Step03.tsx`, `src/types/nonsulService.ts` | `analysisRunId` is not captured after submit. | New analysis flow requires run-scoped polling. | Persist `analysisRunId` from input response. |
| ISSUE-03 | High | `src/pages/Loading/LoadingPage.tsx`, `src/types/nonsulService.ts` | Polls legacy `/nonsulfit/status`. | Must poll `/nonsulfit/analyses/{analysisRunId}/status`. | Replace status helper and route state. |
| ISSUE-04 | High | `src/pages/Loading/LoadingPage.tsx`, `src/hooks/useNonsulResult.ts`, `src/types/nonsulService.ts` | Report fetch uses legacy result endpoints. | New flow requires `/reports` or `/reports/{reportId}`. | Add report client and migrate consumers. |
| ISSUE-05 | High | `src/components/organisms/ChatBtn.tsx` | Chat uses legacy `/nonsulfit/chat/{id}`. | Chat must use report-scoped messages endpoint. | Switch to `/reports/{reportId}/chat/messages`. |
| ISSUE-06 | Medium | `src/components/organisms/ChatBtn.tsx`, `src/pages/Result/Result.tsx` | `savedAnalysisReportId` remains first-class state. | Legacy id is treated as canonical. | Rename canonical flow to `reportId`; keep old id in adapter. |
| ISSUE-07 | High | `src/pages/Step/Step03.tsx` | Frontend produces legacy input fields. | Backend adapter boundary is bypassed. | Submit canonical camelCase DTO. |
| ISSUE-08 | Low | `src/context/FormContext.tsx`, `src/pages/Step/Step02.tsx` | New form state uses snake_case keys. | New frontend state should be camelCase. | Rename state keys and update bindings. |
| ISSUE-09 | Low | `src/types/university.ts`, `src/hooks/useNonsulResult.ts` | DB/internal snake_case fields appear in frontend. | Frontend should consume presentation DTOs. | Replace internal program type with presentation type. |
| ISSUE-10 | High | `src/hooks/useNonsulResult.ts` | Result rendering uses ad-hoc mapper, not `generatedReportV2`. | Backend Presentation Contract is not primary source. | Build ReportPayloadV2 adapter/view model. |
| ISSUE-11 | High | `src/hooks/useNonsulResult.ts`, result components | Recommendation bucket uses legacy `category`, not `displayBucket`. | Placement and risk semantics are mixed. | Use `displayBucket` for placement; keep `category` for risk. |
| ISSUE-12 | Medium | `src/context/FormContext.tsx`, `src/pages/Step/Step02.tsx`, `src/pages/Step/Step03.tsx` | Preference initial state is `0`; validation requires review. | Preference contract expects 1-3. | Validate 1-3 and store canonical field names. |
| ISSUE-13 | High | `src/types/*`, result pages | ReportPayloadV2 type is absent. | Required report shape is not modeled. | Add generated or hand-authored contract types. |
| ISSUE-14 | High | `src/hooks/useNonsulResult.ts` | UI ignores `generatedReportV2`. | New report snapshot is not consumed. | Make generatedReportV2 the primary render source. |
| ISSUE-15 | High | result components | Required ReportPayloadV2 sections are mostly absent. | Required presentation sections are not rendered/guarded. | Implement section-aware components and fallbacks. |
| ISSUE-16 | High | `src/hooks/useNonsulResult.ts`, result tabs/cards | Card placement uses category filtering. | `displayBucket`/portfolio strategy must drive placement. | Map stable/target/reach from presentation fields. |
| ISSUE-17 | Medium | result components | `sectionFallback` and `fallbackReason` are not surfaced. | Fallback context must be visible and non-semantic. | Add fallback badge/reason UI. |
| ISSUE-18 | Medium | result components | Warning codes are not handled. | Warnings must remain separate from risk summary. | Add warnings panel with code-specific copy. |
| ISSUE-19 | Critical | `src/hooks/useNonsulResult.ts`, `src/components/organisms/result/EvaluationReport.tsx` | `estimatedChance` is shown as admission probability. | Probability semantics require verified `successRateEstimate` basis. | Remove probability wording or use valid successRateEstimate source. |
| ISSUE-20 | Critical | result copy/mock/result mapper | Probability language appears without required simulation basis. | Score/probability semantics are misleading. | Gate probability copy on `simulationResults[].minimumPassProbability`. |
| ISSUE-21 | High | `src/components/organisms/ChatBtn.tsx` | Chat is tied to legacy saved report id. | New chat must be reportId scoped. | Refactor ChatBtn to accept `reportId`. |
| ISSUE-22 | Medium | `src/components/organisms/ChatBtn.tsx` | Chat message type excludes `SYSTEM`. | New message contract includes USER/ASSISTANT/SYSTEM. | Add complete message union and renderer. |
| ISSUE-23 | Medium | `src/api/axios.ts`, pages | 403/404/422 and payload-section errors are not differentiated. | Contract errors need actionable UI states. | Add typed API errors and page-level states. |
| ISSUE-24 | High | routes/state/services | `analysisRunId`, `reportId`, `publicId`, and `savedAnalysisReportId` are not separated. | ID semantics are ambiguous. | Define distinct route params/state and adapters. |
| ISSUE-25 | High | `src/pages/Loading/LoadingPage.tsx` | Completion flow picks max numeric legacy result id. | Report should resolve from analysis run/status response. | Use status response report id or reports API query. |
| ISSUE-26 | Medium | result components | Empty/fallback coverage is ad-hoc, not section-based. | ReportPayloadV2 empty states must not crash or mislead. | Add section-level null/empty guards. |

## 14. Recommended Refactor Plan

P0:

- Remove or relabel probability UI that maps `estimatedChance` to admission probability.
- Make `generatedReportV2` / ReportPayloadV2 the primary result render source.
- Separate `displayBucket` placement from `category`/risk semantics.
- Add contract types for ReportPayloadV2 and required sections.

P1:

- Replace legacy result/status flow with `analysisRunId` polling and `reportId` report fetch.
- Refactor chat to `GET/POST /reports/{reportId}/chat/messages`.
- Render `warnings` separately from `riskSummary`.
- Add `sectionFallback` badge and `fallbackReason` UI.
- Normalize route/state id semantics: `analysisRunId`, `reportId`, `publicId`.

P2:

- Keep legacy `/nonsulfit/*` only behind explicit fallback adapters.
- Rename snake_case frontend state to camelCase.
- Replace DB/internal frontend types with presentation DTOs.
- Improve 403/404/422, missing payload, empty bucket, null section, and metadata empty states.

## 15. Acceptance Criteria

- [ ] TypeScript compile passes.
- [ ] Result pages render from `generatedReportV2` as primary source.
- [ ] Recommendation card placement uses `displayBucket`.
- [ ] `category` is used only for risk/category display, not placement mutation.
- [ ] `warnings` and `riskSummary` render separately.
- [ ] `finalScore` is not displayed as a probability.
- [ ] `estimatedChance` is not labeled as admission/success probability unless contract allows it.
- [ ] Probability copy is based only on `successRateEstimate` backed by `simulationResults[].minimumPassProbability`.
- [ ] Legacy `publicId` route remains supported where required.
- [ ] New `reportId` route and report fetch work.
- [ ] Chat uses `reportId` scoped message endpoints.
- [ ] Empty/null/fallback report sections do not crash the UI.
- [ ] `sectionFallback` and `fallbackReason` are visible without implying score/risk changes.

## 16. Final Recommendation

**Not Ready**

The frontend needs a contract refactor before it can be considered compatible with the new backend presentation boundary. The largest blockers are probability semantics, legacy API flow, lack of ReportPayloadV2 modeling, mixed recommendation placement/risk semantics, and chat/report id coupling.
