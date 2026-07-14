# Frontend Tier Field Consumption Audit

Read-only audit. No source files were modified.

## 1. Executive Summary

- `src/types/reportPayloadV2.ts` is explicitly self-marked as unverified (`// SOURCE: task prompt summary, pending REPORT_PAYLOAD_V2_CONTRACT.md verification`, line 1) — the Frontend's tier contract is a guess, not a confirmed spec.
- The known `tierSummary.tiers[]` mismatch is confirmed and total: Frontend expects `{ summary?, tiers: { tierName, programIds, count?, note? }[] }`; Backend actually sends `{ studentEstimatedTier, recommendedTierRange, tierDistribution }`. Zero field-name overlap beyond the `tierSummary` wrapper key itself.
- `studentEstimatedTier`, `recommendedTierRange`, `tierDistribution`, `tierStatus`, `tierGap`, `tierDifference`, `consultantTier`, `riskLevel`, `portfolioGroup`, `selectionRank`, `candidateRank`, `quotaSatisfied`, `strategyStatus`, `actualBucketCounts`, `fallbackReasonCodes`, `requestedQuota` — **none** of these identifiers appear anywhere in `src/` (verified by full-repo grep). Any value Backend sends under these names is silently dropped before it reaches a component.
- `portfolio.selections[]` as a response path does not exist in the Frontend at all. Frontend only ever reads `generatedReportV2.recommendedPrograms[]`, a structurally different, smaller array with no `tierStatus`, `selectionRank`, or `candidateRank`.
- `recommendedPrograms[].tier` (Backend, null→0 coerced) has no counterpart field in `RecommendedProgramItem`. It survives the mapper's object spread but no component ever reads `program.tier`.
- `TierSummaryPanel.tsx` has one unconditional fallback string, `"특이사항 없음"`, that fires whenever `tierSummary.tiers` is empty — which is every real Backend response, since Backend never sends a `tiers` array. This will keep firing even if Backend fixes `tierSummary`'s field names, because the Frontend reads a field (`tiers`) that isn't part of Backend's actual `tierSummary` shape at all.
- `category` (badge/color) and `displayBucket` (tab placement) independently render the same three Korean words ("상향"/"적정"/"하향") from two unrelated lookup tables with no consistency check between them.
- Full detail in Sections 2–8.

## 2. Frontend Tier Field Inventory (Table A)

