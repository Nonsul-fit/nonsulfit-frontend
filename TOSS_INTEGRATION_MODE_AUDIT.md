# TossPayments 연동 방식 감사

감사일: 2026-07-16  
대상: 현재 작업 트리의 `src/` 및 접근 가능한 Git 이력  
수정 범위: 조사 문서만 작성했으며 애플리케이션 코드는 수정하지 않음

## 1. 가설과 예측

| 가설 | 예측 | 판정 |
|---|---|---|
| H1 | 프로덕션 라우트는 개별연동만 사용하고 위젯 코드는 죽은 코드다. | 기각 |
| H2 | 프로덕션 라우트는 결제위젯만 사용하고 개별연동 코드는 실행되지 않는다. | 지지. 단, 현재 저장소에는 개별연동 코드 자체가 없어 이를 “남아 있는 죽은 코드”라고 부를 수는 없다. |
| H3 | 서로 다른 실제 라우트에서 두 방식을 의도적으로 사용한다. | 기각 |
| H4 | 같은 컴포넌트에 두 방식이 섞여 실행 경로가 불명확하다. | 기각 |
| H5 | 키 접두사와 호출 방식이 불일치하여 `NOT_AVAILABLE_PAYMENT_BY_MERCHANT`가 발생한다. | 현재 확인 가능한 설정에서는 기각. 배포 환경 변수는 저장소만으로 확정할 수 없다. |

조사 전 가장 가능성이 높은 가설은 H2였다. 현재 라우트의 결제 UI가 `renderPaymentMethods()`를 렌더링한다면 위젯 방식이 실제 실행 경로이고, `gck_` 키와도 일치할 것으로 예상했다.

## 2. 단계별 조사 결과

### 2.1 두 패턴 전수 확인

현재 `src/**/*.{ts,tsx}`를 검색한 결과는 다음과 같다.

- `tossPayments.payment(...)`, `.payment({ customerKey })`: **0개 파일, 0개 컴포넌트**
- `tossPayments.widgets(...)`: **1개 파일, 1개 컴포넌트**
  - `src/pages/Payment/PaymentPage.tsx:48`
- `renderPaymentMethods(...)`: **1건**
  - `src/pages/Payment/PaymentPage.tsx:56`
- Toss 위젯의 `requestPayment(...)`: **1건**
  - `src/pages/Payment/PaymentPage.tsx:84`
- SDK 로딩: `loadTossPayments(clientKey)`
  - `src/pages/Payment/PaymentPage.tsx:46`

`src/`뿐 아니라 `node_modules`와 빌드 산출물을 제외한 저장소 전체 검색에서도 개별연동 스니펫 A는 발견되지 않았다. 접근 가능한 전체 Git 이력에 대해 `tossPayments.payment`, `const payment = tossPayments.payment`, `method: "CARD"` 문자열 이력도 검색했지만 해당 구현을 찾지 못했다.

따라서 배경에 제시된 “두 스니펫이 모두 코드베이스에서 발견되었다”는 사실은 **현재 체크아웃 및 접근 가능한 이력에서는 재현되지 않는다**. 스니펫 A가 과거 미커밋 작업, 삭제된 별도 브랜치, 다른 저장소 또는 로컬 실험 코드에서 나온 것인지는 현 자료로 판정할 수 없다. 현재 저장소 관점에서는 개별연동 코드가 죽은 코드로 남아 있는 것이 아니라 아예 존재하지 않는다.

### 2.2 실제 라우트 연결

라우트 import 및 연결은 명확하다.

- `src/App.tsx:14`: `PaymentPage`를 `./pages/Payment/PaymentPage`에서 import
- `src/App.tsx:41`: `/payment`가 `<PaymentPage />`를 렌더링
- `src/App.tsx:42`: `/payment/success`가 `<SuccessPage />`를 렌더링
- `src/App.tsx:44`: `/payment/fail`이 `<FailPage />`를 렌더링

따라서 실제 `/payment` 라우트는 2.1에서 확인한 유일한 위젯 구현 파일을 직접 렌더링한다. 별도의 payment router나 대체 Payment 컴포넌트는 발견되지 않았다.

### 2.3 동일 파일 내 실행 순서와 조건

`PaymentPage`에는 개별연동 분기가 없다. 실제 순서는 다음과 같다.

