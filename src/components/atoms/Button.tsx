import React from "react";

// 버튼이 가질 수 있는 옵션들을 정의합니다.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "text";
  fullWidth?: boolean;
  isLoading?: boolean;
}

const Button = ({
  children,
  variant = "primary",
  fullWidth = true,
  isLoading = false,
  className = "",
  ...props
}: ButtonProps) => {
  // 공통적으로 들어갈 기본 스타일
  const baseStyles =
    "transition-all font-bold active:scale-[0.98] disabled:opacity-50";

  // 타입별 스타일 (피그마의 Variants와 같은 개념)
  const variants = {
    primary: "bg-primary text-white p-3 rounded-lg hover:bg-opacity-90",
    outline:
      "border border-gray-200 bg-white text-gray-500 p-3 rounded-lg hover:bg-gray-50 hover:text-primary",
    text: "text-primary hover:underline p-0", // 회원가입하기 같은 링크 스타일
  };

  const widthStyle = fullWidth ? "w-full" : "w-auto";

  return (
    <button
      disabled={isLoading || props.disabled}
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
