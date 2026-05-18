import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/organisms/Header";
import Sidebar from "../components/organisms/Sidebar";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header />
      <div className="flex pt-16">
        <Sidebar />
        <main className="ml-64 w-full p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