| Field path (TS type 기준) | Type | Optional? | 정의된 파일:라인 | 실제 값을 채우는 mapper | 렌더링하는 컴포넌트 | Fallback/기본값 로직 |
|---|---|---|---|---|---|---|
| `TierSummarySection.summary` | `string` | Yes | `types/reportPayloadV2.ts:88` | `reportV2Mapper.ts:109` (`objectOrEmpty(read(source,"tierSummary"))`, raw passthrough) | `TierSummaryPanel.tsx:18-22` | Not rendered if falsy (no placeholder text) |
| `TierSummarySection.tiers` | `TierSummaryItem[]` | No (required) | `types/reportPayloadV2.ts:89` | `reportV2Mapper.ts:137-140` (`normalizeReportPayloadV2`, defaults to `[]`) | `TierSummaryPanel.tsx:9,24-46` | `"특이사항 없음"` literal, `TierSummaryPanel.tsx:49`, fires when `tiers.length === 0` |
| `TierSummarySection.sectionFallback` / `.fallbackReason` | `boolean` / `string` | Yes | `types/reportPayloadV2.ts:17-20,87` (via `SectionFallbackFields`) | `reportV2Mapper.ts:109` (raw passthrough only) | **Not consumed anywhere** | N/A — dead field for this section (unlike program-level `sectionFallback`, which IS rendered — see Table D) |
| `TierSummaryItem.tierName` | `string` | No | `types/reportPayloadV2.ts:93` | No normalization; raw passthrough | `TierSummaryPanel.tsx:28,33` (also used as React `key`) | None — renders `undefined` / breaks list key uniqueness if missing |
| `TierSummaryItem.programIds` | `string[]` | No | `types/reportPayloadV2.ts:94` | No normalization | `TierSummaryPanel.tsx:36` (`.length` used as count fallback) | `.length` on a possibly-undefined array if Backend omits it (no `?? []` guard at this level) |
| `TierSummaryItem.count` | `number` | Yes | `types/reportPayloadV2.ts:95` | No normalization | `TierSummaryPanel.tsx:36` | `tier.count ?? tier.programIds.length` |
| `TierSummaryItem.note` | `string` | Yes | `types/reportPayloadV2.ts:96` | No normalization | `TierSummaryPanel.tsx:39-43` | Not rendered if falsy |
| `RecommendedProgramItem.displayBucket` | `"stable"\|"target"\|"reach"` | No (required) | `types/reportPayloadV2.ts:61` | `reportV2Mapper.ts:198-202` (4-step fallback chain, see Table D) | `Result.tsx` (tab filtering via `useNonsulResult.ts`), `reportV2Mapper.ts:291-295` (`bucketLabel`, legacy path only) | Defaults to `"target"` if unresolved by any of the 3 lookup strategies |
| `RecommendedProgramItem.category` | `"SAFE"\|"MODERATE"\|"RISKY"\|string` | No (required) | `types/reportPayloadV2.ts:62` | `reportV2Mapper.ts:203,434-437` (`toCategory`, defaults to `"MODERATE"`) | `TagChip.tsx:25-38` (badge label + color), used in `UnivTabs.tsx:34` | `categoryPresentation[category] ?? {label:"추천", colorClass:"gray"}` in `TagChip.tsx:26-29` |
| `RecommendedProgramItem.isFallbackCandidate` | `boolean` | Yes | `types/reportPayloadV2.ts:68` | No normalization; raw passthrough | **Not consumed anywhere** | N/A — declared, never rendered (dead field) |
| `RecommendedProgramItem.sectionFallback` / `.fallbackReason` | `boolean` / `string` | Yes | `types/reportPayloadV2.ts:17-20,57` | Raw passthrough | `UnivTabs.tsx:35-39` (badge), `UnivDetailSummary.tsx:55-61` (banner) | `fallbackReason || "일부 데이터가 보정되었습니다."` (`UnivDetailSummary.tsx:60`) |

## 3. Frontend가 기대하는 API Contract (역추적, Table B)

Reconstructed strictly from `src/types/reportPayloadV2.ts`; this is what the Frontend assumes it will receive, not what it verifiably receives.

| 최상위 경로 | Frontend가 기대하는 shape | 근거 파일:라인 | 이 필드가 비거나 없을 때 UI 동작 |
|---|---|---|---|
| `generatedReportV2.tierSummary` | `{ summary?: string; tiers: { tierName: string; programIds: string[]; count?: number; note?: string }[]; sectionFallback?: boolean; fallbackReason?: string }` | `types/reportPayloadV2.ts:87-97` | `tiers` missing/empty → `"특이사항 없음"` card. `summary` missing → intro paragraph simply omitted. |
| `generatedReportV2.recommendedPrograms[].displayBucket` | `"stable" \| "target" \| "reach"` (enum, required) | `types/reportPayloadV2.ts:3,61` | Unrecognized/missing → silently coerced to `"target"` (적정 탭), no error surfaced |
| `generatedReportV2.recommendedPrograms[].category` | `"SAFE" \| "MODERATE" \| "RISKY" \| string` | `types/reportPayloadV2.ts:7,62` | Non-string/missing → coerced to `"MODERATE"` by mapper; unrecognized string value → badge shows generic `"추천"` label |
| `generatedReportV2.recommendedPrograms[].isFallbackCandidate` | `boolean` (optional) | `types/reportPayloadV2.ts:68` | Any value accepted and stored, never displayed |
| `generatedReportV2.recommendedPrograms[].sectionFallback` / `.fallbackReason` | `boolean` / `string` (optional) | `types/reportPayloadV2.ts:17-20` | Missing → no "보정" badge shown at all |
| `generatedReportV2.portfolioStrategy.{safety,match,reach}.programIds` | `string[]` | `types/reportPayloadV2.ts:74-85` | Empty → tab filtering falls back to per-program `displayBucket` field instead (`useNonsulResult.ts:41-48`) |
| `generatedReportV2.recommendationSummary.bucketCounts` | `Partial<Record<"stable"\|"target"\|"reach", number>>` | `types/reportPayloadV2.ts:53` | Missing → `count` header falls back to `recommendedPrograms.length` (`Result.tsx:98-102`) |

