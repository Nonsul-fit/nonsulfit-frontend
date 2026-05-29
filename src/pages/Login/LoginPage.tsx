import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Button from "../../components/atoms/Button";
import Input from "../../components/atoms/Input";
import { useForm } from "../../hooks/useForm";
import AuthLayout from "../../layouts/AuthLayout";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { values, handleChange } = useForm({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!values.email || !values.password) {
      alert("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const credentials = window.btoa(`${values.email}:${values.password}`);

      const response = await api.post(
        "/auth/login",
        {},
        {
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        },
      );

      const { accessToken, refreshToken, user } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      alert(`${user.name}님, 환영합니다!`);
      navigate("/home");
    } catch (error: any) {
      console.error("로그인 에러:", error);
      alert("로그인 정보가 일치하지 않습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form className="space-y-5" onSubmit={handleLogin}>
        <div>
          <label className="text-sm font-medium text-gray-700">이메일</label>
          <Input
            name="email"
            type="email"
            value={values.email} //
            placeholder="example@nonsulfit.com"
            onChange={handleChange}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <button
              type="button"
              className="text-xs text-[#2d3779] hover:underline"
            >
              비밀번호 찾기
            </button>
          </div>
          <Input
            name="password"
            type="password"
            placeholder="••••••••"
            value={values.password}
            onChange={handleChange}
          />
        </div>

        <Button type="submit" isLoading={isLoading}>
          로그인
        </Button>
      </form>

      <div className="my-8 flex items-center gap-4">
        <div className="h-[1px] flex-1 bg-gray-100"></div>
        <span className="text-xs text-gray-400 font-medium">또는</span>
        <div className="h-[1px] flex-1 bg-gray-100"></div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          아직 계정이 없으신가요?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="font-bold text-[#2d3779] hover:underline"
          >
            회원가입하기
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
