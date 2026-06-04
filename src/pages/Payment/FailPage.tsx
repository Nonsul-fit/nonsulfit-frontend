import { useSearchParams, useNavigate } from "react-router-dom";

const FailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const errorMessage =
    searchParams.get("message") || "알 수 없는 에러가 발생했습니다.";

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="w-full border border-dashed border-gray-200 bg-white rounded-xl p-6 md:p-10 shadow-sm flex flex-col items-center justify-center text-center space-y-6 py-16">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-2xl font-black shadow-inner">
          ✕
        </div>

        <div className="space-y-2">
          <p className="text-lg font-extrabold text-gray-800">
            결제에 실패했습니다
          </p>
          <p className="text-sm font-medium text-red-500 bg-red-50/50 px-4 py-2 rounded-lg border border-red-100">
            {errorMessage}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/payment")}
            className="px-6 py-3.5 bg-gray-100 text-gray-700 font-extrabold text-medium rounded-xl hover:bg-gray-200 transition-all duration-200"
          >
            다시 시도하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default FailPage;
