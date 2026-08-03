import React, { createContext, useContext, useState, useEffect } from "react";
import {
  AUTH_USER_KEY,
  clearAuthStorage,
  getAccessToken,
  storeAuthTokens,
} from "../utils/authStorage";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  resetAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    const savedUser = localStorage.getItem(AUTH_USER_KEY);

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("유저 정보 복구 실패:", error);
        clearAuthStorage();
      }
    }
    setIsLoading(false); // 체크 끝났으니 로딩 종료
  }, []);

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    storeAuthTokens(accessToken, refreshToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    clearAuthStorage();
    setUser(null);
  };

  const resetAuthState = () => setUser(null);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout, resetAuthState }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 반드시 AuthProvider 안에서 사용되어야 합니다.");
  }
  return context;
};
