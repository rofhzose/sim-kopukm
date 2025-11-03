"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { AlertTriangle } from "lucide-react";

interface BantuanItem {
  id: number;
  nama: string;
  nik: string | null;
  nama_produk: string;
  nama_umkm: string;
  alamat: string;
  kecamatan: string;
  no_hp: string;
  nib: string | null;
  no_pirt: string | null;
  no_halal: string | null;
  jenis_alat_bantu: string;
  tahun: number;
  keterangan: string;
}

interface SummaryData {
  total_penerima: number;
  jumlah_umkm_dapat_bantuan: number;
  total_umkm_terdaftar: number;
  persentase_dapat_bantuan: string;
}

export default function PenerimaBantuanPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [list, setList] = useState<BantuanItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 100;

  // 🔹 Ambil data saat load
  useEffect(() => {
    fetchSummary();
    fetchTable(1);
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axiosInstance.get("/dashboard/bantuan-summary");
      if (res.data.success) setSummary(res.data.data);
    } catch (err) {
      console.error("❌ Gagal ambil summary:", err);
    }
  };

  const fetchTable = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/dashboard/bantuan-list?page=${pageNum}&limit=${limit}`
      );
      if (res.data.success) {
        setList(res.data.data);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setPage(pageNum);
      }
    } catch (err) {
      console.error("❌ Gagal ambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ⚠️ Helper: render nilai + tanda seru kuning jika null
  const renderValue = (val: any) => {
    if (val === null || val === "" || val === undefined) {
      return (
        <span className="flex items-center justify-center gap-1 text-yellow-600 font-medium">
          <AlertTriangle size={16} />
          <span className="text-gray-600 text-sm italic">Kosong</span>
        </span>
      );
    }
    return <span className="text-gray-800">{val}</span>;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
      <h1 className="text-3xl font-bold text-center mb-4 text-blue-700">
        📋 Daftar Penerima Bantuan UMKM
      </h1>

      {/* === 📊 SUMMARY MINI === */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 text-center">
          <div className="bg-blue-100 p-3 rounded-lg">
            <p className="text-sm text-gray-600 font-medium">Total Penerima</p>
            <p className="text-2xl font-bold text-blue-700">
              {summary.total_penerima.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <p className="text-sm text-gray-600 font-medium">UMKM Dapat Bantuan</p>
            <p className="text-2xl font-bold text-green-700">
              {summary.jumlah_umkm_dapat_bantuan.toLocaleString()}
            </p>
          </div>
          <div className="bg-yellow-100 p-3 rounded-lg">
            <p className="text-sm text-gray-600 font-medium">UMKM Terdaftar</p>
            <p className="text-2xl font-bold text-yellow-700">
              {summary.total_umkm_terdaftar.toLocaleString()}
            </p>
          </div>
          <div className="bg-purple-100 p-3 rounded-lg">
            <p className="text-sm text-gray-600 font-medium">Persentase Bantuan</p>
            <p className="text-2xl font-bold text-purple-700">
              {summary.persentase_dapat_bantuan}%
            </p>
          </div>
        </div>
      )}

      {/* === 📋 TABEL DATA === */}
      {loading ? (
        <p className="text-center text-gray-500">Memuat data penerima...</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
          <table className="min-w-full border-collapse text-sm text-gray-800">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-2 border text-center font-semibold">No</th>
                <th className="p-2 border text-left font-semibold">Nama</th>
                <th className="p-2 border text-left font-semibold">NIK</th>
                <th className="p-2 border text-left font-semibold">Nama UMKM</th>
                <th className="p-2 border text-left font-semibold">Produk</th>
                <th className="p-2 border text-left font-semibold">Alamat</th>
                <th className="p-2 border text-left font-semibold">Kecamatan</th>
                <th className="p-2 border text-left font-semibold">No. HP</th>
                <th className="p-2 border text-center font-semibold">NIB</th>
                <th className="p-2 border text-center font-semibold">PIRT</th>
                <th className="p-2 border text-center font-semibold">Halal</th>
                <th className="p-2 border text-center font-semibold">Alat Bantu</th>
                <th className="p-2 border text-center font-semibold">Tahun</th>
                <th className="p-2 border text-center font-semibold">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item, i) => (
                <tr
                  key={item.id}
                  className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition"
                >
                  <td className="p-2 border text-center font-medium">
                    {(page - 1) * limit + i + 1}
                  </td>
                  <td className="p-2 border">{renderValue(item.nama)}</td>
                  <td className="p-2 border">{renderValue(item.nik)}</td>
                  <td className="p-2 border">{renderValue(item.nama_umkm)}</td>
                  <td className="p-2 border">{renderValue(item.nama_produk)}</td>
                  <td className="p-2 border">{renderValue(item.alamat)}</td>
                  <td className="p-2 border">{renderValue(item.kecamatan)}</td>
                  <td className="p-2 border">{renderValue(item.no_hp)}</td>
                  <td className="p-2 border text-center">{renderValue(item.nib)}</td>
                  <td className="p-2 border text-center">{renderValue(item.no_pirt)}</td>
                  <td className="p-2 border text-center">{renderValue(item.no_halal)}</td>
                  <td className="p-2 border text-center">{renderValue(item.jenis_alat_bantu)}</td>
                  <td className="p-2 border text-center">{renderValue(item.tahun)}</td>
                  <td className="p-2 border text-center">{renderValue(item.keterangan)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4 text-gray-700">
          <button
            disabled={page <= 1}
            onClick={() => fetchTable(page - 1)}
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            ← Prev
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => fetchTable(page + 1)}
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
