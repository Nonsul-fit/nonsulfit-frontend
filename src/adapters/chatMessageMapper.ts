import type {
  BackendChatMessageDto,
  ChatHistoryResponseDto,
  ChatMessageViewModel,
  SendChatMessageRequestDto,
} from "../contracts/chat";

export function chatMessageMapper(
  dto: BackendChatMessageDto,
): ChatMessageViewModel {
  return {
    id: String(dto.id),
    role: dto.type === "USER" ? "user" : "assistant",
    content: dto.message,
    createdAt: toNullableDate(dto.createdAt),
    status: dto.status,
    warnings: Array.isArray(dto.warnings) ? [...dto.warnings] : [],
  };
}

export function chatHistoryMapper(
  res: ChatHistoryResponseDto,
): ChatMessageViewModel[] {
  return res.chat.map(chatMessageMapper);
}

export function createSendChatMessageRequest(
  content: string,
): SendChatMessageRequestDto {
  return { message: content };
}

const toNullableDate = (value: unknown): Date | null => {
  if (typeof value !== "string" || value.trim() === "") return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
