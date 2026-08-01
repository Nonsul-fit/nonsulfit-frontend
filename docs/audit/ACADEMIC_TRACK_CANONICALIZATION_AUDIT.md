# Academic track canonicalization audit

- 직접 원인: `mapFormToAnalysisInput`이 한국어 UI 값을 `student.academic`으로 만들고 같은 한국어 목록으로 즉시 검증해 canonical API 계약과 어긋났다.
- 오류 위치: `src/adapters/analysisInputMapper.ts`의 `mapFormToAnalysisInput`, `validateAnalysisInput`, 기존 `toAcademic`.
- 데이터 흐름: Step01 canonical 선택값 → FormContext `academicTrack` → mapper 정규화/검증 → PUT payload `student.academicTrack`.
- canonical 규칙: 지원되는 한국어·구형 alias를 `HUMANITIES`, `NATURAL_SCIENCE`, `MEDICAL`, `INTEGRATED`로 변환한다.
- legacy 경계: mapper와 GET 입력 복원에서만 `academicTrack ?? academic ?? null`을 읽고, 이후 `academicTrack`만 유지한다.
- 검증: 신규 정규화·legacy 복원·우선순위·payload 키 회귀 테스트와 전체 테스트/빌드를 실행했다.
