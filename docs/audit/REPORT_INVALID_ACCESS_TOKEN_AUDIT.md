# Report detail INVALID_ACCESS_TOKEN audit

- 직접 원인: 리포트 라우트가 인증 보호 밖에 있어 AuthContext hydration 전에 상세 hook이 실행될 수 있었다.
- 상세/목록은 동일한 Axios client를 사용하지만, 기존 refresh 조건은 HTTP 401만 인식했다.
- 리포트 라우트를 hydration-aware 보호 경계로 옮기고 토큰 없는 report API 호출을 차단했다.
- `INVALID_ACCESS_TOKEN`도 한 번만 refresh하며 성공 시 원 요청 Bearer 헤더를 교체한다.
- refresh 실패 시 인증 키만 제거하고 로그인으로 이동한다. 409 계약 오류는 refresh 대상이 아니다.