## 4. Backend/Algorithm 대비 Shape Mismatch 전수 결과 (Table C)

Reference baseline = Backend/Algorithm actual send shapes given in the audit brief.

| 필드 | Backend 실제 송신 shape | Frontend 기대 shape | 불일치 유형 | 결과 UI 증상 |
|---|---|---|---|---|
| `tierSummary` (whole object) | `{studentEstimatedTier: int, recommendedTierRange: [int,int], tierDistribution: {str:int}}` | `{summary?: string, tiers: TierSummaryItem[]}` | **구조 다름** — only the wrapper key name matches; internal shape is entirely different (scalar+range+map vs array-of-objects) | `TierSummaryPanel` always renders the empty-state card (`"특이사항 없음"`); the actual tier number, range, and distribution the student needs to see are computed by Backend but never shown |
| `tierSummary.studentEstimatedTier` | Sent (`int`) | No such field in `TierSummarySection` | **아예 없음** (Frontend has zero field for this) | Never displayed anywhere on the Result page |
| `tierSummary.recommendedTierRange` | Sent (`[int,int]`) | No such field | **아예 없음** | Never displayed |
| `tierSummary.tierDistribution` | Sent (`{str:int}`) | No such field | **아예 없음** | Never displayed |
| `portfolio.selections[]` (path itself) | Exists as a Backend response array | Frontend has no reference to a `selections` key anywhere in `src/` | **경로 자체가 아예 없음** | Frontend instead reads an unrelated array, `generatedReportV2.recommendedPrograms[]`, with a different field set |
| `portfolio.selections[].displayBucket` | Sent | `RecommendedProgramItem.displayBucket` exists, but is read from `recommendedPrograms[]`, not from `selections[]` | **구조 다름 (다른 경로에서 동명 필드 소비)** | If the real per-selection bucket only lives on `selections[]`, the value the UI shows comes from a 4-step fallback chain (own field → portfolioStrategy program-id lookup → `metadata.displayBucket` → hardcoded `"target"`) that never looks at `selections[]` at all |
| `portfolio.selections[].tierStatus` | Sent | No such field anywhere in Frontend types | **아예 없음** | Never displayed; no UI element exists for tier status at all |
| `portfolio.selections[].category` | Sent | `RecommendedProgramItem.category` exists, read from `recommendedPrograms[]`, not `selections[]` | **구조 다름 (다른 경로)** | Same risk as `displayBucket` — badge color/label may reflect a `MODERATE` default rather than the real per-selection category if the two arrays diverge |
| `portfolio.selections[].selectionRank` | Sent | No such field | **아예 없음** | Never displayed; no ranking indicator anywhere in Result UI |
| `portfolio.selections[].candidateRank` | Sent | No such field | **아예 없음** | Never displayed |
| `portfolio.selections[].finalScore` | Sent | `RecommendedProgramItem.finalScore` exists (on `recommendedPrograms[]`, not `selections[]`) | **구조 다름 (다른 경로, 이름은 동일)** | `finalScore` is stored but not currently rendered on any Result screen (grep confirms no `.finalScore` render call) — same-name field but sourced from the wrong array |
| `portfolio.selections[].isFallbackCandidate` | Sent | `RecommendedProgramItem.isFallbackCandidate` exists (name matches) but is dead — never read by any component | **이름은 같으나 미소비** | No visible symptom today, but any Backend fix to this field will have zero UI effect until a component is written |
| `portfolio.selections[].fallbackReasonCode` | Sent | Frontend only has `fallbackReason` (free string), not `fallbackReasonCode` | **이름 다름 + 타입 다름 (code enum vs free text)** | `UnivTabs.tsx`/`UnivDetailSummary.tsx` render `fallbackReason` as a tooltip/banner string; if Backend only sends a `fallbackReasonCode` enum, the banner text is blank/undefined even though a fallback did occur |
| `resultContract.recommendedPrograms[].tier` / `generatedReportV2.recommendedPrograms[].tier` (null→0 coerced) | Sent | No `tier` field declared on `RecommendedProgramItem` | **아예 없음 (타입 미선언)** | The raw value survives the mapper's object spread (`{...objectOrEmpty(program), ...}`, `reportV2Mapper.ts:194`) so it exists in memory, but no component or type ever reads `program.tier` — it is invisible in the UI |
| `requestedQuota` / `actualBucketCounts` / `quotaSatisfied` / `strategyStatus` (portfolio selection contract v1) | Sent (new fields) | No such fields anywhere in Frontend | **아예 없음 (기능 자체가 미구현)** | No quota-satisfaction or strategy-status UI exists; Frontend's closest analog is `recommendationSummary.bucketCounts` (keys `stable/target/reach`), a self-computed field with different bucket-name vocabulary than Backend's presumed `actualBucketCounts` |
| `fallbackReasonCodes` (plural, portfolio-level array) | Sent (new field) | No such field | **아예 없음** | No portfolio-level fallback-reason display exists; only the per-program singular `fallbackReason` string is rendered |
| `riskLevel`, `consultantTier`, `tierGap`, `tierDifference`, `portfolioGroup` | Not specified in the reference baseline (no confirmed send shape given) | Not present in Frontend at all | **양쪽 다 미확인** | Cannot be scored without a confirmed Backend send shape — flagged for follow-up, not a proven mismatch |

