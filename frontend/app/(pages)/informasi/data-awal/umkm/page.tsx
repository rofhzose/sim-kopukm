"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { AlertTriangle } from "lucide-react";

interface UmkmItem {
  id: number;
  nama: string;
  jenis_kelamin: string;
  nama_usaha: string;
  alamat: string;
  kecamatan: string;
  desa: string;
  longitude: string;
  latitude: string;
  jenis_ukm: string;
  nib: string;
}

interface UmkmSummary {
  total_umkm: number;
  total_duplikat: number;
  total_belum_lengkap: number;
}

const UmkmList: React.FC = () => {
  const [list, setList] = useState<UmkmItem[]>([]);
  const [summary, setSummary] = useState<UmkmSummary | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 100;

  useEffect(() => {
    fetchSummary();
    fetchTable(1);
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axiosInstance.get("/dashboard/umkm-summary");
      if (res.data.success) setSummary(res.data.data);
    } catch (err) {
      console.error("❌ Gagal ambil summary:", err);
    }
  };

  const fetchTable = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/dashboard/umkm-list?page=${pageNum}&limit=${limit}`
      );
      if (res.data.success) {
        setList(res.data.data);
        setPage(pageNum);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      console.error("❌ Gagal ambil data UMKM:", err);
    } finally {
      setLoading(false);
    }
  };

  // ⚠️ Kalau data kosong/null → tampilkan ikon kuning
  const renderValue = (val: any) => {
    if (!val || val === "null" || val === "") {
      return (
        <span className="flex items-center justify-center gap-1 text-yellow-600 font-medium">
          <AlertTriangle size={15} />
          <span className="text-gray-600 text-sm italic">Kosong</span>
        </span>
      );
    }
    return <span className="text-gray-800">{val}</span>;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
        🏪 Data UMKM Kabupaten Karawang
      </h1>

      {/* === 📊 RINGKASAN === */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6 text-center">
          <div className="bg-blue-100 p-3 rounded-lg">
            <p className="text-sm text-gray-600 font-medium">Total UMKM</p>
            <p className="text-2xl font-bold text-blue-700">
              {summary.total_umkm.toLocaleString()}
            </p>
          </div>
          <div className="bg-orange-100 p-3 rounded-lg">
            <p className="text-sm text-gray-600 font-medium">Total Duplikat</p>
            <p className="text-2xl font-bold text-orange-700">
              {summary.total_duplikat.toLocaleString()}
            </p>
          </div>
          <div className="bg-red-100 p-3 rounded-lg">
            <p className="text-sm text-gray-600 font-medium">Data Belum Lengkap</p>
            <p className="text-2xl font-bold text-red-700">
              {summary.total_belum_lengkap.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* === 📋 TABEL DATA === */}
      {loading ? (
        <p className="text-center text-gray-500">Memuat data UMKM...</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
          <table className="min-w-full border-collapse text-sm text-gray-800">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-2 border text-center font-semibold">No</th>
                <th className="p-2 border text-left font-semibold">Nama</th>
                <th className="p-2 border text-center font-semibold">Jenis Kelamin</th>
                <th className="p-2 border text-left font-semibold">Nama Usaha</th>
                <th className="p-2 border text-left font-semibold">Alamat</th>
                <th className="p-2 border text-center font-semibold">Kecamatan</th>
                <th className="p-2 border text-center font-semibold">Desa</th>
                <th className="p-2 border text-center font-semibold">Longitude</th>
                <th className="p-2 border text-center font-semibold">Latitude</th>
                <th className="p-2 border text-center font-semibold">Jenis UKM</th>
                <th className="p-2 border text-center font-semibold">NIB</th>
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
                  <td className="p-2 border text-center">{renderValue(item.jenis_kelamin)}</td>
                  <td className="p-2 border">{renderValue(item.nama_usaha)}</td>
                  <td className="p-2 border">{renderValue(item.alamat)}</td>
                  <td className="p-2 border text-center">{renderValue(item.kecamatan)}</td>
                  <td className="p-2 border text-center">{renderValue(item.desa)}</td>
                  <td className="p-2 border text-center">{renderValue(item.longitude)}</td>
                  <td className="p-2 border text-center">{renderValue(item.latitude)}</td>
                  <td className="p-2 border text-center">{renderValue(item.jenis_ukm)}</td>
                  <td className="p-2 border text-center">{renderValue(item.nib)}</td>
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
};

export default UmkmList;
