import { useEffect, useRef, useState } from "react";

import {
  loadTossPayments,
  type TossPaymentsWidgets,
} from "@tosspayments/tosspayments-sdk";
import { nanoid } from "nanoid";
import api from "../../api/axios";
import {
  PAYMENT_PRODUCT_CODE,
  type PaymentProductResponse,
} from "../../contracts/payment";

const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;
if (!clientKey) {
  throw new Error("VITE_TOSS_CLIENT_KEY is not configured");
}
const customerKey = nanoid();

const PaymentPage = () => {
  const [email, setEmail] = useState("");
  const [product, setProduct] = useState<PaymentProductResponse | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [productError, setProductError] = useState<string | null>(null);

  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);

  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    (async () => {
      try {
        const { data: fetchedProduct } =
          await api.get<PaymentProductResponse>(
            `/payment/products/${PAYMENT_PRODUCT_CODE}`,
          );
        const fetchedPrice = Number(fetchedProduct.price);

        if (!Number.isFinite(fetchedPrice) || fetchedPrice <= 0) {
          throw new Error("상품 가격이 올바르지 않습니다.");
        }

        const tossPayments = await loadTossPayments(clientKey);

        const widgets = tossPayments.widgets({ customerKey });

        await widgets.setAmount({
          value: fetchedPrice,
          currency: "KRW",
        });

        await Promise.all([
          widgets.renderPaymentMethods({ selector: "#payment-element" }),
          widgets.renderAgreement({ selector: "#agreement-element" }),
        ]);

        widgetsRef.current = widgets;
        setProduct(fetchedProduct);
        setPrice(fetchedPrice);
      } catch (error) {
        console.error("상품 정보 조회 또는 결제 위젯 초기화 실패:", error);
        setProductError(
          "상품 정보를 불러오지 못했습니다. 결제를 진행할 수 없습니다.",
        );
      }
    })();
  }, []);

  const handlePaymentRequest = async () => {
    if (!product || price === null || !widgetsRef.current) {
      alert("상품 정보를 불러온 후 결제를 진행해 주세요.");
      return;
    }

    if (!email) {
      alert("모의고사를 받아보실 이메일 주소를 입력해 주세요!");
      return;
    }

    try {
      await widgetsRef.current.requestPayment({
        orderId: nanoid(),
        orderName: product.name,
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

      <div className="w-full border border-dashed border-gray-200 bg-white rounded-xl px-6 pt-10 pb-4 md:px-12 md:pt-14 md:pb-6 shadow-sm">
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase">
            주문 상품 정보
          </h3>
          <div className="flex justify-between items-center bg-gray-50 px-6 py-4 rounded-lg border border-gray-100">
            <span className="text-base font-extrabold text-gray-800">
              {product?.name ?? "상품 정보를 불러오는 중입니다..."}
            </span>
            <span className="text-lg font-black text-gray-900">
              {price === null ? "-" : `${price.toLocaleString()}원`}
            </span>
          </div>
        </div>
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
        <div id="payment-element" className="w-full mt-4" />
        {productError && (
          <p className="mt-4 text-sm font-bold text-red-500" role="alert">
            {productError}
          </p>
        )}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8 pt-4 border-t border-gray-100 mt-0">
          <div id="agreement-element" className="w-full md:flex-1" />

          <button
            onClick={handlePaymentRequest}
            disabled={price === null || Boolean(productError)}
            className="px-6 py-3.5 bg-primary text-white font-extrabold text-medium rounded-lg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 w-full md:w-auto md:min-w-[240px] shrink-0"
          >
            {price === null ? "결제 준비 중" : `${price.toLocaleString()}원 결제하기`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