## 5. Fallback/Placeholder 생성 지점 (Table D)

| Placeholder 문구/기본값 | 파일:라인 | 트리거 조건 | 실제 데이터 있어도 덮어쓸 가능성 |
|---|---|---|---|
| `"특이사항 없음"` | `TierSummaryPanel.tsx:49` | `tierSummary.tiers.length === 0` | **Yes, structurally guaranteed today.** Since Backend's actual `tierSummary` never contains a `tiers` array (Table C), this condition is always true for real responses — the placeholder is not an edge case, it is the permanent default. It will keep showing even after Backend sends correct `studentEstimatedTier`/`recommendedTierRange`/`tierDistribution` data, because nothing in `TierSummaryPanel` reads those fields. |
| `categoryPresentation[category] ?? {label:"추천", colorClass:"gray"}` | `TagChip.tsx:26-29` | `category` value not one of `"SAFE"\|"MODERATE"\|"RISKY"` (case-sensitive exact match) | Yes — any lowercase, differently-cased, or newly-introduced category string from Backend silently degrades to a generic gray "추천" badge with no error signal |
| `toCategory()` default `"MODERATE"` | `reportV2Mapper.ts:434-437` | `category` is non-string or absent on the raw program object | Yes — if Backend's real category lives on a different object path (e.g. `portfolio.selections[]` per Table C) rather than on `recommendedPrograms[]`, every program silently gets `"MODERATE"` regardless of its true risk category |
| `displayBucket` 4-step fallback, final default `"target"` | `reportV2Mapper.ts:198-202` | None of: own field, `portfolioStrategy` program-id lookup, `metadata.displayBucket` resolve to a valid bucket | Yes — same structural risk as `category`: if Backend's authoritative bucket assignment is on `portfolio.selections[]` (not read by Frontend at all), every unmatched program is silently placed in the "적정" (target) tab |
| `metadata.tag ?? "추천"` | `UnivDetailSummary.tsx:25` | `program.metadata.tag` is absent | **Yes, and it is the common case for real (non-legacy) responses.** `metadata.tag` is only ever populated by the legacy-compat mapper path (`reportV2Mapper.ts:333`, derived from `displayBucket` + Korean label); the v2 mapper path (`normalizeRecommendedPrograms`) never sets it. So for any genuine `generatedReportV2` payload, this always renders the generic `"추천"` word regardless of the program's real `displayBucket`/`category`. |
| `fallbackReason || "일부 데이터가 보정되었습니다."` | `UnivDetailSummary.tsx:60` | `sectionFallback === true` but `fallbackReason` is falsy | Yes — if Backend signals a fallback via `fallbackReasonCode` (enum) instead of the free-text `fallbackReason` Frontend expects (Table C), the badge appears but always shows this generic sentence instead of the real reason |
| `tier.count ?? tier.programIds.length` | `TierSummaryPanel.tsx:36` | `count` missing on a `TierSummaryItem` | N/A in practice — moot because `tiers[]` itself is never populated by real Backend data (see row 1) |

