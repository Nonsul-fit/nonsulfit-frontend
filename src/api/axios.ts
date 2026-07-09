import axios from "axios";

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
    const token = localStorage.getItem("accessToken");

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
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthExcludedUrl(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

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

        const newAccessToken = response.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        alert("세션이 만료되었습니다. 다시 로그인해 주세요.");
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
