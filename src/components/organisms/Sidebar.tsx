import { NavLink } from "react-router-dom";
import { BookOpen } from "lucide-react";

const Sidebar = () => {
  const menus = [
    { name: "성적 입력", path: "/home" },
    { name: "분석 리포트", path: "/result" },
    { name: "모의 테스트", path: "/payment" },
    { name: "사용법", path: "/guide", isNew: true },
    { name: "마이페이지", path: "/mypage" },
  ];

  return (
    <aside className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center bg-[#ebf2fb] px-4 border-t border-blue-100 shadow-sm md:top-14 md:bottom-auto md:h-[calc(100vh-56px)] md:w-64 md:flex-col md:items-stretch md:justify-start md:p-6 md:border-t-0 md:border-r md:border-blue-100 md:shadow-none">
      <nav className="flex w-full flex-row gap-2 md:flex-col md:gap-4">
        {menus.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            className={({ isActive }) =>
              `flex min-w-0 flex-1 items-center justify-center gap-1 rounded-xl px-1 py-2.5 text-center text-[12px] font-bold tracking-tight transition-all md:flex-none md:justify-start md:px-4 md:text-left md:text-[14px] ${
                isActive
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-500 hover:bg-white/50"
              }`
            }
          >
            {menu.path === "/guide" && <BookOpen aria-hidden="true" className="hidden h-4 w-4 md:block" />}
            <span className="truncate">{menu.name}</span>
            {menu.isNew && (
              <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold leading-none text-primary md:text-[10px]">
                New
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
