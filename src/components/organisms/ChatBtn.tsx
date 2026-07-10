import { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import type { ReportPayloadV2, ReportWarning } from "../../types/reportPayloadV2";

interface ChatMessage {
  id: number | string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
}

interface ChatBtnProps {
  reportId: string | number | undefined;
  reportSnapshot?: ReportPayloadV2 | null;
}

const toRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

const normalizeRole = (value: unknown): ChatMessage["role"] => {
  if (value === "USER" || value === "ASSISTANT" || value === "SYSTEM") {
    return value;
  }

  if (value === "user") return "USER";
  if (value === "assistant") return "ASSISTANT";
  if (value === "system") return "SYSTEM";

  return "ASSISTANT";
};

const normalizeMessage = (
  message: unknown,
  fallbackId: string | number,
): ChatMessage | null => {
  const record = toRecord(message);

  if (!record) {
    return null;
  }

  const content = record.content ?? record.message;

  if (typeof content !== "string") {
    return null;
  }

  return {
    id:
      typeof record.id === "string" || typeof record.id === "number"
        ? record.id
        : fallbackId,
    role: normalizeRole(record.role ?? record.type),
    content,
  };
};

const normalizeMessages = (payload: unknown): ChatMessage[] => {
  const record = toRecord(payload);
  const rawMessages = Array.isArray(payload)
    ? payload
    : Array.isArray(record?.messages)
      ? record.messages
      : Array.isArray(record?.chat)
        ? record.chat
        : [];

  return rawMessages
    .map((message, index) => normalizeMessage(message, `message-${index}`))
    .filter((message): message is ChatMessage => message !== null);
};

const normalizeWarnings = (payload: unknown): ReportWarning[] => {
  const record = toRecord(payload);
  return Array.isArray(record?.warnings)
    ? (record.warnings as ReportWarning[])
    : [];
};

const ChatBtn = ({ reportId, reportSnapshot }: ChatBtnProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [warnings, setWarnings] = useState<ReportWarning[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBotResponding, setIsBotResponding] = useState(false);

  const messageEndRef = useRef<HTMLDivElement>(null);

  const fetchChatHistory = async () => {
    if (!reportId) return;

    setIsLoading(true);
    try {
      const response = await api.get(
        `/reports/${encodeURIComponent(String(reportId))}/chat/messages`,
      );
      setMessages(normalizeMessages(response.data));
      setWarnings(normalizeWarnings(response.data));
    } catch (error) {
      console.error("채팅 내역 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (!reportId) {
      alert("리포트 정보(ID)를 찾을 수 없어 채팅을 보낼 수 없습니다.");
      return;
    }

    const userMessage = inputValue;
    setInputValue("");

    const tempUserChat: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "USER",
      content: userMessage,
    };
    setMessages((prev) => [...prev, tempUserChat]);
    setIsBotResponding(true);

    try {
      const response = await api.post(
        `/reports/${encodeURIComponent(String(reportId))}/chat/messages`,
        {
          role: "USER",
          content: userMessage,
          reportSnapshot,
        },
      );

      const normalizedWarnings = normalizeWarnings(response.data);
      const responseMessages = normalizeMessages(response.data);
      const singleMessage = normalizeMessage(response.data, `bot-${Date.now()}`);

      if (normalizedWarnings.length > 0) {
        setWarnings(normalizedWarnings);
      }

      setMessages((prev) => [
        ...prev,
        ...(responseMessages.length > 0
          ? responseMessages
          : singleMessage
            ? [singleMessage]
            : []),
      ]);
    } catch (error: any) {
      console.error("❌ [ChatBtn 에러 발생] 백엔드가 반환한 진짜 에러:");
      if (error.response) {
        console.error("➡️ 에러 상태 코드 (Status):", error.response.status);
        console.error("➡️ 에러 내용 (Data):", error.response.data);
      } else {
        console.error("➡️ 에러 메시지:", error.message);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "ASSISTANT",
          content:
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
  }, [isOpen, reportId]);

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
              messages.map((msg, index) => (
                <div
                  key={msg.id || `${msg.role}-${index}`}
                  className={`flex ${
                    msg.role === "USER"
                      ? "justify-end"
                      : msg.role === "SYSTEM"
                        ? "justify-center"
                        : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${
                      msg.role === "USER"
                        ? "bg-[#1d3573] text-white rounded-tr-none"
                        : msg.role === "SYSTEM"
                          ? "bg-amber-50 text-amber-800 border border-amber-100 rounded-xl text-xs"
                          : "bg-gray-100 text-gray-800 rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}

            {warnings.length > 0 && (
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800">
                <p className="font-black mb-1">채팅 참고 사항</p>
                <ul className="space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={`${warning.code}-${index}`}>
                      {warning.warningTitle || warning.code}
                      {warning.warningDetail ? ` · ${warning.warningDetail}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
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
