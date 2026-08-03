# 회원탈퇴 API 및 프론트엔드 연동 가이드

작성일: 2026-08-03

## 1. 변경 목적

로그인한 사용자가 본인 계정을 탈퇴할 수 있도록 인증 API에 회원탈퇴 기능을 추가했습니다.

결제, 분석 리포트, 채팅 등 기존 이력과 외래키 무결성을 보존해야 하므로 `users` 행을 물리적으로 삭제하지 않습니다. 대신 개인정보와 인증정보를 익명화하고 계정을 비활성화하는 방식으로 처리합니다.

## 2. API 계약

### 요청

```http
DELETE /api/v1/auth/me
Authorization: Bearer {accessToken}
```

- 요청 본문은 없습니다.
- 현재 로그인한 사용자의 Access Token이 반드시 필요합니다.
- Refresh Token은 요청 본문이나 헤더로 전송하지 않습니다.

### 성공 응답

```http
HTTP/1.1 204 No Content
```

- 성공 시 응답 본문은 비어 있습니다.
- 프론트엔드에서 `response.json()`을 호출하지 않아야 합니다.

### 주요 오류 응답

| HTTP 상태 | 오류 코드 | 의미 | 프론트 처리 |
| --- | --- | --- | --- |
| `401` | `INVALID_ACCESS_TOKEN` | Access Token이 없거나 유효하지 않음 | 로그인 화면으로 이동 |
| `401` | `USER_NOT_FOUND` | 사용자 없음 또는 이미 비활성화된 계정 | 로컬 인증정보를 제거하고 로그인 화면으로 이동 |

오류 본문은 기존 백엔드 공통 오류 형식을 그대로 사용합니다.

## 3. 탈퇴 처리 범위

회원탈퇴 트랜잭션에서 다음 작업을 함께 수행합니다.

1. 이메일을 중복되지 않는 내부 익명 이메일로 변경합니다.
2. 이름을 `탈퇴한 회원`으로 변경합니다.
3. 비밀번호 해시를 기존 비밀번호로 인증할 수 없는 임의 값으로 교체합니다.
4. 사용자 역할을 일반 사용자로 변경합니다.
5. `is_active`를 `false`로 변경합니다.
6. 해당 사용자의 모든 Refresh Token을 삭제합니다.
7. 사용자 행과 결제·리포트 등 관련 이력은 보존합니다.

처리 완료 직후의 인증 동작은 다음과 같습니다.

- 기존 Access Token: 사용자 활성 상태 확인 단계에서 거부
- 기존 Refresh Token: 저장된 토큰이 삭제되어 거부
- 기존 이메일·비밀번호 로그인: 거부
- 탈퇴 전 이메일로 재가입: 가능

DB 마이그레이션과 신규 환경변수는 필요하지 않습니다.

## 4. 백엔드 코드 변경사항

| 파일 | 변경 내용 |
| --- | --- |
| `app/api/v1/auth.py` | `DELETE /auth/me` 라우트 및 `204` 응답 추가 |
| `app/services/auth_service.py` | 계정 익명화, 비활성화, 토큰 제거를 하나의 트랜잭션으로 처리 |
| `app/repositories/user_repository.py` | 사용자별 Refresh Token 일괄 삭제 쿼리 추가 |
| `tests/test_auth.py` | 인증 필수, 개인정보 익명화, 사용자 행 보존, 토큰 무효화, 로그인 차단, 이메일 재가입 테스트 추가 |

## 5. 프론트엔드 연동 방법

### 호출 함수 예시: Axios

아래 예시는 Axios 인스턴스의 `baseURL`이 `/api/v1`까지 포함하고 있고, 기존 인터셉터가 Access Token을 `Authorization` 헤더에 넣는 구조를 기준으로 합니다.

```ts
export async function withdrawMembership(): Promise<void> {
  await api.delete('/auth/me');
}
```

`baseURL`이 백엔드 도메인까지만 포함한다면 `/api/v1/auth/me`를 호출해야 합니다.

### 호출 함수 예시: Fetch

```ts
export async function withdrawMembership(accessToken: string): Promise<void> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/v1/auth/me`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status !== 204) {
    throw new Error(`회원탈퇴 실패: ${response.status}`);
  }
}
```

### 성공 후 필수 처리 순서

1. Access Token과 Refresh Token을 모두 제거합니다.
2. 전역 사용자 상태와 인증 상태를 초기화합니다.
3. 사용자별 React Query, SWR 또는 기타 클라이언트 캐시를 제거합니다.
4. Axios 등의 기본 `Authorization` 헤더를 제거합니다.
5. 로그인 화면 또는 서비스 첫 화면으로 이동합니다.

```ts
async function handleWithdrawMembership() {
  await withdrawMembership();

  authStorage.clear();
  queryClient.clear();
  delete api.defaults.headers.common.Authorization;
  authStore.reset();
  navigate('/login', { replace: true });
}
```

저장소와 상태관리 라이브러리 이름은 실제 프론트엔드 구조에 맞게 바꿔 사용합니다.

## 6. 화면 처리 권장사항

- 실행 전 복구할 수 없는 작업임을 안내하는 확인 모달을 표시합니다.
- 사용자가 명시적으로 확인한 경우에만 API를 호출합니다.
- 요청 중에는 버튼을 비활성화하여 중복 요청을 방지합니다.
- `204` 응답을 받은 뒤 성공 안내를 표시하고 인증정보를 제거합니다.
- `401` 응답에서는 남아 있는 인증정보를 제거한 뒤 재로그인을 안내합니다.
- Access Token이나 Refresh Token을 로그, 오류 추적 도구, 분석 이벤트에 기록하지 않습니다.

## 7. 프론트엔드 검증 체크리스트

- [ ] 로그인 상태에서 탈퇴 요청이 `204`로 완료된다.
- [ ] `204` 응답을 JSON으로 파싱하지 않는다.
- [ ] 탈퇴 직후 모든 로컬 토큰과 사용자 캐시가 제거된다.
- [ ] 탈퇴 후 보호 페이지에 다시 접근할 수 없다.
- [ ] 탈퇴한 이메일과 기존 비밀번호로 로그인할 수 없다.
- [ ] 탈퇴한 이메일로 새 계정을 만들 수 있다.
- [ ] 미인증 상태에서 탈퇴 시 `401` 오류가 정상 처리된다.
- [ ] 탈퇴 버튼의 연속 클릭으로 중복 요청이 발생하지 않는다.

## 8. 백엔드 검증 결과

- 회원가입·로그인·토큰 갱신 기존 흐름 회귀 테스트 통과
- 회원탈퇴 성공 및 미인증 요청 테스트 통과
- 사용자 행 보존 및 개인정보 익명화 검증 통과
- Access Token·Refresh Token 무효화 검증 통과
- 기존 이메일 로그인 차단 및 재가입 검증 통과
- Ruff 정적 검사 통과
