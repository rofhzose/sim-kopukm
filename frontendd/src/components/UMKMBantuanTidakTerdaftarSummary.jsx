import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function UMKMBantuanTidakTerdaftarSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(
          "/dashboard/bantuan-tidak-terdaftar-summary"
        );
        if (res.data?.success) {
          setData(res.data.data);
        } else {
          setError("Gagal memuat data ringkasan bantuan tidak terdaftar.");
        }
      } catch (err) {
        console.error("❌ Error fetching bantuan tidak terdaftar:", err);
        setError("Tidak dapat terhubung ke server.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="text-gray-600 text-center mt-10 animate-pulse">
        🔄 Memuat analisis bantuan tidak terdaftar...
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
    <div className="flex flex-col items-center gap-6 w-full max-w-6xl px-4">
      <h1 className="text-2xl font-bold text-gray-800 mt-6 mb-2">
        🚨 Ringkasan Bantuan Tidak Terdaftar
      </h1>

      {/* === CARD SUMMARY === */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
        <div className="bg-white shadow-md rounded-xl p-6 border border-red-100 text-center hover:shadow-lg hover:scale-[1.02] transition">
          <h2 className="text-lg text-gray-600 font-medium mb-1">
            Total Tidak Terdaftar
          </h2>
          <p className="text-4xl font-bold text-red-600">
            {data?.total_tidak_terdaftar?.toLocaleString("id-ID") ?? 0}
          </p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6 border border-green-100 text-center hover:shadow-lg hover:scale-[1.02] transition">
          <h2 className="text-lg text-gray-600 font-medium mb-1">
            Penerima 1x Bantuan
          </h2>
          <p className="text-4xl font-bold text-green-600">
            {data?.duplikasi?.penerima_1x?.toLocaleString("id-ID") ?? 0}
          </p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6 border border-yellow-100 text-center hover:shadow-lg hover:scale-[1.02] transition">
          <h2 className="text-lg text-gray-600 font-medium mb-1">
            Penerima Ganda
          </h2>
          <p className="text-4xl font-bold text-yellow-600">
            {data?.duplikasi?.penerima_ganda?.toLocaleString("id-ID") ?? 0}
          </p>
        </div>
      </div>

      {/* === RINGKASAN TAHUNAN === */}
      <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100 w-full">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">
          📅 Ringkasan Penerima Tidak Terdaftar per Tahun
        </h3>

        <table className="min-w-full border border-gray-200 rounded-lg bg-white shadow">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-2 text-left">Tahun</th>
              <th className="px-4 py-2 text-left">Jumlah Tidak Terdaftar</th>
            </tr>
          </thead>
          <tbody>
            {data?.ringkasan_tahunan?.map((r) => (
              <tr
                key={r.tahun}
                className="border-b hover:bg-blue-50 transition-colors"
              >
                <td className="px-4 py-2 font-medium">{r.tahun}</td>
                <td className="px-4 py-2">
                  {r.jumlah_tidak_terdaftar.toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* === PENJELASAN === */}
      <div className="bg-white shadow-md rounded-xl p-6 mt-8 w-full text-gray-700 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">
          🧠 Penjelasan Singkat
        </h3>

        <p className="text-gray-700 leading-relaxed mb-3">
          {analisis.keterangan}
        </p>

        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>
            <strong>Total Tidak Terdaftar:</strong>{" "}
            {analisis.dasar_perhitungan?.total_tidak_terdaftar}
          </li>
          <li>
            <strong>Ringkasan Tahunan:</strong>{" "}
            {analisis.dasar_perhitungan?.ringkasan_tahunan}
          </li>
          <li>
            <strong>Analisis Tahunan:</strong>{" "}
            {analisis.dasar_perhitungan?.analisis_tahunan}
          </li>
          <li>
            <strong>Duplikasi:</strong>{" "}
            {analisis.dasar_perhitungan?.duplikasi}
          </li>
        </ul>

        <p className="text-sm text-gray-500 mt-3 italic">
          📝 {analisis.catatan}
        </p>
      </div>

      {/* === TOMBOL NAVIGASI KE HALAMAN DETAIL === */}
      <button
        onClick={() => navigate("/bantuan-tidak-terdaftar")}
        className="mt-8 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all shadow-md"
      >
        🔍 Lihat Detail Penerima Tidak Terdaftar
      </button>
    </div>
  );
}
