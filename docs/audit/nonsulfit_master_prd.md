# NonsulFit Frontend Contract Refactor — Master PRD & 공통 실행 지침

이 문서는 아래 모든 프롬프트/커밋에 공통으로 선행 적용되는 상위 문서다.
- 감사 3단계 프롬프트 (`nonsulfit_audit_prompts_split.md`)
- Phase 1~4 세부 커밋 (`nonsulfit_refactor_phase_commits_v2.md`)
- 앞으로 추가될 모든 하위 프롬프트/커밋

Codex/Claude Code에 개별 프롬프트를 넣기 전에 이 문서를 먼저 컨텍스트로 제공하거나,
각 프롬프트 맨 위에 "아래 Master PRD를 따른다"는 한 줄을 붙이는 방식으로 쓴다.

---

## 1. 문제 정의

NonsulFit 프론트엔드는 Backend Presentation Contract(`generatedReportV2` /
`ReportPayloadV2`)가 나오기 전에 만들어진 legacy 구조 위에서 동작 중이다.
2026-07-09 감사 결과 계약 일치도는 **22/100**, Critical 2건(점수/확률 의미 오표현),
High 14건(API 흐름, 타입, 카드 배치 등)이 확인됐다. 목표는 이 프론트를
새 백엔드 계약과 안전하게, 단계적으로, 회귀 없이 정렬시키는 것이다.

## 2. 목표 / 비목표

**목표**
- `generatedReportV2`를 결과 페이지의 primary render source로 전환
- 점수/확률 의미 오표현 제거 (Critical 최우선)
- `analysisRunId`/`reportId`/`publicId`/`savedAnalysisReportId` 4개 ID 의미 분리
- legacy API/필드를 compatibility layer로 완전히 격리
- 계약 일치도 22/100 → (1차 목표) 70/100 이상, (최종 목표) 90/100 이상

**비목표 (이번 리팩터 범위 아님)**
- 백엔드 API 자체 구현/변경 (백엔드는 이미 계약을 제공한다고 가정,
  단 실제로는 계약 문서가 워크스페이스에 없는 상태 — Section 5 참고)
- 디자인 시스템 전면 개편 (컴포넌트 스타일링은 기존 유지, 데이터 소스만 교체)
- 성능 최적화, 번들 사이즈 최적화 (이번 범위 아님, 회귀만 방지)
- 신규 기능 추가 (nextActions 등은 계약이 요구하는 최소 렌더링까지만)

## 3. 성공 지표

- [ ] `tsc` 컴파일 100% 통과 (모든 Phase 공통 게이트)
- [ ] "합격확률"/"합격 확률"/"예상 합격 확률" 문자열 코드베이스 전체 0건
- [ ] `category`가 카드 배치 로직에 관여하는 코드 0건 (grep 검증 가능)
- [ ] `savedAnalysisReportId`가 신규 컴포넌트 트리에서 참조되는 곳 0건
  (legacy adapter 내부 제외)
- [ ] Issue List 26건 중 Critical/High 전부 해소, Medium 80% 이상 해소
- [ ] 회귀 테스트(Commit 4.6 등) CI 통과

## 4. 용어 정의 (Single Source of Truth)

이 프로젝트 전체에서 아래 이름/의미는 고정이며, 어떤 커밋도 이 정의를 바꾸지 않는다.
계약 문서 원문이 나중에 확보되면 이 표를 먼저 갱신하고, 그 다음 영향받는 커밋을
재검토한다.