1. 상품 조회: `PaymentPage.tsx:36-39`
2. 문자열 가격을 숫자로 변환 및 검증: `PaymentPage.tsx:40-44`
3. SDK 로딩: `PaymentPage.tsx:46`
4. 위젯 생성: `PaymentPage.tsx:48`
5. 위젯 금액 설정: `PaymentPage.tsx:50-53`
6. 결제수단/약관 UI 렌더링: `PaymentPage.tsx:55-58`
7. 위젯 ref 저장: `PaymentPage.tsx:60`
8. 사용자가 결제 버튼을 누르면 같은 위젯 ref의 `requestPayment`: `PaymentPage.tsx:72-90`

상품 조회 또는 위젯 초기화가 실패하면 ref와 가격이 준비되지 않으며 결제 요청은 `PaymentPage.tsx:73-76`에서 차단된다. feature flag, props, 상태값으로 `payment()`와 `widgets()` 중 하나를 고르는 분기는 없다. 두 방식을 동시에 실행할 가능성도 없다.

### 2.4 클라이언트 키 접두사 대조

- 키 입력 위치: `PaymentPage.tsx:14`의 `import.meta.env.VITE_TOSS_CLIENT_KEY`
- 키 미설정 방어: `PaymentPage.tsx:15-17`
- `.env.example:2`: 변수 이름만 제공하며 실제 접두사는 비어 있음
- 현재 로컬 `.env`의 값: 보안을 위해 전체 값을 기록하지 않으며, 접두사는 **`live_gck_`**
- 실제 호출 방식: `widgets({ customerKey })`

즉 현재 로컬 설정은 **결제위젯 + `gck_` 계열 키**로 서로 일치한다. Git 이력에서도 초기 구현은 `test_gck_docs_...`, 이후 `test_gck_...`를 사용했고, 커밋 `08d0d50`에서 하드코딩 키를 `VITE_TOSS_CLIENT_KEY`로 옮겼다. 위젯 호출 자체는 유지됐다.

다만 `.env`는 Git 추적 파일이 아니고 `.env.example`에는 접두사 예시가 없으므로, 실제 배포 플랫폼에 설정된 `VITE_TOSS_CLIENT_KEY`가 `live_gck_`/`test_gck_`인지 저장소만으로는 보장할 수 없다. 배포 환경에 `ck_` 계열이 들어 있다면 위젯 호출과 불일치한다.

### 2.5 승인(confirm) 흐름 정합성

위젯 요청은 다음 콜백 URL을 전달한다.

- 성공 URL: `PaymentPage.tsx:88`의 `/payment/success?email=...`
- 실패 URL: `PaymentPage.tsx:89`의 `/payment/fail`

성공 페이지는 Toss가 성공 URL에 추가하는 다음 값을 읽는다.

- `amount`: `SuccessPage.tsx:29`
- `orderId`: `SuccessPage.tsx:30`
- `paymentKey`: `SuccessPage.tsx:31`

세 값이 모두 있을 때 `SuccessPage.tsx:39-46`에서 Backend `/payment/confirm`으로 `paymentKey`, `orderId`, 숫자로 변환한 `amount`, `email`, `productCode`를 보낸다. Axios interceptor는 토큰이 있으면 Authorization 헤더도 추가한다(`src/api/axios.ts:19-25`).

현재 프런트엔드에는 개별연동 콜백을 별도로 처리하는 코드가 없다. 제시된 두 방식은 성공 콜백에서 동일한 핵심 파라미터 이름(`paymentKey`, `orderId`, `amount`)을 사용하는 흐름이므로, 현재 confirm 코드는 위젯 경로와 정합적이다. 두 방식 사이의 파라미터 이름을 혼용한 흔적도 발견되지 않았다.

### 2.6 Git 이력과 최신 의도

주요 이력은 다음과 같다.

- `73abc96` (2026-06-04), `feat: 결제 위젯 및 성공 페이지 구현)`: PaymentPage 최초 도입. 커밋 메시지와 코드 모두 위젯 방식이며 `test_gck_docs_...` 사용
- 후속 이력: 문서용 `test_gck_docs_...`에서 상점의 `test_gck_...`로 변경. 위젯 방식 유지
- `08d0d50` (2026-07-16), `fix(payment): load Toss client key from environment`: 하드코딩 `test_gck_...`를 환경 변수로 이동. 위젯 방식 유지
- `dd8b4ed` (2026-07-16), `fix: load payment product price from API`: API 가격을 위젯 `setAmount()`에 연결. 위젯 방식 유지

접근 가능한 이력에는 “위젯에서 개별연동으로 전환” 또는 그 반대의 커밋이 없다. 최초 구현부터 최신 구현까지 일관되게 결제위젯이 의도된 방식이다.

## 3. 가설 검증표

