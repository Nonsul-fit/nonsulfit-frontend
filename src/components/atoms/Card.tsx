import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "white" | "slate";
}

const Card = ({
  children,
  variant = "white",
  className = "",
  ...props
}: CardProps) => {
  const baseStyle = "p-6 rounded-xl border transition-all duration-200";

  const variants = {
    white: "bg-white border-gray-200/70 shadow-sm",
    slate: "bg-slate-50 border-slate-100",
  };

  return (
    <div
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