| 용어 | 의미 | 절대 금지 |
|---|---|---|
| `analysisRunId` | 분석 상태 polling 전용 id | 리포트/챗봇 조회에 사용 금지 |
| `reportId` | 신규 리포트/챗봇 조회 전용 id (canonical) | legacy id와 혼용 금지 |
| `publicId` | legacy 호환 조회 전용 id | 신규 canonical id처럼 사용 금지 |
| `savedAnalysisReportId` | 구프론트 호환 이름, compatibility layer 전용 | 신규 컴포넌트에서 참조 금지 |
| `displayBucket` | 추천 카드 **위치**(stable/target/reach) 결정 필드 | 위험도 표시 용도로 쓰지 않음 |
| `category` | 위험도 **표시**(상세 설명/뱃지) 전용 필드 | 카드 배치 결정에 관여 금지 |
| `finalScore` | 추천 우선순위 점수 | 확률(%)로 표현 금지 |
| `estimatedChance` | 계약이 별도로 허용하지 않는 한 확률 의미 없음 | `passProbability` 같은 이름으로 매핑 금지 |
| `successRateEstimate` | `simulationResults[].minimumPassProbability` 근거가 있을 때만 확률(%) 표현 가능 | 근거 없이 확률 카피 노출 금지 |
| `warnings` | 시스템 경고 배열, 별도 패널 | `riskSummary`와 merge 금지 |
| `riskSummary.reasons` | 위험 요약 UI 전용 | `warnings`와 merge 금지, 전체 시스템 오류처럼 표시 금지 |
| `sectionFallback`/`fallbackReason` | 데이터 부족 시 보정됐다는 표시 | 점수/위험도가 실제로 바뀐 것처럼 보이게 표시 금지 |

## 5. 리스크 & 전제 (모든 프롬프트가 인지해야 함)

| ID | 리스크 | 현재 대응 |
|---|---|---|
| RISK-01 (=ISSUE-01) | 계약 문서 4종(`FRONTEND_BACKEND_CONTRACT.md` 등)이 워크스페이스에 없음 | 원본 태스크 프롬프트에 명시된 필드명/의미를 잠정 기준으로 사용. 문서 확보 시 Section 4 용어표를 먼저 갱신하고 영향받는 커밋 재검토 |
| RISK-02 | 백엔드가 실제로 `generatedReportV2`를 아직 안 내려줄 수 있음 | `reportV2Mapper`는 mock fixture로 먼저 검증하고, 실서버 연동은 별도 커밋으로 분리 (Phase 3와 독립적으로 진행 가능하게 설계됨) |
| RISK-03 | 감사 시점(`_wip_01`, `_wip_02`)과 실제 구현 시점 사이 코드가 바뀔 수 있음 | 각 커밋 착수 직전 해당 파일을 다시 `view`해서 최신 상태 확인 (감사 결과를 맹신하지 않음) |
| RISK-04 | category 필터링 정확한 위치 등 일부 항목은 감사에서도 "정확한 라인 미확인" 상태로 남음 (예: Phase 2 Commit 2.2) | 해당 커밋 착수 시 grep으로 재확인 후 진행, 예상과 다르면 이 문서로 돌아와 영향 범위 재평가 |

## 6. 전체 커밋에 적용되는 공통 규칙 (Non-negotiable)

1. **단일 scope 원칙**: 커밋 하나는 하나의 논리적 변경만 담는다. API 전환 커밋에
   naming 정리를 같이 넣지 않는다.
2. **행동 보존 우선**: 구조를 옮기는 커밋(예: mapper 추출)과 로직을 바꾸는 커밋을
   분리한다. 옮기면서 동시에 고치지 않는다.
3. **git diff 필수**: 모든 커밋 리포트에 실제 diff 요약을 포함한다. 전체 diff를
   그대로 출력하지 않고, 변경된 파일/함수 단위로 요약한다.
4. **회귀 우선 확인**: 새 기능을 추가하기 전에 기존 동작(특히 Pass/Partial로
   판정된 부분 — 401 refresh retry, FAILED 상태 처리, 날짜 파서 fallback 등)이
   깨지지 않는지 먼저 확인한다.
5. **타입 게이트**: `tsc` 컴파일이 깨지는 상태로 커밋을 종료하지 않는다.
   깨질 수밖에 없는 중간 상태라면 커밋을 더 잘게 쪼갠다.
6. **금지 문구/필드 재검사**: Section 4 용어표에 있는 "절대 금지" 항목은
   모든 커밋 완료 시 grep으로 재확인한다 (감사에서 확인한 방법과 동일).
7. **legacy 제거 아님, 격리**: 이번 리팩터는 legacy API를 삭제하는 게 아니라
   `legacyApi.ts`/compatibility layer로 격리하는 것이다. 임의로 legacy 라우트를
   완전히 지우지 않는다.
