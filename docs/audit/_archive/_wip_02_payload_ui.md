## ReportPayloadV2 Shape Findings

| Section | Required | Frontend Type | Rendered | Status | Notes |
|---|---:|---|---|---|---|
| `reportVersion` | Yes | Not found | No | Fail | No ReportPayloadV2 type or version gate found. |
| `studentSummary` | Yes | Not found | No | Fail | Result UI uses local form context only for selected limit, not report payload student summary. |
| `recommendationSummary` | Yes | Not found | No | Fail | Current result header/card data is derived from legacy result items and local view model fields. |
| `recommendedPrograms` | Yes | Not found | Indirect legacy list only | Fail | `useNonsulResult` maps `response.result` to `universityList`; no typed `recommendedPrograms` handling. |
| `portfolioStrategy` | Yes | Not found | Partial local substitute | Fail | UI has `explanations` strings and category filtering, but no `portfolioStrategy.safety/match/reach`. |
| `tierSummary` | Yes | Not found | No | Fail | No tier summary or tier distribution handling found. |
| `consultantSummary` | Yes | Not found | Partial local substitute | Fail | UI labels consultant-like text, but consumes local `explanations` fields instead of contract section. |
| `patternSummary` | Yes | Not found | No | Fail | No `matchedPatterns` or pattern summary rendering found. |
| `caseStatisticsSummary` | Yes | Not found | No | Fail | No case statistics section/type/rendering found. |
| `riskSummary` | Yes | Not found | No dedicated section | Fail | Risk is represented through legacy category/chance labels, not `riskSummary`. |
| `nextActions` | Yes | Not found | No | Fail | No next action section/type/rendering found. |
| `warnings` | Yes | Not found as report payload field | No | Fail | Chat logs may print `response.data.warnings`, but report warnings are not displayed. |
| `metadata` | Yes | Not found | No | Fail | No algorithm/version/source metadata rendering or fallback found. |
| Nullable/empty defense | Required by UI | No contract-level types | Partial local `||` fallback | Fail | Existing fallbacks are ad-hoc on local view model fields, not section-aware guards. |
| Legacy field dependence | Should be none in UI | Legacy fields in `UniversityReport` and `useNonsulResult` | Yes | Fail | UI path depends on legacy `estimatedChance`, `category`, competency fields, and `program` subfields. |

## Recommendation Card Findings

| Check | Finding | Status |
|---|---|---|
| Card position source | No `displayBucket` usage and no `portfolioStrategy.safety/match/reach` usage found. Result filter maps Korean labels to legacy `RISKY`/`MODERATE`/`SAFE`. | Fail |
| Risk display source | `category` is used to label cards as 상향/적정/하향 and to filter requests. | Fail |
| SAFE/MODERATE/RISKY mapping | Current mapping is `RISKY -> 상향`, `MODERATE -> 적정`, `SAFE -> 하향`; no canonical `stable/target/reach` fields. | Partial |
| Prohibited category overwrite | No explicit overwrite of `category` into `displayBucket` found because `displayBucket` is absent. | Pass |
| Prohibited riskLevel mutation | No `riskLevel` usage found. | Pass |
| Prohibited inverted placement | No explicit SAFE-to-reach or RISKY-to-stable placement found, but placement is not contract-based. | Needs Review |
| `sectionFallback=true` badge | No `sectionFallback` usage or correction badge rendering found. | Fail |
| `fallbackReason` display | No `fallbackReason` usage found. | Fail |
| Fallback score/risk semantics | No fallback UI exists, so there is no guard preventing fallback from looking like score/risk modification. | Fail |

## Warning/Risk Separation Findings

| Check | Finding | Status |
|---|---|---|
| `warnings` displayed separately | Report-level warnings are not rendered. Chat response warnings are only logged. | Fail |
| `riskSummary.reasons` used only for risk UI | `riskSummary` is absent, so this separation is not implemented. | Fail |
| Warnings not merged into risk summary | No merge found, but only because neither contract section is implemented. | Needs Review |
| `SECTION_FALLBACK_USED` | No usage found. | Fail |
| `INSUFFICIENT_TOTAL_CANDIDATES` | No usage found. | Fail |
| `INSUFFICIENT_ORIGINAL_BUCKET` | No usage found. | Fail |
| `INSUFFICIENT_STABLE` | No usage found. | Fail |
| `INSUFFICIENT_TARGET` | No usage found. | Fail |
| `INSUFFICIENT_REACH` | No usage found. | Fail |

## Score Semantics Findings

| Check | Finding | Status |
|---|---|---|
| `finalScore` displayed as probability | No `finalScore` usage found. | Pass |
| `estimatedChance` displayed as probability | `useNonsulResult` maps `estimatedChance` into `summary.passProbability`; `EvaluationReport` renders it as `예상 합격 확률` with `%`. | Critical Candidate |
| `successRateEstimate` probability wording | No `successRateEstimate` or `simulationResults[].minimumPassProbability` usage found. | Fail |
| Problem wording: `합격확률`/`합격 확률` | Active result UI uses `예상 합격 확률`; mock data contains several `합격 확률` strings. | Critical Candidate |
| Problem wording: `합격 가능성 X%` | Landing page uses qualitative `합격 가능성`; no active `X%` pattern found outside probability label/value composition. | Needs Review |
| `estimatedChance = 합격률` pattern | `estimatedChance` is effectively treated as `passProbability` and rendered as percent probability. | Critical Candidate |

## Chat Integration Findings

