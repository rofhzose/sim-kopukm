import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

export default function BantuanSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get("/dashboard/bantuan-summary");
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setError("Gagal memuat data bantuan.");
        }
      } catch (err) {
        setError("Tidak dapat terhubung ke API bantuan.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="text-gray-600 text-center mt-10 animate-pulse">
        🔄 Memuat data bantuan...
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 text-center mt-10">
        ❌ {error}
      </div>
    );

  const analisis = data?.analisis || {};

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold text-gray-800 mt-6 mb-4">
        📦 Ringkasan Bantuan UMKM
      </h1>

      {/* ================= CARD GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-6xl mt-4">
        {/* Total Penerima */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-blue-100 text-center hover:scale-[1.02] transition">
          <h2 className="text-lg text-gray-600 font-medium mb-2">
            Total Penerima
          </h2>
          <p className="text-4xl font-bold text-blue-600">
            {data?.total_penerima?.toLocaleString("id-ID")}
          </p>
        </div>

        {/* UMKM Dapat Bantuan */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-green-100 text-center hover:scale-[1.02] transition">
          <h2 className="text-lg text-gray-600 font-medium mb-2">
            UMKM Dapat Bantuan
          </h2>
          <p className="text-4xl font-bold text-green-600">
            {data?.jumlah_umkm_dapat_bantuan?.toLocaleString("id-ID")}
          </p>
        </div>

        {/* Profil Lengkap */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-amber-100 text-center hover:scale-[1.02] transition">
          <h2 className="text-lg text-gray-600 font-medium mb-2">
            Profil Lengkap
          </h2>
          <p className="text-4xl font-bold text-amber-600">
            {data?.total_lengkap?.toLocaleString("id-ID")}
          </p>
        </div>

        {/* Profil Lengkap & Valid */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-emerald-100 text-center hover:scale-[1.02] transition">
          <h2 className="text-lg text-gray-600 font-medium mb-2">
            Lengkap & Valid
          </h2>
          <p className="text-4xl font-bold text-emerald-600">
            {data?.total_lengkap_valid?.toLocaleString("id-ID")}
          </p>
        </div>

        {/* Profil Belum Lengkap */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-red-100 text-center hover:scale-[1.02] transition">
          <h2 className="text-lg text-gray-600 font-medium mb-2">
            Belum Lengkap
          </h2>
          <p className="text-4xl font-bold text-red-600">
            {data?.total_belum_lengkap?.toLocaleString("id-ID")}
          </p>
        </div>

        {/* Persentase Bantuan */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-purple-100 text-center hover:scale-[1.02] transition">
          <h2 className="text-lg text-gray-600 font-medium mb-2">
            Persentase Bantuan
          </h2>
          <p className="text-4xl font-bold text-purple-600">
            {data?.persentase_dapat_bantuan ?? 0}%
          </p>
        </div>
      </div>

      {/* ================= PENJELASAN (BAHASA SEDERHANA) ================= */}
      <div className="bg-white shadow-md rounded-xl p-6 mt-10 w-full max-w-6xl text-gray-700 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">
          🧠 Penjelasan Singkat
        </h3>

        <p className="text-gray-700 leading-relaxed mb-3">
          {analisis.keterangan ||
            "Data ini menampilkan jumlah penerima bantuan, kelengkapan profil, dan validitas izin usaha (PIRT & Halal)."}
        </p>

        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>
            <strong>Total penerima:</strong>{" "}
            {analisis.dasar_perhitungan?.total_penerima ||
              "Jumlah seluruh penerima bantuan yang tercatat di sistem."}
          </li>
          <li>
            <strong>Profil lengkap:</strong>{" "}
            {analisis.dasar_perhitungan?.total_lengkap ||
              "Penerima yang telah mengisi seluruh kolom wajib (nama, alamat, NIK, produk, izin, dan lainnya)."}
          </li>
          <li>
            <strong>Lengkap & valid:</strong>{" "}
            {analisis.dasar_perhitungan?.total_lengkap_valid ||
              "Penerima bantuan yang sudah memiliki data lengkap serta sertifikat PIRT dan Halal valid."}
          </li>
          <li>
            <strong>Belum lengkap:</strong>{" "}
            {analisis.dasar_perhitungan?.total_belum_lengkap ||
              "Penerima bantuan yang masih memiliki data kosong atau belum lengkap."}
          </li>
          <li>
            <strong>Persentase bantuan:</strong>{" "}
            {analisis.dasar_perhitungan?.persentase_dapat_bantuan ||
              "Perbandingan UMKM penerima bantuan dengan total UMKM terdaftar di sistem."}
          </li>
        </ul>

        <p className="text-sm text-gray-500 mt-3 italic">
          📝 {analisis.catatan ||
            "Kolom yang diperiksa: nama, NIK, nama_produk, nama_umkm, alamat, kecamatan, no_hp, NIB, no_pirt, no_halal, jenis_alat_bantu, tahun, dan keterangan."}
        </p>
      </div>

      {/* ================= TOMBOL ================= */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={() => navigate("/bantuan")}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md"
        >
          📋 Lihat Data Bantuan
        </button>

      </div>
    </div>
  );
}
