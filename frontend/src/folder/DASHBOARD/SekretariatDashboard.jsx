import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Layers,
  FileSpreadsheet,
  BookOpen,
  Calendar,
  CheckSquare,
  FileEdit,
  Archive,
  FilePlus,
  Activity,
  Clipboard,
  AlertTriangle,
  Grid,
  FileArchive,
  Folder,
  List,
  BarChart2,
  TrendingUp,
  Star,
  Users,
  Briefcase,
  File,
  Package,
} from "lucide-react";

/* ================= DOC BUTTON ================= */
const DocButton = ({ label, icon: Icon, to, colorBg = "bg-slate-100", colorText = "text-slate-700" }) => {
  return (
    <Link
      to={to || "#"}
      className={`group flex items-center gap-3 p-4 rounded-2xl border border-slate-200 ${colorBg}
      bg-opacity-80 hover:bg-opacity-100 shadow-sm hover:shadow-md transition-all`}
      aria-label={label}
      title={label}
      role="button"
    >
      <div className="p-2 rounded-xl bg-white/70 group-hover:bg-white transition">
        <Icon className={`w-5 h-5 ${colorText}`} />
      </div>
      <span className={`font-bold text-sm ${colorText} truncate`}>{label}</span>
    </Link>
  );
};

/* ================= ROUTE HELPER ================= */
const makeRoute = (label) => `/dokumen/${label.toLowerCase().replace(/\s+/g, "-")}`;

export default function DokumenKesekretariatan() {
  /* ===== DATA ASLI — TIDAK DIUBAH ===== */
  const sekperBtnList = [
    { label: "SOTK", icon: Layers, colorBg: "bg-blue-50", colorText: "text-blue-700" },
    { label: "RKA", icon: FileSpreadsheet, colorBg: "bg-emerald-50", colorText: "text-emerald-700" },
    { label: "RENSTRA", icon: BookOpen, colorBg: "bg-purple-50", colorText: "text-purple-700" },
    { label: "RENJA", icon: Calendar, colorBg: "bg-pink-50", colorText: "text-pink-700" },
    { label: "SOP", icon: CheckSquare, colorBg: "bg-amber-50", colorText: "text-amber-700" },
    { label: "LKPJ", icon: FileEdit, colorBg: "bg-indigo-50", colorText: "text-indigo-700" },
    { label: "DPA", icon: Archive, colorBg: "bg-cyan-50", colorText: "text-cyan-700" },
    { label: "KAK", icon: File, colorBg: "bg-lime-50", colorText: "text-lime-700" },
    { label: "PERJANJIAN KINERJA", icon: FilePlus, colorBg: "bg-fuchsia-50", colorText: "text-fuchsia-700" },
    { label: "RENCANA AKSI", icon: Activity, colorBg: "bg-rose-50", colorText: "text-rose-700" },
    { label: "SPIP", icon: Clipboard, colorBg: "bg-sky-50", colorText: "text-sky-700" },
    { label: "RISK REGISTER", icon: AlertTriangle, colorBg: "bg-red-50", colorText: "text-red-700" },
    { label: "MANAJEMEN RISIKO", icon: Grid, colorBg: "bg-stone-50", colorText: "text-stone-700" },
    { label: "CASCADING", icon: FileArchive, colorBg: "bg-violet-50", colorText: "text-violet-700" },
    { label: "LAKIP", icon: FileArchive, colorBg: "bg-amber-50", colorText: "text-amber-800" },
    { label: "LHP", icon: Folder, colorBg: "bg-emerald-50", colorText: "text-emerald-800" },
    { label: "LKE", icon: List, colorBg: "bg-sky-50", colorText: "text-sky-800" },
    { label: "LPPD", icon: BarChart2, colorBg: "bg-indigo-50", colorText: "text-indigo-800" },
    { label: "POHON KINERJA", icon: TrendingUp, colorBg: "bg-lime-50", colorText: "text-lime-800" },
    { label: "SKM", icon: Star, colorBg: "bg-pink-50", colorText: "text-pink-800" },
  ];

  const umumBtnList = [
    { label: "Pegawai", icon: Users, colorBg: "bg-gray-50", colorText: "text-gray-800" },
    { label: "Jabatan", icon: Briefcase, colorBg: "bg-yellow-50", colorText: "text-yellow-800" },
    { label: "INVENTARIS", icon: Package, colorBg: "bg-orange-50", colorText: "text-orange-800" },
    { label: "BUKU TAMU", icon: Clipboard, colorBg: "bg-emerald-50", colorText: "text-emerald-700" },
  ];

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8 font-sans text-slate-900">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* ===== HEADER ===== */}
        <header className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-emerald-600 p-3 rounded-2xl">
            <FileText className="w-8 h-8 text-white" />
          </div>

          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Dokumen Kesekretariatan</h1>
            <p className="text-sm text-slate-500 mt-1 uppercase tracking-wider font-semibold">Dinas Koperasi dan UKM</p>
          </div>

          <div className="ml-auto">
            <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 hover:bg-slate-100">
              Refresh
            </button>
          </div>
        </header>

        {/* ===== SECTION: SEKRETARIAT / PERENCANAAN ===== */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-xl">
              <Layers className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-black text-slate-800">Program, Perencanaan, Anggaran, Keuangan & Pelaporan</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sekperBtnList.map(({ label, icon, colorBg, colorText }) => (
              <DocButton key={label} label={label} icon={icon} to={makeRoute(label)} colorBg={colorBg} colorText={colorText} />
            ))}
          </div>
        </section>

        {/* ===== SECTION: UMUM & KEPEGAWAIAN ===== */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-xl">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-xl font-black text-slate-800">Umum, Kepegawaian & Aset</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {umumBtnList.map(({ label, icon, colorBg, colorText }) => (
              <DocButton key={label} label={label} icon={icon} to={makeRoute(label)} colorBg={colorBg} colorText={colorText} />
            ))}
          </div>
        </section>

        {/* ===== FOOTER ACTION ===== */}
        <div className="flex justify-center pt-6">
          <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-200 transition">
            <Activity className="w-5 h-5" />
            Semua Dokumen
          </button>
        </div>
      </div>
    </div>
  );
}
