import { useEffect, useRef, useState } from "react";
import axios from "axios";

interface ChatMessage {
  id: number | string;
  type: "USER" | "ASSISTANT";
  message: string;
}

interface ChatBtnProps {
  savedAnalysisReportId: string | number | undefined;
}

const ChatBtn = ({ savedAnalysisReportId }: ChatBtnProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBotResponding, setIsBotResponding] = useState(false);

  const messageEndRef = useRef<HTMLDivElement>(null);

  const getAccessToken = () => localStorage.getItem("accessToken");

  // [GET] 과거 채팅 내역 불러오기
  const fetchChatHistory = async () => {
    if (!savedAnalysisReportId) return;

    setIsLoading(true);
    try {
      const token = getAccessToken();
      const response = await axios.get(
        `https://nonsulfit-backend-production.up.railway.app/nonsulfit/chat/${savedAnalysisReportId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessages(response.data.chat || []);
    } catch (error) {
      console.error("채팅 내역 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // [POST] 메시지 전송
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (!savedAnalysisReportId) {
      alert("리포트 정보(ID)를 찾을 수 없어 채팅을 보낼 수 없습니다.");
      return;
    }

    const userMessage = inputValue;
    setInputValue("");

    // 1. 내 말풍선 즉시 띄우기
    const tempUserChat: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "USER",
      message: userMessage,
    };
    setMessages((prev) => [...prev, tempUserChat]);
    setIsBotResponding(true);

    try {
      const token = getAccessToken();

      console.log("🧐 [ChatBtn 디버깅] 현재 백엔드로 보내는 정보:");
      console.log("➡️ 전송할 토큰(Token):", token);
      console.log(
        "➡️ 리포트 ID(savedAnalysisReportId):",
        savedAnalysisReportId,
      );

      const response = await axios.post(
        `https://nonsulfit-backend-production.up.railway.app/nonsulfit/chat/${savedAnalysisReportId}`,
        { message: userMessage },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // 2. 백엔드 응답 매칭
      const botMessage: ChatMessage = {
        id: response.data.id,
        type: response.data.type,
        message: response.data.message,
      };

      if (response.data.status || response.data.warnings) {
        console.log("ℹ️ [백엔드 추가 시스템 정보]:", {
          status: response.data.status,
          warnings: response.data.warnings,
        });
      }

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      // 🚨 [핵심 변경 포인트] 백엔드가 뱉은 진짜 에러 원인을 콘솔에 상세히 해부해서 찍어줍니다.
      console.error("❌ [ChatBtn 에러 발생] 백엔드가 반환한 진짜 에러:");
      if (error.response) {
        console.error("➡️ 에러 상태 코드 (Status):", error.response.status); // 예: 500, 422, 400
        console.error("➡️ 에러 내용 (Data):", error.response.data); // 백엔드가 보낸 에러 상세 메시지
      } else {
        console.error("➡️ 에러 메시지:", error.message);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          type: "ASSISTANT",
          message:
            "죄송합니다. 메시지 전송 중 오류가 발생했습니다. 다시 시도해 주세요.",
        },
      ]);
    } finally {
      setIsBotResponding(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchChatHistory();
    }
  }, [isOpen, savedAnalysisReportId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotResponding]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4 text-left">
      {isOpen && (
        <div className="w-85 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="pb-3 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-black text-gray-900 text-lg">
              논술핏 AI 피드백 상담
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-sm font-bold"
            >
              닫기
            </button>
          </div>

          <div className="flex-1 overflow-y-auto my-3 pr-1 space-y-3 scrollbar-thin">
            {messages.length === 0 && !isLoading ? (
              <div className="h-full flex items-center justify-center text-center p-4">
                <p className="text-sm font-medium text-gray-400 leading-relaxed">
                  안녕하세요! 해당 대학 리포트에 대해
                  <br />
                  궁금한 점이 있으시면 언제든 말씀해 주세요.
                </p>
              </div>
            ) : (
              // ✨ 고유 Key 경고 문제를 완전히 방어하도록 index 조합 코드를 적용했습니다.
              messages.map((msg, index) => (
                <div
                  key={msg.id || `${msg.type}-${index}`}
                  className={`flex ${msg.type === "USER" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${
                      msg.type === "USER"
                        ? "bg-[#1d3573] text-white rounded-tr-none"
                        : "bg-gray-100 text-gray-800 rounded-tl-none"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))
            )}

            {isBotResponding && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-500 max-w-[75%] px-4 py-2.5 rounded-2xl rounded-tl-none text-sm font-bold animate-pulse">
                  🤖 논술핏 봇이 답변을 작성 중입니다...
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="pt-2 border-t border-gray-50 flex gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="리포트에 대해 질문해 보세요..."
              className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1d3573] font-medium"
              disabled={isBotResponding}
            />
            <button
              type="submit"
              disabled={isBotResponding}
              className="px-4 bg-[#1d3573] text-white rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              전송
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#1d3573] text-white rounded-full shadow-xl flex items-center justify-center text-2xl font-bold hover:scale-110 active:scale-95 transition-all duration-200 group relative"
      >
        {isOpen ? (
          <span>✕</span>
        ) : (
          <span className="group-hover:animate-bounce">💬</span>
        )}
      </button>
    </div>
  );
};

export default ChatBtn;
