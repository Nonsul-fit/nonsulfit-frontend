export interface BackendChatMessageDto {
  id: string | number;
  type: "USER" | "ASSISTANT";
  message: string;
  createdAt?: string;
  status?: string | null;
  warnings?: string[];
}

export interface ChatHistoryResponseDto {
  chat: BackendChatMessageDto[];
}

export interface SendChatMessageRequestDto {
  message: string;
}

export interface ChatMessageViewModel {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date | null;
  status?: string | null;
  warnings: string[];
}
