import api from "./axios";

export const checkEmail = async (email: string) => {
  const response = await api.post("/auth/check-email", { email });

  return response.data;
};

export const register = async (userData: {
  email: string;
  name: string;
  password: string;
}) => {
  try {
    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    console.error("회원가입 중 오류 발생:", error);
    throw error;
  }
};