## 6. displayBucket/tierStatus/category 사용처 전수 조사 (Table E)

| UI 요소 | 소스 필드 | 값→문구/색상 매핑 로직 | 파일:라인 |
|---|---|---|---|
| Result page 상단 필터 탭 (하향/적정/상향) + 탭 선택 시 표시되는 카드 목록 | `RecommendedProgramItem.displayBucket` (via `portfolioStrategy` id-lookup first, field second) | `filterByDisplayBucket`: `stable→"하향"`, `target→"적정"`, `reach→"상향"` | `Result.tsx:33-37`; selection logic `useNonsulResult.ts:14-49` |
| 카드 상세 화면 상단 "○○캠퍼스 · ○○ 지원권" 라벨 | `metadata.tag` (legacy-only; **not** derived from `displayBucket` on real v2 payloads — see Table D) | Legacy mapper only: `bucketLabel`: `stable→"하향"`, `target→"적정"`, `reach→"상향"`, then `"${label} ${n}"` | `reportV2Mapper.ts:291-295,333` (legacy path); consumed at `UnivDetailSummary.tsx:25,50` |
| 대학 탭 카드 상단 배지 색상/문구 | `RecommendedProgramItem.category` | `TagChip`: `RISKY→"상향"/red`, `MODERATE→"적정"/amber`, `SAFE→"하향"/teal`, unknown→`"추천"`/gray | `TagChip.tsx:7-29`; consumed at `UnivTabs.tsx:34` |
| Tier 요약 패널 | — | Not driven by `displayBucket`/`category`/`tierStatus` at all; only by `tierSummary.tiers[]`, which is always empty in practice | `TierSummaryPanel.tsx` |
| `tierStatus` | — | **Not used anywhere.** Field does not exist in any Frontend type, mapper, or component. | N/A |

**Cross-field risk:** `displayBucket` and `category` independently produce the identical three Korean words ("상향"/"적정"/"하향") through two unrelated lookup tables (`filterByDisplayBucket` in `Result.tsx` vs `categoryPresentation` in `TagChip.tsx`) with no shared source or consistency check. Because `category` and `displayBucket` are set by potentially different upstream logic (risk classification vs portfolio placement), a program can legitimately have `displayBucket: "stable"` (placed under the "하향" tab) while its badge reads `category: "RISKY"` → "상향" — showing contradictory signals on the same card. This is a pre-existing Frontend design risk independent of the tier-field mismatches in Table C.

## 7. 심각도 및 수정 주체 판정

