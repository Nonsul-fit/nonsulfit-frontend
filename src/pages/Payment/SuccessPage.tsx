import { useEffect, useState, useRef } from "react"; // 💡 중복 호출 방지를 위해 useRef 추가
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const SuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isProcessing, setIsProcessing] = useState(true);

  const hasRequested = useRef(false);

  const email = searchParams.get("email");
  const amount = searchParams.get("amount");
  const orderId = searchParams.get("orderId");
  const paymentKey = searchParams.get("paymentKey");

  useEffect(() => {
    if (hasRequested.current || !paymentKey || !orderId || !amount) return;

    hasRequested.current = true;
    setIsProcessing(true);

    api
      .post("/payment/confirm", {
        paymentKey,
        orderId,
        amount: Number(amount),
        email,
      })
      .then((res) => {
        if (
          res.status === 200 ||
          res.status === 201 ||
          res.data?.isSuccess === true
        ) {
          console.log("토스 승인 및 DB 저장, 메일 발송 트리거 완료!");
          setIsProcessing(false);
        } else {
          alert("결제 승인에 실패했습니다. 다시 시도해 주세요.");
          navigate("/payment");
        }
      })
      .catch((err) => {
        console.error("서버 통신 오류:", err);
        alert("결제 처리 중 에러가 발생했습니다. 고객센터로 문의해 주세요.");
        navigate("/payment");
      });
  }, [paymentKey, orderId, amount, email, navigate]);

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center">
        <div className="w-12 h-12 border-4 border-[#1d3573] border-t-transparent rounded-full animate-spin"></div>
        <div className="space-y-1">
          <p className="text-lg font-bold text-gray-800">
            결제 승인 완료 처리 중...
          </p>
          <p className="text-sm text-gray-400">
            잠시만 기다려주시면 메일로 PDF가 즉시 발송됩니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="space-y-1.5 pb-2">
        <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">
          🎉 결제가 완료되었습니다!
        </h2>
        <p className="text-medium font-medium text-gray-500 mt-2">
          모의테스트 결제가 잘 접수되었습니다
        </p>
      </div>

      <div className="w-full border border-dashed border-gray-200 bg-white rounded-xl p-6 md:p-10 shadow-sm flex flex-col items-center justify-center text-center space-y-6 py-16">
        <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center text-2xl font-black shadow-inner">
          ✓
        </div>

        <div className="space-y-2">
          <p className="text-lg font-extrabold text-gray-800">
            {Number(amount).toLocaleString()}원 결제 완료
          </p>
          <p className="text-sm font-medium text-gray-500 max-w-sm leading-relaxed">
            <span className="font-bold text-primary">{email}</span> 주소로
            모의고사 PDF 파일과 답안지가 즉시 자동 발송되었습니다. 메일함을
            확인해 주세요!
          </p>
        </div>

        <button
          onClick={() => navigate("/result")}
          className="px-6 py-3.5 bg-[#1d3573] text-white font-extrabold text-medium rounded-xl shadow-md hover:opacity-90 transition-all duration-200 min-w-[200px]"
        >
          내 분석 이력 보러가기
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
