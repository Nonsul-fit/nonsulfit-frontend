import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menus = [
    { name: "홈", path: "/home" },
    { name: "마이페이지", path: "/mypage" },
    { name: "분석 페이지", path: "/analysis" },
  ];

  return (
    <aside className="fixed left-0 top-14 h-[calc(100vh-64px)] w-64 bg-[#ebf2fb] p-6">
      <nav className="flex flex-col gap-4">
        {menus.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            className={({ isActive }) =>
              `rounded-xl px-4 py-3 text-lg font-bold transition-all ${
                isActive
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-500 hover:bg-white/50"
              }`
            }
          >
            {menu.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