| # | Mismatch | 심각도 | 수정 주체 | 판정 근거 |
|---|---|---|---|---|
| 1 | `tierSummary.tiers[]` shape vs Backend's `{studentEstimatedTier, recommendedTierRange, tierDistribution}` | **CRITICAL** | 둘 다 계약을 재정의해야 함 | Frontend's type was self-marked "unverified" (line 1 comment); Backend's shape is the canonical actual-send data. Neither side currently agrees on a real contract — Frontend must rewrite `TierSummarySection`/`TierSummaryItem` and `TierSummaryPanel` around the Backend's actual fields; this is not a simple rename since the structures are incompatible (array-of-tiers vs scalar+range+map). |
| 2 | `studentEstimatedTier`/`recommendedTierRange`/`tierDistribution` entirely unconsumed | **CRITICAL** | Frontend가 고쳐야 함 | Backend already sends canonical data (per reference baseline); Frontend simply never modeled or rendered it. No Backend change needed. |
| 3 | `portfolio.selections[]` path missing entirely; Frontend reads `recommendedPrograms[]` instead | **CRITICAL** | 둘 다 계약을 재정의해야 함 | Unclear from Frontend code alone whether `recommendedPrograms[]` is meant to be Backend's forwarded/flattened `selections[]`, or a genuinely separate array. This ambiguity itself needs a joint contract decision before either side can "fix" anything. |
| 4 | `displayBucket`/`category`/`finalScore` sourced from `recommendedPrograms[]` while Backend's reference lists them under `selections[]` | **MODERATE** | 둘 다 계약을 재정의해야 함 | Same-name fields exist on both sides but the array path differs; needs confirmation of which array is canonical before assigning blame. |
| 5 | `tierStatus`, `selectionRank`, `candidateRank` never modeled | **MODERATE** | Frontend가 고쳐야 함 | These are Backend-confirmed real fields; Frontend has simply not built UI/types for them yet — a straightforward add, not a contract conflict. |
| 6 | `isFallbackCandidate` declared but dead (not rendered) | **COSMETIC** | Frontend가 고쳐야 함 | Type already exists; only a rendering gap remains. |
| 7 | `fallbackReasonCode` (enum, Backend) vs `fallbackReason` (free string, Frontend) | **MODERATE** | 둘 다 계약을 재정의해야 함 | Different types (enum code vs display string) serve different purposes; needs a joint decision on whether Frontend maps codes to copy locally or Backend sends both. |
| 8 | `recommendedPrograms[].tier` (Backend, null→0 coerced) unconsumed | **CRITICAL** | Frontend가 고쳐야 함 | This looks like the single most direct, per-program tier signal Backend sends, yet Frontend has no field for it at all and instead invented an unrelated `tierSummary.tiers[]` UI. Likely the highest-value fix. |
| 9 | `requestedQuota`/`actualBucketCounts`/`quotaSatisfied`/`strategyStatus`/`fallbackReasonCodes` (v1 quota contract) entirely absent | **MODERATE** | Frontend가 고쳐야 함 | New Backend feature; Frontend has not built any corresponding UI — a feature gap, not a broken contract. |
| 10 | `category` vs `displayBucket` producing conflicting Korean labels via independent lookup tables | **MODERATE** | Frontend가 고쳐야 함 | Purely a Frontend-internal inconsistency; not a Backend contract issue. |
| 11 | `metadata.tag` fallback masking real bucket/category data on every v2 (non-legacy) response | **MODERATE** | Frontend가 고쳐야 함 | `metadata.tag` was only ever wired for the legacy-compat path; the v2 mapper needs to derive this label from `displayBucket`/`category` the same way the legacy path does. |

**Fallback logic that will keep masking data even after Backend fixes ship** (from Table D): the `"특이사항 없음"` placeholder in `TierSummaryPanel.tsx:49`, the `metadata.tag ?? "추천"` default in `UnivDetailSummary.tsx:25`, and the `toCategory()`/`displayBucket` mapper-level defaults in `reportV2Mapper.ts` will all continue to fire after a Backend-only fix, because each reads a field name the Backend reference does not confirm sending on the path Frontend currently reads. Fixing Backend's `tierSummary` shape alone will **not** make the tier panel show real data — `TierSummaryPanel.tsx` and its prop type must also be rewritten to read `studentEstimatedTier`/`recommendedTierRange`/`tierDistribution` (or whatever fields the two teams agree on).

## 8. Backend/Algorithm 팀에게 전달할 요약