| Check | Finding | Status |
|---|---|---|
| New chat endpoints | No `GET/POST /reports/{reportId}/chat/messages` usage found. | Fail |
| Legacy chat endpoints | `ChatBtn` uses `GET/POST /nonsulfit/chat/{savedAnalysisReportId}` as primary flow. | Fail |
| Snapshot/generatedReportV2 context | No generatedReportV2/report snapshot context is passed to chat UI. | Fail |
| Coupling to savedAnalysisReportId | `ChatBtn` prop is `savedAnalysisReportId`; result route param `id` is passed directly into it. | Fail |
| Message type contract | Local type allows `USER` and `ASSISTANT`; no `SYSTEM` support. | Partial |
| Legacy role/content shape | UI expects `{ type, message }`; no `{ role, content }` handling found. | Needs Review |
| Chat warnings | `response.data.warnings` is logged only and not surfaced in UI. | Fail |

## Error Handling Findings

| Case | Handling Found | Status |
|---|---|---|
| 401 | Axios refresh-token retry, then alert/login redirect on refresh failure. | Partial |
| 403 | No dedicated UI handling found. | Fail |
| 404 report not found | No dedicated report-not-found state found. Empty result list fallback may show generic no-result UI. | Fail |
| 422 validation error | No dedicated 422 handling found. Submit page only branches on 400. | Fail |
| Analysis failed status | Loading page handles `FAILED` with alert and navigation back to step03. | Pass |
| Report payload missing | No ReportPayloadV2-level missing-payload guard found. | Fail |
| `generatedReportV2` partial missing | No generatedReportV2 handling found. | Fail |
| Recommended candidates 0 | `universityList.length === 0` renders generic no-result state. | Partial |
| `warnings` present | Not rendered; chat warnings logged only. | Fail |
| `sectionFallback` present | No handling found. | Fail |

## State Model Findings

| State/ID | Expected Separation | Current Usage | Status |
|---|---|---|---|
| `analysisRunId` | Created after submit and used only for polling | Not found; loading page polls without run id. | Fail |
| `reportId` | Canonical id for report fetch and chat | Not found; route param is generic `id`. | Fail |
| `publicId` | Legacy/public id isolated from canonical report id | Not found by name. | Needs Review |
| `savedAnalysisReportId` | Old frontend compatibility only | Used as API parameter and chat prop. | Fail |
| `reportId`/`publicId` mixing | Should be explicit and typed | Generic `id` is used for result route, detail fetch, and chat, making semantics ambiguous. | Fail |
| Analysis result lookup | Should not assume latest result without run id | Loading page fetches result list and chooses max numeric id after completion. | Fail |

## UI Fallback Findings

| Scenario | Current Behavior | Status |
|---|---|---|
| `recommendedPrograms=[]` | No contract field handling; mapped `universityList=[]` shows generic no-result state. | Partial |
| `portfolioStrategy.safety/match/reach` partially empty | No portfolioStrategy handling. | Fail |
| `tierSummary=null` | No tierSummary handling/rendering. | Fail |
| `tierDistribution={}` | No tierDistribution handling/rendering. | Fail |
| `consultantNotes=[]` | No consultantNotes handling; local `explanations` fallbacks exist. | Fail |
| `patternSummary.matchedPatterns=[]` | No patternSummary handling/rendering. | Fail |
| `successRateEstimate=null` | No successRateEstimate handling; UI uses legacy `estimatedChance` fallback. | Fail |
| `warnings=[]` | No report warnings component; empty/non-empty warnings not represented. | Fail |
| `riskSummary.flaggedPrograms=[]` | No riskSummary handling/rendering. | Fail |
| `metadata.algorithmVersion` missing | No metadata handling/rendering. | Fail |
| Legacy `generated_report` only and no `generatedReportV2` | No explicit compatibility branch found. Current flow ignores both names and maps legacy `response.result`. | Fail |
| Legacy competency fields missing/null | Uses numeric fallback to `0` before dividing, likely avoids crash but may silently display zero scores. | Partial |
| `program` missing/null | `useNonsulResult` falls back to `{}` and placeholder labels, likely avoids crash. | Partial |
| Invalid date text | Calendar parser returns null and falls back to default date. | Pass |

## Raw Issues

- ISSUE-13: ReportPayloadV2 is not represented as a frontend type, and required sections are not modeled.
- ISSUE-14: Result rendering does not consume `generatedReportV2`; it maps legacy `response.result` into an internal view model.
- ISSUE-15: Required ReportPayloadV2 sections are largely absent from UI rendering, including warnings, metadata, risk summary, tier summary, pattern summary, and next actions.
- ISSUE-16: Recommendation card placement uses legacy `category` filtering/labels instead of `displayBucket` or `portfolioStrategy.safety/match/reach`.
- ISSUE-17: `sectionFallback` and `fallbackReason` are not surfaced, so fallback/correction context cannot be communicated.
- ISSUE-18: Warning codes are not handled or displayed, including candidate insufficiency and section fallback codes.
- ISSUE-19: Critical candidate: `estimatedChance` is mapped to `passProbability` and rendered as `예상 합격 확률` with a percent sign.
- ISSUE-20: Critical candidate: probability language appears without a verified `successRateEstimate`/`simulationResults[].minimumPassProbability` basis.
- ISSUE-21: Chat remains tied to legacy `/nonsulfit/chat/{savedAnalysisReportId}` and does not use report-scoped chat messages.
- ISSUE-22: Chat message type handling excludes `SYSTEM` and does not clearly support the new message contract.
- ISSUE-23: Error handling only meaningfully covers 401 refresh and analysis `FAILED`; 403/404/422 and payload-section errors are not differentiated.
- ISSUE-24: Frontend state model does not distinguish `analysisRunId`, `reportId`, `publicId`, and legacy `savedAnalysisReportId`.
- ISSUE-25: Loading flow assumes the latest numeric legacy result id after completion instead of resolving the report from the analysis run.
- ISSUE-26: UI fallback coverage is ad-hoc and local-view-model based, not ReportPayloadV2 section based.
