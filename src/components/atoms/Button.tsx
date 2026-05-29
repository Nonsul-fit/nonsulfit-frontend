import React from "react";

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
  const baseStyles =
    "transition-all font-bold active:scale-[0.98] disabled:opacity-50";

  const variants = {
    primary: "bg-primary text-white p-3 rounded-lg hover:bg-opacity-90",
    outline:
      "border border-gray-200 bg-white text-gray-500 p-3 rounded-lg hover:bg-gray-50 hover:text-primary",
    text: "text-primary hover:underline p-0",
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
