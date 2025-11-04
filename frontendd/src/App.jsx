// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UmkmPage from "./pages/UMKMPage";
import BantuanPage from "./pages/BantuanPage";
import DuplikatPage from "./pages/DuplikatPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/umkm" element={<UmkmPage />} />
        <Route path="/bantuan" element={<BantuanPage />} />
        <Route path="/duplikat" element={<DuplikatPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
