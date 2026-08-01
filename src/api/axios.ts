import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import {
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  storeAuthTokens,
} from "../utils/authStorage.ts";
import { shouldRefreshAccessToken } from "../utils/authRetry";

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,

  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

const isAuthExcludedUrl = (url?: string) =>
  url?.includes("/auth/login") ||
  url?.includes("/login") ||
  url?.includes("/auth/register") ||
  url?.includes("/signup") ||
  url?.includes("/auth/check-email");

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token && !isAuthExcludedUrl(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest | undefined;

    if (
      originalRequest &&
      shouldRefreshAccessToken(error, originalRequest._retry === true) &&
      !isAuthExcludedUrl(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          throw new Error("리프레시 토큰이 없습니다.");
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/token/access`,
          {},
          {
            headers: { Authorization: `Bearer ${refreshToken}` },

            timeout: 60000,
          },
        );

        const newAccessToken = response.data?.accessToken;
        if (typeof newAccessToken !== "string" || !newAccessToken) {
          throw new Error("새 액세스 토큰이 없습니다.");
        }
        storeAuthTokens(newAccessToken, refreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearAuthStorage();
        if (typeof alert === "function") {
          alert("세션이 만료되었습니다. 다시 로그인해 주세요.");
        }
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
