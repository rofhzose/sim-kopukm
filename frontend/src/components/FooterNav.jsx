import React from "react";
import { NavLink } from "react-router-dom";
import { Home, FileText, Store, Banknote } from "lucide-react";

export default function FooterNav() {
  const itemClass = "flex flex-col items-center justify-center py-2";
  const iconClass = "w-6 h-6";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-4">
          <NavLink to="/overview" className={({ isActive }) => `${itemClass} ${isActive ? "text-blue-600" : "text-gray-600"}`}>
            <Home className={iconClass} />
            <span className="text-xs mt-1">Dashboard</span>
          </NavLink>

          <NavLink to="/sekretariat" className={({ isActive }) => `${itemClass} ${isActive ? "text-blue-600" : "text-gray-600"}`}>
            <FileText className={iconClass} />
            <span className="text-xs mt-1">Sekretariat</span>
          </NavLink>

          <NavLink to="/dashboard" className={({ isActive }) => `${itemClass} ${isActive ? "text-blue-600" : "text-gray-600"}`}>
            <Store className={iconClass} />
            <span className="text-xs mt-1">Bidang UMKM</span>
          </NavLink>

          <NavLink to="/koperasi" className={({ isActive }) => `${itemClass} ${isActive ? "text-blue-600" : "text-gray-600"}`}>
            <Banknote className={iconClass} />
            <span className="text-xs mt-1">Koperasi</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
