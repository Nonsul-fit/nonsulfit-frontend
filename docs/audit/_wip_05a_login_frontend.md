## Login Request Payload (필드명, 타입, 가공 로직)

로그인 요청의 `axios.post(url, data, config)` 두 번째 인자는 빈 객체이다. body payload 필드명은 없다.

근거 코드:

```tsx
const credentials = window.btoa(`${values.email}:${values.password}`);

const response = await api.post(
  "/auth/login",
  {},
  {
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  },
);
```

- Body fields: 없음. 두 번째 인자는 `{}`.
- Credential source fields: `values.email`, `values.password`.
- Runtime type: 둘 다 `useForm`의 input `event.target.value`에서 온 string.
- 가공 로직: `trim`, 공백 제거, 타입 변환 없음.
- 인증값 가공: `${values.email}:${values.password}` 문자열을 `window.btoa(...)`로 Base64 인코딩한 뒤 `Authorization: Basic ...` 헤더에 넣음.
- 빈 값 검사: `!values.email || !values.password`만 검사한다. 공백 문자열은 별도 trim 검사가 없다.

`useForm`은 입력값을 그대로 저장한다.

```ts
const { name, value } = e.target;
setValues((prev) => ({ ...prev, [name]: value }));
```

## Transmission Method (JSON/form-urlencoded/FormData 중 무엇인지, 근거 코드 포함)

로그인 body는 URLSearchParams나 FormData가 아니라 순수 JS 객체 `{}`이다. axios 인스턴스의 기본 Content-Type은 `application/json`이므로 JSON 요청으로 직렬화된다. 실제 credential은 JSON body가 아니라 `Authorization` 헤더의 Basic token으로 전송된다.

근거 코드:

```ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});
```

요청 인터셉터는 `/auth/login`을 토큰 자동 첨부 제외 대상으로 분류한다.

```ts
const isNoTokenRequired =
  config.url?.includes("/auth/login") ||
  config.url?.includes("/login") ||
  config.url?.includes("/auth/register") ||
  config.url?.includes("/signup") ||
  config.url?.includes("/auth/check-email");

if (token && !isNoTokenRequired) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

단, 응답 인터셉터는 `/auth/login`을 401 refresh/retry 대상에서 제외하지 않는다. 기존 `refreshToken`이 localStorage에 있으면 401 응답 후 원래 로그인 요청의 Authorization 헤더를 Bearer token으로 바꾸고 같은 요청을 재시도할 수 있다.

```ts
if (error.response?.status === 401 && !originalRequest._retry) {
  originalRequest._retry = true;
  const refreshToken = localStorage.getItem("refreshToken");
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/auth/token/access`,
    {},
    { headers: { Authorization: `Bearer ${refreshToken}` }, timeout: 60000 },
  );
  originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
  return api(originalRequest);
}
```

## Multiple Entry Points

단일 진입점 확인됨.

- Route: `src/App.tsx`에서 `/login`이 `LoginPage`로 연결된다.
- Form submit: `src/pages/Login/LoginPage.tsx`의 `<form onSubmit={handleLogin}>`.
- API 호출 방식: `LoginPage.tsx`가 `src/api/auth.ts`의 함수 없이 `api.post("/auth/login", {}, ...)`를 직접 호출한다.
- Header와 Landing CTA는 로그인 API를 직접 호출하지 않고 `/login`으로 navigate만 한다.
- 코드베이스 검색 결과 `/auth/login` 직접 호출은 `src/pages/Login/LoginPage.tsx` 한 곳이다.

재시도 경로는 존재한다.

- `src/api/axios.ts` 응답 인터셉터가 모든 401에 대해 refresh 후 원 요청을 재실행한다.
- 이 로직은 `/auth/login`을 제외하지 않는다.
- 따라서 로그인 첫 요청은 `Authorization: Basic ...`, body `{}`이고, 401 후 재시도 요청은 `Authorization: Bearer ...`, body `{}`가 될 수 있다.
- 이 재시도는 같은 `/auth/login` endpoint로 가지만 인증 헤더 방식이 달라진다.

## Comparison with Register

| Aspect | Login | Register | Same? |
| --- | --- | --- | --- |
| 호출 위치 | `src/pages/Login/LoginPage.tsx`에서 `api.post` 직접 호출 | `src/pages/Login/SingupPage.tsx`가 `register(...)` 호출, `src/api/auth.ts`에서 `api.post` | No |
| Endpoint | `/auth/login` | `/auth/register` | No |
| Body payload | `{}` | `{ email, name, password }` | No |
| Body field names | 없음 | `email`, `name`, `password` | No |
| Credential 전달 | `Authorization: Basic ${btoa(email + ":" + password)}` | JSON body의 `email`, `name`, `password` | No |
| 값 타입 | input value string | input value string | Yes |
| 값 가공 | `trim` 없음, Basic token 생성만 있음 | `trim` 없음, 타입 변환 없음 | Mostly |
| 전송 형식 | JSON Content-Type + 빈 JS 객체 body + Basic auth header | JSON Content-Type + JS 객체 body | Partially |
| 401 retry 영향 | 응답 인터셉터가 Bearer 헤더로 `/auth/login` 재시도 가능 | 401이면 동일 retry 로직 대상이지만 register 정상 201 관측 | Partially |

Register payload 생성/전송 근거:

```tsx
await register({
  email: values.email,
  name: values.name,
  password: values.password,
});
```

```ts
export const register = async (userData: {
  email: string;
  name: string;
  password: string;
}) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};
```

## Potential Empty-Value Paths

- 로그인 submit 버튼 자체에는 `disabled={!values.email || !values.password}` 같은 비활성 조건이 없다. `isLoading`일 때만 `Button` 내부에서 disabled 된다.
- 빈 email/password는 `handleLogin` 진입 후 `if (!values.email || !values.password)`에서 alert 후 return 되므로 실제 `/auth/login` 요청은 발생하지 않는다.
- 공백만 있는 값은 빈 문자열이 아니므로 이 검사에서 차단되지 않는다. `trim`이 없기 때문에 Basic credential에 공백이 그대로 포함될 수 있다.
- `Input type="email"`은 브라우저의 native email validation 영향을 받을 수 있으나 `required`는 없다. password input에는 형식 검증이 없다.
- `useForm`은 `name` 기반으로 값을 저장하므로 input의 `name="email"`/`name="password"`가 유지되는 현재 코드에서는 상태 누락 경로가 발견되지 않았다.

## Raw Issues

ISSUE: Login sends no JSON credential fields in the request body. The body is `{}`, and credentials are sent only through `Authorization: Basic ...`.

ISSUE: Login and register use different contracts. Register sends `{ email, name, password }` as JSON body, while login sends an empty JSON object plus Basic auth header.

ISSUE: The 401 response interceptor does not exclude `/auth/login`. If a stale refresh token exists, a failed login can be retried to the same `/auth/login` endpoint with `Authorization: Bearer ...` instead of the original `Authorization: Basic ...`.

ISSUE: Login values are not trimmed. Whitespace-only or padded email/password values can reach Basic credential construction if not blocked by browser-native validation.
