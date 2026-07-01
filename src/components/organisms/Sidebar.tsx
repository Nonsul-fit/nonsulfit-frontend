import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menus = [
    { name: "성적 입력", path: "/home" },
    { name: "분석 리포트", path: "/result" },
    { name: "모의 테스트", path: "/payment" },
  ];

  return (
    <aside className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center bg-[#ebf2fb] px-4 border-t border-blue-100 shadow-sm md:top-14 md:bottom-auto md:h-[calc(100vh-56px)] md:w-64 md:flex-col md:items-stretch md:justify-start md:p-6 md:border-t-0 md:border-r md:border-blue-100 md:shadow-none">
      <nav className="flex w-full flex-row gap-2 md:flex-col md:gap-4">
        {menus.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            className={({ isActive }) =>
              `flex-1 md:flex-none rounded-xl px-4 py-2.5 text-center md:text-left text-[14px] font-bold tracking-tight transition-all ${
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
