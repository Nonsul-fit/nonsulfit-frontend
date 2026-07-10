import api from "../api/axios";

export const legacyApi = {
  getStatus: async (): Promise<unknown> => {
    const response = await api.get<unknown>("/nonsulfit/status");
    return response.data;
  },

  getResultList: async (): Promise<unknown> => {
    const response = await api.get<unknown>("/nonsulfit/result");
    return response.data;
  },

  getResultDetail: async (publicId: number): Promise<unknown> => {
    const response = await api.get<unknown>(`/nonsulfit/result/${publicId}`);
    return response.data;
  },

  getChatHistory: async (publicId: number): Promise<unknown> => {
    const response = await api.get<unknown>(`/nonsulfit/chat/${publicId}`);
    return response.data;
  },

  sendChatMessage: async (
    publicId: number,
    message: string,
  ): Promise<unknown> => {
    const response = await api.post<unknown>(`/nonsulfit/chat/${publicId}`, {
      message,
    });
    return response.data;
  },
};
