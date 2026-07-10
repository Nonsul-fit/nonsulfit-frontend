import api from "../api/axios";
import type { PublicReportId } from "../types/identifiers";

export const legacyApi = {
  getStatus: async (): Promise<unknown> => {
    const response = await api.get<unknown>("/nonsulfit/status");
    return response.data;
  },

  getResultList: async (): Promise<unknown> => {
    const response = await api.get<unknown>("/nonsulfit/result");
    return response.data;
  },

  getResultDetail: async (publicId: PublicReportId): Promise<unknown> => {
    const response = await api.get<unknown>(`/nonsulfit/result/${publicId}`);
    return response.data;
  },

  getChatHistory: async (publicId: PublicReportId): Promise<unknown> => {
    const response = await api.get<unknown>(`/nonsulfit/chat/${publicId}`);
    return response.data;
  },

  sendChatMessage: async (
    publicId: PublicReportId,
    message: string,
  ): Promise<unknown> => {
    const response = await api.post<unknown>(`/nonsulfit/chat/${publicId}`, {
      message,
    });
    return response.data;
  },
};