| 가설 | 관찰 근거 | 결과 |
|---|---|---|
| H1 | 실제 `/payment`가 `widgets()`와 `renderPaymentMethods()`를 직접 실행 | 기각 |
| H2 | 현재/이력 모두 위젯 경로만 확인; `/payment`가 해당 파일에 직접 연결 | 지지 |
| H3 | 결제 라우트는 하나의 PaymentPage만 사용하고 다른 결제 시작 컴포넌트가 없음 | 기각 |
| H4 | PaymentPage에 `payment()` 호출이나 방식 선택 분기가 없음 | 기각 |
| H5 | 현재 로컬 키는 `live_gck_`, 실행 코드는 `widgets()` | 로컬 기준 기각; 배포 환경은 별도 확인 필요 |

## 4. 최종 결론

**현재 실제 프로덕션 라우트가 의도하고 실행하는 연동 방식은 결제위젯 방식이다.**

실행 경로는 `App.tsx`의 `/payment` → `PaymentPage` → `loadTossPayments()` → `widgets()` → `setAmount()` → `renderPaymentMethods()`/`renderAgreement()` → `widgets.requestPayment()`로 단일하고 명확하다.

개별연동 `payment({ customerKey })` 패턴은 현재 코드, 다른 라우트, 미사용 컴포넌트 또는 접근 가능한 Git 이력 어디에도 없다. 따라서 반대 패턴을 제거할 “죽은 파일”도 현재 저장소에는 특정할 수 없다. 제공된 스니펫 A의 출처를 별도로 확보할 경우에만 그 파일/브랜치가 실제 배포 대상인지 추가 감사할 수 있다.

## 5. 키 정합성과 `NOT_AVAILABLE_PAYMENT_BY_MERCHANT` 소견

현재 확인 가능한 조합은 `widgets()` + `live_gck_`로 올바른 종류다. 과거 하드코딩 테스트 키도 `test_gck_` 계열이었으므로, 과거와 현재 모두 호출 방식과 키 종류 사이의 `ck_`/`gck_` 불일치 증거는 없다.

따라서 **현재 로컬 설정만 놓고 보면 키 종류 불일치를 `NOT_AVAILABLE_PAYMENT_BY_MERCHANT`의 원인으로 지목할 수 없다.** 이 오류가 계속된다면 우선 실제 배포 빌드에 주입된 키의 접두사와 해당 키가 속한 상점/계약의 결제위젯 사용 가능 상태, 활성 결제수단 및 라이브 계약 상태를 확인해야 한다. 저장소의 `.env` 값과 배포 환경 값이 같다고 가정해서는 안 된다.

단, 배포 환경 변수에 `live_ck_` 또는 `test_ck_`가 설정돼 있다면 현재 `widgets()` 코드와 종류가 불일치하므로 `live_gck_` 또는 `test_gck_` 계열의 결제위젯 클라이언트 키로 교체해야 한다.

## 6. 다음 조치 제안

1. 배포 플랫폼의 `VITE_TOSS_CLIENT_KEY`를 실제로 확인하되 키 전체를 로그나 문서에 노출하지 말고 접두사만 확인한다.
2. 현재 위젯 구현을 유지한다면 토스페이먼츠 콘솔에서 해당 상점의 **결제위젯용 `gck_` 계열 키**를 사용한다.
3. 의도적으로 개별연동으로 전환할 계획이라면 코드도 `payment({ customerKey })` 방식으로 명시적으로 변경하고 **개별연동용 `ck_` 계열 키**를 발급/설정해야 한다. 키만 `ck_`로 바꾸면 안 된다.
4. 스니펫 A가 발견됐던 파일명, 브랜치 또는 커밋을 확보해 현재 배포 브랜치와 대조한다. 현 저장소에서는 제거 대상을 특정할 수 없다.
5. `.env.example`에 비밀값 없이 기대 접두사 설명(예: 결제위젯용 `test_gck_...`/`live_gck_...`)을 문서화하는 방안을 검토한다. 이번 감사에서는 코드와 설정을 수정하지 않았다.

## 감사 한계

- 본 결론은 현재 작업 트리와 로컬에서 접근 가능한 Git refs/이력을 기준으로 한다.
- 실제 배포 번들, 배포 플랫폼 환경 변수, 토스페이먼츠 콘솔의 상점 계약 상태는 직접 조회하지 않았다.
- 감사 시작 전부터 존재한 미커밋 인증 라우트 변경은 보존했으며, 이는 Toss SDK의 연동 방식 판정에는 영향을 주지 않는다.
