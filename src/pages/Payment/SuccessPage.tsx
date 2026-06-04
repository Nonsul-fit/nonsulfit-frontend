import { useSearchParams, useNavigate } from "react-router-dom";

const SuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email");
  const amount = searchParams.get("amount");
  const orderId = searchParams.get("orderId");

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="space-y-1.5 pb-2">
        <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">
          🎉 결제가 완료되었습니다!
        </h2>
        <p className="text-medium font-medium text-gray-500 mt-2">
          모의 테스트 신청이 정상적으로 접수되었습니다.
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

        {/* 디버깅용 정보 박스 (나중에 승효님이랑 맞추기 편하게 눈으로 확인용) */}
        <div className="bg-gray-50 p-4 rounded-lg text-left text-xs font-mono text-gray-400 space-y-1 w-full max-w-md border border-gray-100">
          <p>• 주문번호(orderId): {orderId}</p>
          <p>
            • 결제키(paymentKey): {searchParams.get("paymentKey")?.slice(0, 15)}
            ...
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
