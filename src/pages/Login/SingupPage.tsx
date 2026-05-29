import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkEmail, register } from "../../api/auth";
import Button from "../../components/atoms/Button";
import Input from "../../components/atoms/Input";
import { useForm } from "../../hooks/useForm";
import AuthLayout from "../../layouts/AuthLayout";

const SignupPage = () => {
  const navigate = useNavigate();
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { values, handleChange } = useForm({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const [emailStatus, setEmailStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">(
    "IDLE",
  );
  const [emailMessage, setEmailMessage] = useState("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    setEmailStatus("IDLE");
    setEmailMessage("");
  };

  const handleCheckDuplicate = async () => {
    if (!values.email) {
      setEmailStatus("ERROR");
      setEmailMessage("이메일을 입력해주세요.");
      return;
    }

    try {
      const result = await checkEmail(values.email);

      if (result.isDuplicate === true) {
        setEmailStatus("ERROR");
        setEmailMessage("이미 사용 중인 이메일입니다.");
      } else {
        setEmailStatus("SUCCESS");
        setEmailMessage("사용 가능한 이메일입니다!");
      }
    } catch (error) {
      console.error("중복체크 에러:", error);
      setEmailStatus("ERROR");
      setEmailMessage("서버 연결에 실패했습니다.");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (values.password !== values.passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);
    try {
      await register({
        email: values.email,
        name: values.name,
        password: values.password,
      });
      setIsComplete(true);
    } catch (error) {
      alert("회원가입 중 에러가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };
  const MessageSlot = ({
    message,
    status,
  }: {
    message?: string;
    status?: string;
  }) => (
    <div className="h-4 mt-1 px-1">
      {status !== "IDLE" && message && (
        <p
          className={`text-[11px] font-medium animate-in fade-in duration-200 ${
            status === "SUCCESS" ? "text-green-600" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );

  const isPasswordValid = (password: string) => {
    const passwordRegex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\- =]).{8,20}$/;
    return passwordRegex.test(password);
  };

  return (
    <AuthLayout>
      {" "}
      <form className="space-y-1" onSubmit={handleSignup}>
        {/* 이름 */}
        <div>
          <label className="text-sm font-medium text-gray-700">이름</label>
          <Input
            name="name"
            value={values.name}
            onChange={handleChange}
            placeholder="이름을 입력해주세요"
          />
          <MessageSlot
            status={values.name.length === 1 ? "ERROR" : "IDLE"}
            message="이름은 2자 이상 입력해주세요."
          />
        </div>

        {/* 이메일 */}
        <div>
          <label className="text-sm font-medium text-gray-700">이메일</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                name="email"
                type="email"
                value={values.email}
                onChange={handleEmailChange}
                placeholder="example@nonsulfit.com"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              fullWidth={false}
              onClick={handleCheckDuplicate}
              className="shrink-0 w-24 h-[46px] text-xs"
            >
              중복확인
            </Button>
          </div>
          <MessageSlot status={emailStatus} message={emailMessage} />
        </div>

        {/* 비밀번호 */}
        <div>
          <label className="text-sm font-medium text-gray-700">비밀번호</label>
          <Input
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            placeholder="영문, 숫자, 특수문자 조합 8~20자 입력해주세요"
          />
          <MessageSlot
            status={
              values.password.length > 0 && !isPasswordValid(values.password)
                ? "ERROR"
                : "IDLE"
            }
            message="영문, 숫자, 특수문자 조합 8~20자 입력해주세요."
          />
        </div>

        {/* 비밀번호 확인 */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            비밀번호 확인
          </label>
          <Input
            name="passwordConfirm"
            type="password"
            value={values.passwordConfirm}
            onChange={handleChange}
            placeholder="한번 더 입력"
          />
          <MessageSlot
            status={
              values.passwordConfirm &&
              values.password !== values.passwordConfirm
                ? "ERROR"
                : "IDLE"
            }
            message="비밀번호가 일치하지 않습니다."
          />
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={emailStatus !== "SUCCESS"}
          className="mt-4"
        >
          가입하기
        </Button>
      </form>
      <div className="my-8 flex items-center gap-4">
        <div className="h-[1px] flex-1 bg-gray-100"></div>
        <span className="text-xs text-gray-400 font-medium">또는</span>
        <div className="h-[1px] flex-1 bg-gray-100"></div>
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-500">
          이미 계정이 있으신가요?{" "}
          <Button
            variant="text"
            fullWidth={false}
            onClick={() => navigate("/login")}
          >
            로그인하기
          </Button>
        </p>
      </div>
      {isComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-[360px] rounded-3xl bg-white p-8 text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
              <svg
                className="h-10 w-10 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              환영합니다!
            </h2>
            <p className="mb-8 text-gray-500 text-sm">
              논술핏 회원가입이 완료되었습니다.
              <br />
              이제 목표 대학을 분석해 볼까요?
            </p>
            <Button onClick={() => navigate("/login")}>로그인하러 가기</Button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default SignupPage;
