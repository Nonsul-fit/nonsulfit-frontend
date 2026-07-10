import {
  chatHistoryMapper,
  chatMessageMapper,
  createSendChatMessageRequest,
} from "../adapters/chatMessageMapper";
import type {
  BackendChatMessageDto,
  ChatHistoryResponseDto,
  ChatMessageViewModel,
} from "../contracts/chat";
import type { ReportId } from "../types/identifiers";
import api from "./axios";

export async function fetchChatHistory(
  reportId: ReportId,
): Promise<ChatMessageViewModel[]> {
  const response = await api.get<ChatHistoryResponseDto>(
    `/reports/${encodeURIComponent(reportId)}/chat/messages`,
  );

  return chatHistoryMapper(response.data);
}

export async function sendChatMessage(
  reportId: ReportId,
  content: string,
): Promise<ChatMessageViewModel> {
  const response = await api.post<BackendChatMessageDto>(
    `/reports/${encodeURIComponent(reportId)}/chat/messages`,
    createSendChatMessageRequest(content),
  );

  return chatMessageMapper(response.data);
}
