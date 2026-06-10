import { useEffect, useRef, useState } from "react";

import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { nanoid } from "nanoid";

// 🔑 클라이언트 상점의 진짜 테스트 클라이언트 키
const clientKey = "test_gck_6bJXmgo28e7L4YD7kxJwVLAnGKWx";
const customerKey = nanoid();

const PaymentPage = () => {
  const [email, setEmail] = useState("");
  // V2 전용 위젯 컨트롤러 ref
  const widgetsRef = useRef<any>(null);

  // 🛡️ React Strict Mode 중복 실행 방어벽
  const isInitialized = useRef(false);
  const price = 10000;

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    (async () => {
      // 1. 최신 V2 라이브러리 초기화
      const tossPayments = await loadTossPayments(clientKey);

      // 2. 위젯 컨트롤러 객체 생성
      const widgets = tossPayments.widgets({ customerKey });

      // 3. 결제 금액 및 통화 설정 (V2 필수 단계)
      await widgets.setAmount({
        value: price,
        currency: "KRW",
      });

      // 4. 결제 수단과 약관 UI를 각각의 구역에 동시 렌더링
      await Promise.all([
        widgets.renderPaymentMethods({ selector: "#payment-element" }),
        widgets.renderAgreement({ selector: "#agreement-element" }),
      ]);

      widgetsRef.current = widgets;
    })();
  }, []);

  const handlePaymentRequest = async () => {
    if (!email) {
      alert("모의고사를 받아보실 이메일 주소를 입력해 주세요!");
      return;
    }

    try {
      // 5. V2 스펙에 맞춘 결제창 호출
      await widgetsRef.current?.requestPayment({
        orderId: nanoid(),
        orderName: "논술핏 프리미엄 온라인 모의고사 (1회분)",
        customerEmail: email,
        successUrl: `${window.location.origin}/payment/success?email=${encodeURIComponent(email)}`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (error) {
      console.error("결제 창 활성화 실패:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="space-y-1.5 pb-2">
        <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">
          논술핏 모의 테스트 신청
        </h2>
        <p className="text-medium font-medium text-gray-500 mt-2">
          실력을 측정할수있는 모의 테스트를 이메일로 제공합니다.
        </p>
      </div>

      {/* 💡 핵심 수정 구역: 맥북에서 패딩을 더 늘리고 싶다면 뒤쪽의 md:px-12, md:pt-14 부분을 수정하셔야 반영됩니다! */}
      <div className="w-full border border-dashed border-gray-200 bg-white rounded-xl px-6 pt-10 pb-4 md:px-12 md:pt-14 md:pb-6 shadow-sm">
        {/* 1. 주문 상품 정보 영역 */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase">
            주문 상품 정보
          </h3>
          <div className="flex justify-between items-center bg-gray-50 px-6 py-4 rounded-lg border border-gray-100">
            <span className="text-base font-extrabold text-gray-800">
              논술핏 온라인 모의 테스트 (1회분)
            </span>
            <span className="text-lg font-black text-gray-900">
              {price.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 2. 이메일 입력 섹션 */}
        <div className="space-y-3 mt-6 md:mt-8">
          <label className="text-sm font-extrabold text-gray-800 block">
            📩 문제를 받아보실 이메일 주소{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-3.5 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all font-medium"
          />
          <p className="text-xs text-gray-400 font-medium">
            결제가 완료되면 위 입력하신 이메일 주소로 모의고사 PDF 파일이 즉시
            자동 발송됩니다.
          </p>
        </div>

        {/* 3. 토스 결제 수단 영역 */}
        <div id="payment-element" className="w-full mt-4" />

        {/* 4. 하단 결제 인터랙션 영역 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8 pt-4 border-t border-gray-100 mt-0">
          {/* 토스 약관 동의 영역 */}
          <div id="agreement-element" className="w-full md:flex-1" />

          <button
            onClick={handlePaymentRequest}
            className="px-6 py-3.5 bg-primary text-white font-extrabold text-medium rounded-lg hover:opacity-90 transition-all duration-200 w-full md:w-auto md:min-w-[240px] shrink-0"
          >
            {price.toLocaleString()}원 결제하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
