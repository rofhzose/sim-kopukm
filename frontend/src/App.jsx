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
import DokumenKesekretariatan from "./pages/DokumenKesekretariatan";
import SOTKPage from "./pages/SOTKPage";
import RkaPage from "./pages/RkaPage";
import RenstraPage from "./pages/RenstraPage";
import RenjaPage from "./pages/RenjaPage";
import SopPage from "./pages/SopPage";
import LkpjPage from "./pages/LkpjPage";
import DpaPage from "./pages/DpaPage";
import KakPage from "./pages/KakPage";
import PerjanjianKinerjaPage from "./pages/PerjanjianKinerjaPage";
import RencanaAksiPage from "./pages/RencanaAksiPage";
import SpipPage from "./pages/SpipPage";
import RiskRegisterPage from "./pages/RiskRegisterPage";
import ManajemenRisikoPage from "./pages/ManajemenRisikoPage";
import CascadingPage from "./pages/CascadingPage";
import LakipPage from "./pages/LakipPage";
import LhpPage from "./pages/LhpPage";
import LkePage from "./pages/LkePage";
import LppdPage from "./pages/LppdPage";
import PohonKinerjaPage from "./pages/PohonKinerjaPage";
import SkmPage from "./pages/SkmPage";
import PegawaiPage from "./pages/PegawaiPage";
import JabatanPage from "./pages/JabatanPage";


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
          <Route path="/sekretariat" element={<DokumenKesekretariatan />} />
          <Route path="/dokumen/sotk" element={<SOTKPage />} />
          <Route path="/dokumen/rka" element={<RkaPage />} />
          <Route path="/dokumen/renstra" element={<RenstraPage />} />
          <Route path="/dokumen/renja" element={<RenjaPage />} />
          <Route path="/dokumen/sop" element={<SopPage />} />
          <Route path="/dokumen/lkpj" element={<LkpjPage />} />
          <Route path="/dokumen/dpa" element={<DpaPage />} />
          <Route path="/dokumen/kak" element={<KakPage />} />
          <Route path="/dokumen/perjanjian-kinerja" element={<PerjanjianKinerjaPage />} />
          <Route path="/dokumen/rencana-aksi" element={<RencanaAksiPage />} />
          <Route path="/dokumen/spip" element={<SpipPage />} />
          <Route path="/dokumen/risk-register" element={<RiskRegisterPage />} />
          <Route path="/dokumen/manajemen-risiko" element={<ManajemenRisikoPage />} />
          <Route path="/dokumen/cascading" element={<CascadingPage />} />
          <Route path="/dokumen/lakip" element={<LakipPage />} />
          <Route path="/dokumen/lhp" element={<LhpPage />} />
          <Route path="/dokumen/lke" element={<LkePage />} />
          <Route path="/dokumen/lppd" element={<LppdPage />} />
          <Route path="/dokumen/pohon-kinerja" element={<PohonKinerjaPage />} />
          <Route path="/dokumen/skm" element={<SkmPage />} />
          <Route path="/dokumen/pegawai" element={<PegawaiPage />} />
          <Route path="/dokumen/jabatan" element={<JabatanPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
