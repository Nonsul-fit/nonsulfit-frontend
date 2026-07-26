# Favicon Root Cause Audit

## 가설별 판정

- **H1 — 기각.** `index.html:5-6`은 `/favicon.svg`를 canonical icon으로, `/favicon.ico`를 fallback으로 선언한다. Helmet/head 컴포넌트, framework metadata, 정적 설정의 추가 favicon 선언은 없다. 수정 전에도 `/favicon.svg` 단일 선언이었으며 `/vite.svg`·`/react.svg` 참조는 없었다.
- **H2 — 기각(현재 파일), 번개 원본은 확인.** 현재 `public/favicon.ico`는 256×256 논술핏 로고이며 SHA-256은 `f8437bd...bb48`; 현재 `public/favicon.svg`는 논술핏 로고이며 SHA-256은 수정 전 `8ecca922...16c8`이었다. 보라색 번개 원본은 Git commit `537b876`의 과거 `public/favicon.svg`(48×46, SHA-256 `61bc9a16...3a66`)로 확인됐다. 같은 커밋의 `src/assets/vite.svg`도 보라색 Vite 번개 자산이지만 favicon 선언 경로는 아니었다.
- **H3 — 기각.** 저장소와 빌드 결과에 `manifest.json`, `manifest.webmanifest`, `site.webmanifest`, vite-plugin-pwa 설정이 없다.
- **H4 — 기각.** 수정 전 빌드의 `dist/index.html:5`는 `/favicon.svg`를 선언했고, `dist/favicon.svg`와 `dist/favicon.ico`는 `public` 원본과 byte-identical했다. `dist`에 `vite.svg`, `react.svg`, manifest는 없었다.
- **H5 — 기각.** `https://nonsulfit.com/*`는 HTTP 308로 동일 경로의 `https://www.nonsulfit.com/*`에 canonical redirect된다. 최종 HTML SHA-256은 두 요청 모두 `52495b68...bb3`, SVG는 `8ecca922...16c8`, ICO는 `f8437bd...bb48`로 동일했다.
- **H6 — 기각.** 일반 UA와 Googlebot 모두 SVG/ICO에서 HTTP 200, 동일 Content-Type·ETag·본문 SHA-256을 받았다. 응답은 `Cache-Control: public, max-age=0, must-revalidate`이며 UA별 변형 증거가 없다.
- **H7 — 확정(수정 전).** 수정 전 `public/favicon.svg:2`의 `viewBox="0 0 760 658"`은 정사각형이 아니었다. 외부 URL·폰트·JavaScript 의존은 없지만 내부 필터가 많고 16/32/48px 렌더에서 로고가 작게 축소됐다. SVG 자체는 보라색 번개가 아니었다. `viewBox`를 정사각형 `760×760`으로 보정하고 기존 256×256 ICO를 fallback으로 선언했다.
- **H8 — 유력하나 단독 원인은 아님.** 현재 배포가 제공하는 논술핏 파일과 검색 결과의 보라색 번개가 다르고, Git 이력의 과거 `public/favicon.svg`가 검색 결과 모양과 일치한다. 따라서 Google의 과거 favicon 캐시/재크롤링 지연이 유력하다. 다만 H7의 Google 호환성 결함이 있었으므로 캐시만을 단독 원인으로 판정하지 않는다.

## 번개 아이콘의 원본

Git commit `537b876`의 `public/favicon.svg`가 실제 보라색 번개 favicon이다. 파일은 48×46, 9,522 bytes, SHA-256 `61bc9a161de58248288e6905425d7180f0624c2865007b97d763fdac12043a66`이다. 이후 commit `dca8973`에서 현재 논술핏 SVG로 교체됐다.

## 최종 Root Cause

Google 검색 결과는 과거 배포의 보라색 번개 `public/favicon.svg`를 보존하고 있다. 현재 저장소·빌드·배포·Googlebot 응답에는 그 파일이나 참조가 없지만, 교체된 SVG가 정사각형이 아니고 현재 HTML에서 정사각형 ICO fallback 선언도 제거된 상태여서 Google favicon 요구사항 충족과 재선택이 보장되지 않았다. 원인은 **Google의 과거 favicon 캐시 + 현재 SVG의 비정사각형 코드 결함**의 조합이다.

## 코드 수정 여부

수정함. `public/favicon.svg`의 viewBox를 정사각형으로 보정했으며, `index.html`에서 `/favicon.svg`를 canonical source로 유지하고 기존 256×256 `/favicon.ico`를 fallback으로 추가했다. UI·OG 이미지·기타 SEO metadata는 변경하지 않았다.

## 재검증 방법

1. `npm run build` 후 `dist/index.html`의 두 favicon 선언과 `dist/favicon.svg`, `dist/favicon.ico` 존재를 확인한다.
2. `dist`에서 `vite.svg`, `react.svg`, manifest 잔존 여부가 0건인지 확인한다.
3. 배포 후 apex와 www의 HTML·SVG·ICO 상태, Content-Type, ETag, 본문 SHA-256을 일반 UA와 Googlebot으로 비교한다.
4. Google Search Console에서 홈 URL 색인 재요청 후 검색 favicon 재크롤링을 확인한다.
