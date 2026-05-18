import React, { useEffect, useState } from "react";
import brandLogo2 from "../../assets/brand-logo3.png";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, [location]);

  const handleAuthAction = () => {
    if (isLoggedIn) {
      localStorage.clear();
      setIsLoggedIn(false);
      alert("로그아웃 되었습니다.");
      navigate("/login");
    } else {
      navigate("/login");
    }
  };

  return (
    <header className="fixed top-0 z-50 flex h-14 w-full items-center bg-primary">
      <div className="flex justify-between items-center w-full p-14">
        <img
          src={brandLogo2}
          alt="Logo"
          className="h-10 w-auto cursor-pointer"
          onClick={() => navigate("/home")}
        />
        <span
          onClick={handleAuthAction}
          className="text-medium duration-200 font-bold text-white/80 cursor-pointer hover:text-white"
        >
          {isLoggedIn ? "로그아웃" : "로그인"}
        </span>
      </div>
    </header>
  );
};

export default Header;
