import { Outlet } from "react-router-dom";
import Header from "../components/organisms/Header";
import Sidebar from "../components/organisms/Sidebar";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header />
      <div className="flex flex-col md:flex-row pt-16">
        <Sidebar />
        <main className="w-full min-h-[calc(100vh-64px)] p-5 pb-24 ml-0 md:ml-64 md:p-10 md:pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
