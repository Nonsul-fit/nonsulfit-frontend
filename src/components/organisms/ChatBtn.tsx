import { useState } from "react";

// 💡 컴포넌트 이름을 수민님이 정하신 Chatbtn으로 변경했습니다!
const Chatbtn = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4">
      {isOpen && (
        <div className="w-80 h-[450px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="pb-3 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-black text-gray-900 text-lg">
              논술핏 실시간 문의
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-sm font-bold"
            >
              닫기
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center text-center p-4">
            <p className="text-sm font-medium text-gray-400 leading-relaxed">
              안녕하세요! 논술핏 서비스에 대해
              <br />
              궁금한 점이 있으시면 언제든 말씀해 주세요.
            </p>
          </div>

          <div className="pt-2">
            <input
              type="text"
              placeholder="메시지를 입력하세요..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1d3573]"
              disabled
            />
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#1d3573] text-white rounded-full shadow-xl flex items-center justify-center text-2xl font-bold hover:scale-110 active:scale-95 transition-all duration-200 group relative"
        aria-label="채팅 문의하기"
      >
        {isOpen ? (
          <span className="animate-transform duration-200">✕</span>
        ) : (
          <span className="group-hover:animate-bounce">💬</span>
        )}
      </button>
    </div>
  );
};

export default Chatbtn; // 💡 내보내기 이름도 Chatbtn으로 매칭!
