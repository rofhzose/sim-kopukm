// src/layouts/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import FooterNav from "../components/FooterNav";

/**
 * MainLayout wraps pages and shows footer nav on every page that uses this layout.
 * Use this in App.jsx by nesting routes under the layout route.
 */
export default function MainLayout() {
  return (
    <div className="min-h-screen pb-20"> {/* padding bottom to avoid content hidden by footer */}
      <Outlet />
      <FooterNav />
    </div>
  );
}
