// src/pages/DokumenKesekretariatan.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useNavigate, useParams, Routes, Route } from "react-router-dom";
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
  File
} from "lucide-react";

// DocButton - reuse style from StatCard/BantuanSummary
const DocButton = ({ label, icon: Icon, to, colorBg = "bg-slate-100", colorText = "text-slate-700" }) => {
  return (
    <Link
      to={to || "#"}
      className={`flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 ${colorBg} shadow-sm hover:shadow-md transition-colors hover:bg-opacity-90 text-sm font-semibold`}
      aria-label={label}
      title={label}
      role="button"
    >
      <div className={`p-2 rounded-lg bg-white/40`}>
        <Icon className={`w-5 h-5 ${colorText}`} />
      </div>
      <span className={`${colorText} truncate`}>{label}</span>
    </Link>
  );
};

// helper to build route from label
const makeRoute = (label) => `/dokumen/${label.toLowerCase().replace(/\s+/g, "-")}`;

export default function DokumenKesekretariatan() {
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
    { label: "SKM", icon: Star, colorBg: "bg-pink-50", colorText: "text-pink-800" }
  ];

  const umumBtnList = [
    { label: "Pegawai", icon: Users, colorBg: "bg-gray-50", colorText: "text-gray-800" },
    { label: "Jabatan", icon: Briefcase, colorBg: "bg-yellow-50", colorText: "text-yellow-800" }
  ];

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 bg-white rounded-xl p-6 shadow-md border border-gray-200 flex items-center gap-4">
          <div className="bg-green-600 p-3 rounded-xl">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dokumen Kesekretariatan</h1>
            <p className="text-sm text-gray-600 mt-1">Dinas Koperasi dan UKM</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-2 bg-slate-100 rounded-md border text-sm hover:bg-slate-200"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Row: Program, Perencanaan, Anggaran, Keuangan, dan Pelaporan */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Layers className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Program, Perencanaan, Anggaran, Keuangan, dan Pelaporan</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {sekperBtnList.map(({ label, icon, colorBg, colorText }) => (
  <DocButton
    key={label}
    label={label}
    icon={icon}
    to={makeRoute(label)}   // <-- pastikan ini
    colorBg={colorBg}
    colorText={colorText}
  />
))}
          </div>
        </section>

        {/* Row: Umum dan Kepegawaian */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Umum dan Kepegawaian</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {umumBtnList.map(({ label, icon, colorBg, colorText }) => (
              <DocButton key={label} label={label} icon={icon} to={makeRoute(label)} colorBg={colorBg} colorText={colorText} />
            ))}
          </div>
        </section>

        {/* Footer action */}
        <div className="flex justify-center mt-6">
          <button className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-shadow shadow-md hover:shadow-xl flex items-center gap-3">
            <Activity className="w-5 h-5 text-white" />
            Semua Dokumen
          </button>
        </div>
      </div>
    </div>
  );
}