8. **불확실하면 멈추고 보고**: 감사 결과와 실제 코드가 다르거나(RISK-03/04),
   계약 원문과 태스크 프롬프트 요약이 충돌하는 게 발견되면, 추측으로 진행하지
   말고 발견 사실만 보고한 뒤 다음 지시를 기다린다.
9. **한 커밋 = 한 응답**: Codex/Claude Code가 커밋을 만들 때마다 아래 "완료
   보고 포맷"(Section 8)을 따른다.
10. **Severity 재분류 금지**: 이미 확정된 Issue의 Critical/High/Medium/Low
    등급을 임의로 낮춰서 우선순위를 바꾸지 않는다. 등급 변경이 필요하다고
    판단되면 근거를 남기고 별도로 보고한다.

## 7. 실행 순서 (전체 그림)

```
[선행] 계약 문서 4종 확보 시도 (RISK-01)
  ↓
Phase 1 — Critical Contract Safety   (Commit 1.1 ~ 1.4)
  ↓
Phase 2 — Report Rendering Migration (Commit 2.1 ~ 2.5)
  ↓
Phase 3 — API Flow & ID Migration    (Commit 3.1 ~ 3.5)
  ↓
Phase 4 — Legacy Isolation & Regression Guard (Commit 4.1 ~ 4.6)
  ↓
[검증] Section 3 성공 지표 재측정 → 계약 일치도 재산정
```

Phase 순서를 바꾸지 않는다. Phase 1(Critical) 없이 Phase 2를 먼저 하면
잘못된 점수/확률 표현이 새 UI에도 그대로 옮겨갈 위험이 있다 (ISSUE-19/20).

## 8. 모든 커밋 공통 완료 보고 포맷

```
1. 커밋 메시지 (scope(범위): 한 줄 요약)
2. 변경 파일 목록 + 파일별 1줄 요약 (전체 diff 아님)
3. 관련 Issue ID / 완료 기준 체크 결과
4. tsc 컴파일 결과
5. 회귀 확인한 기존 동작 (있다면)
6. 다음 커밋에 영향 주는 발견 사실 (있다면, 없으면 "없음"이라고 명시)
```

## 9. 에스컬레이션 기준 (DHK에게 되물어야 하는 경우)

- 계약 문서 원문과 현재 잠정 필드명(Section 4)이 명백히 충돌하는 걸 발견했을 때
- 감사에서 "정확한 위치 미확인"으로 남긴 부분(RISK-04)이 예상과 크게 다른
  아키텍처로 돼 있을 때 (예: category 필터링이 백엔드 쿼리 파라미터로 이미
  하드코딩돼 있는 경우 등)
- 백엔드가 `generatedReportV2`를 아직 전혀 내려주지 않아서 Phase 2/3의 실제
  연동 검증이 mock으로만 가능한 상태가 장기화될 때
- Critical(ISSUE-19/20) 수정이 다른 화면(랜딩 페이지 등)의 마케팅 카피와
  충돌해서 프로덕트 판단이 필요할 때

이 기준에 해당하지 않는 나머지는 Section 6의 공통 규칙 안에서 자율적으로 진행한다.

---

## 부록 A. 문서 간 참조 관계

```
Master PRD (이 문서)
 ├─ nonsulfit_audit_prompts_split.md       (감사 3단계 프롬프트 — 완료됨)
 │    ├─ _wip_01_api_naming.md              (완료)
 │    ├─ _wip_02_payload_ui.md              (완료)
 │    └─ FRONTEND_BACKEND_CONTRACT_AUDIT.md (완료, 일치도 22/100)
 └─ nonsulfit_refactor_phase_commits_v2.md (Phase 1~4 세부 커밋 — 실행 대상)
      Issue ID ↔ 커밋 매핑표 포함 (26건 중 25건 매핑)
```

## 부록 B. Severity 기준 (감사와 동일, 리팩터 전체에서 재사용)

- **Critical**: 점수/확률/위험도 의미를 잘못 표시하거나 category를 변경하는 문제
- **High**: 신규 API 흐름 또는 generatedReportV2 구조와 불일치
- **Medium**: fallback/empty/error handling 부족
- **Low**: naming, UI copy, type refinement 수준