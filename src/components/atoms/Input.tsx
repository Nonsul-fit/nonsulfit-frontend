import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}
const Input = ({ label, ...props }: InputProps) => {
  return (
    <div>
      <input
        {...props}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-all focus:border-primary focus:bg-white   focus:ring-primary"
      />
    </div>
  );
};

export default Input;
