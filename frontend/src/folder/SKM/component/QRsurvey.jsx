import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCircle,
  CheckCircle2,
  Frown,
  Meh,
  Smile,
  Laugh,
  Send,
  Star,
  ClipboardList,
  Store,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import QRCode from "qrcode";

const PublicSurveyPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // QR STATE (AMAN)
  const [qr, setQr] = useState("");

  const [formData, setFormData] = useState({
    nama_layanan: "",
    jenis_kelamin: "",
    pendidikan: "",
    pekerjaan: "",
    tahun: new Date().getFullYear(),
    u1: 0,
    u2: 0,
    u3: 0,
    u4: 0,
    u5: 0,
    u6: 0,
    u7: 0,
    u8: 0,
    u9: 0,
  });

  // QR GENERATE (SAFE)
  useEffect(() => {
    let isMounted = true;

    const generateQR = async () => {
      try {
        const url = window.location.href;
        const data = await QRCode.toDataURL(url);
        if (isMounted) setQr(data);
      } catch (err) {
        console.log("QR error:", err);
      }
    };

    generateQR();

    return () => {
      isMounted = false;
    };
  }, []);

  const questions = [
    { id: "u1", title: "Persyaratan", desc: "Kelengkapan dan kesesuaian persyaratan", color: "#6366f1" },
    { id: "u2", title: "Prosedur Pelayanan", desc: "Kemudahan alur dan mekanisme pelayanan", color: "#0ea5e9" },
    { id: "u3", title: "Waktu Penyelesaian", desc: "Ketepatan dan kecepatan waktu pelayanan", color: "#f59e0b" },
    { id: "u4", title: "Biaya / Tarif", desc: "Kewajaran dan keterbukaan biaya layanan", color: "#10b981" },
    { id: "u5", title: "Produk Jenis Layanan", desc: "Kesesuaian hasil dengan yang dijanjikan", color: "#ec4899" },
    { id: "u6", title: "Kompetensi Pelaksana", desc: "Kemampuan dan keahlian petugas layanan", color: "#8b5cf6" },
    { id: "u7", title: "Perilaku Pelaksana", desc: "Sikap, sopan santun dan keramahan petugas", color: "#14b8a6" },
    { id: "u8", title: "Penanganan Pengaduan", desc: "Responsivitas terhadap keluhan & masukan", color: "#f97316" },
    { id: "u9", title: "Sarana dan Prasarana", desc: "Kondisi fasilitas dan sarana pendukung", color: "#64748b" },
  ];

  const ratingOptions = [
    { val: 1, label: "Tidak Baik", icon: <Frown />, color: "bg-red-600", text: "text-red-600" },
    { val: 2, label: "Kurang Baik", icon: <Meh />, color: "bg-amber-600", text: "text-amber-600" },
    { val: 3, label: "Baik", icon: <Smile />, color: "bg-blue-600", text: "text-blue-600" },
    { val: 4, label: "Sangat Baik", icon: <Laugh />, color: "bg-emerald-600", text: "text-emerald-600" },
  ];

  const charFilled = [
    formData.nama_layanan,
    formData.jenis_kelamin,
    formData.pendidikan,
    formData.pekerjaan,
  ].filter(Boolean).length;

  const unsurFilled = questions.filter((q) => formData[q.id] > 0).length;
  const totalFilled = charFilled + unsurFilled;
  const totalFields = 13;
  const progressPercent = Math.round((totalFilled / totalFields) * 100);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (totalFilled < totalFields) {
      alert("Mohon lengkapi semua data!");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/skm/survey", formData);
      setSuccess(true);
    } catch (err) {
      alert("Gagal mengirim survey");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-10 rounded-3xl text-center shadow-xl">
          <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={50} />
          <h2 className="text-xl font-bold">Terima Kasih!</h2>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 px-6 py-3 bg-black text-white rounded-xl"
          >
            Selesai
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">

      {/* NAVBAR */}
      <div className="bg-[#0f172a] text-white px-6 py-3 flex items-center gap-3">
        <Store size={28} className="text-sky-400" />
        <div>
          <div className="font-bold">DISPERINDAG KOPUKM</div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6">

        {/* HEADER */}
        <div className="pt-8">
          <h1 className="text-3xl font-black">
            Survey <span className="text-sky-500">Kepuasan</span>
          </h1>
        </div>

        {/* QR SECTION (AMAN, TIDAK NGERUSAK LAYOUT) */}
        {qr && (
          <div className="mt-6 flex justify-center">
            <div className="bg-white p-4 rounded-2xl shadow border">
              <img src={qr} alt="QR Code" className="w-40 h-40" />
              <p className="text-[10px] text-center mt-2 text-gray-500">
                Scan untuk akses survey
              </p>
            </div>
          </div>
        )}

        {/* PROGRESS */}
        <div className="mt-6 bg-white p-4 rounded-2xl shadow">
          Progress: {progressPercent}%
        </div>

        {/* FORM (TETAP ORIGINAL KAMU) */}
        <div className="mt-6 space-y-6">
          {/* === kamu lanjutkan semua form kamu di sini TANPA DIUBAH === */}
        </div>

        {/* BUTTON */}
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-2xl"
          >
            {loading ? "Mengirim..." : "Kirim Survey"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default PublicSurveyPage;