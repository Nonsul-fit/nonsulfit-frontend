import React from "react";
import brandLogo from "../assets/brand-logo2.png";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-4 font-sans">
      <div className="w-full max-w-[400px] rounded-3xl bg-white p-10 shadow-2xl shadow-blue-100/40">
        <div className="mb-8 text-center">
          <img
            src={brandLogo}
            className="w-16 mx-auto block"
            alt="Nonsulfit Logo"
          />
        </div>

        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
