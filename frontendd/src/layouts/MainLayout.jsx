import React from "react";
import { Outlet } from "react-router-dom";
import FooterNav from "../components/FooterNav";

export default function MainLayout() {
  return (
    <div className="min-h-screen pb-24"> {/* pb-24 supaya konten tidak tertutup */}
      <Outlet />
      <FooterNav />
    </div>
  );
}