- 현재 화면의 "지원 티어 요약" 카드는 거의 항상 "특이사항 없음"만 보여주고 있습니다. Frontend가 `tierSummary.tiers`라는 배열 필드를 기다리고 있는데, 실제로 보내주시는 `tierSummary`에는 이 필드가 없기 때문입니다 (`studentEstimatedTier`, `recommendedTierRange`, `tierDistribution`만 존재). 학생이 보는 화면에 실제 티어 정보가 전혀 노출되지 않고 있습니다.
- 이 문제는 Backend가 필드명을 바꾼다고 바로 해결되지 않습니다. Frontend 쪽 컴포넌트(`TierSummaryPanel`)와 타입 정의를 함께 다시 만들어야 하므로, 두 팀이 `tierSummary`의 최종 필드 이름/구조를 먼저 합의해주셔야 합니다. (예: `studentEstimatedTier`를 몇 티어인지 숫자로 그대로 보여줄지, `recommendedTierRange`를 "○~○ 티어 권장" 문구로 보여줄지, `tierDistribution`을 막대그래프로 보여줄지 등 UI 설계가 선행되어야 합니다.)
- 각 대학/학과 카드(추천 프로그램)마다 보내주시는 `tier` 필드(null이면 0으로 보정된 값)는 현재 화면 어디에도 표시되지 않고 있습니다. 이 필드가 학생에게 가장 직접적인 "이 학과는 내 티어에서 몇 번째 티어인지" 정보로 보이는데, Frontend가 아예 읽고 있지 않습니다 — Backend가 이미 보내주고 계신 데이터이므로 Frontend 작업만으로 해결 가능하지만, 어떤 이름/문구로 노출할지 먼저 확인 부탁드립니다.
- `portfolio.selections[]` 배열(선택 순위 `selectionRank`/`candidateRank`, 티어 상태 `tierStatus`, 정족수 충족 여부 `quotaSatisfied`, 전략 상태 `strategyStatus` 등을 포함)을 Frontend는 전혀 참조하고 있지 않습니다. Frontend는 대신 `generatedReportV2.recommendedPrograms[]`라는 별도 배열만 읽고 있는데, 이 배열에는 `selectionRank`, `candidateRank`, `tierStatus`, `quotaSatisfied`, `strategyStatus` 같은 필드가 아예 존재하지 않습니다. **두 배열이 같은 데이터를 가리키는 것인지, 서로 다른 용도인지부터 확인이 필요합니다.** 같은 데이터라면 Frontend가 읽는 경로를 `portfolio.selections[]`로 바꾸거나, Backend가 `recommendedPrograms[]`에도 이 필드들을 동일하게 실어주셔야 화면에 반영할 수 있습니다.
- fallback(보정) 사유를 나타내는 필드명이 서로 다릅니다: Backend는 `fallbackReasonCode`(코드값 추정)를 보내고, Frontend는 `fallbackReason`(자유 문장)을 기대하고 있습니다. 지금처럼 이름이 다르면 "보정" 배지는 뜨더라도 이유 문구는 항상 기본 문장("일부 데이터가 보정되었습니다")만 보이고, Backend가 실제로 계산한 사유는 화면에 노출되지 않습니다. 코드값을 보내실 거라면 Frontend가 코드→문구 매핑표를 만들 수 있도록 가능한 코드 목록을 공유해주세요.
- `requestedQuota`, `actualBucketCounts`, `quotaSatisfied`, `strategyStatus`, `fallbackReasonCodes` (포트폴리오 정족수 계약 v1) 관련 화면이 Frontend에 아직 전혀 없습니다. 이 값들을 학생에게 보여줄 계획이시라면, 어떤 화면/문구로 노출할지 먼저 논의가 필요합니다 — 지금은 Backend가 값을 보내주셔도 화면에 반영되지 않습니다.
- `riskLevel`, `consultantTier`, `tierGap`, `tierDifference`, `portfolioGroup` 필드는 Frontend에서 전혀 찾을 수 없었고, 이번 조사에 주어진 Backend 실제 송신 shape 자료에도 명시되어 있지 않았습니다. 이 필드들을 실제로 보내고 계신지, 어떤 shape인지 확인 부탁드립니다.
