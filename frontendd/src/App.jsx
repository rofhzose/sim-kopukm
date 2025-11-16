import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import MainLayout from "./layouts/MainLayout";
import OverviewDashboard from "./pages/OverviewDashboard";
import DashboardPage from "./pages/DashboardPage";
import UmkmPage from "./pages/UMKMPage";
import BantuanPage from "./pages/BantuanPage";
import DuplikatPage from "./pages/DuplikatPage";
import BantuanTidakTerdaftarPage from "./pages/BantuanTidakTerdaftarPage";
import KoperasiPage from "./pages/KoperasiPage";
import KoperasiDataPage from "./pages/KoperasiDataPage";
import DuplikatKoperasi from "./pages/DuplikatKoperasi";
import DuplikatKoperasiDetails from "./pages/DuplikatKoperasiDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />

        {/* routes with footer */}
        <Route element={<MainLayout />}>
          <Route path="/overview" element={<OverviewDashboard />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/umkm" element={<UmkmPage />} />
          <Route path="/bantuan" element={<BantuanPage />} />
          <Route path="/duplikat" element={<DuplikatPage />} />
          <Route path="/bantuan-tidak-terdaftar" element={<BantuanTidakTerdaftarPage />} />
          <Route path="/koperasi" element={<KoperasiPage />} />
          <Route path="/koperasidata" element={<KoperasiDataPage />} />
          <Route path="/duplikat-koperasi" element={<DuplikatKoperasi />} />
          <Route path="/duplikat-koperasi/details" element={<DuplikatKoperasiDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
