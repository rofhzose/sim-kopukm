import React from "react";
import { AlertTriangle } from "lucide-react";

export default function DuplikatTable({ data, page = 1, limit = 50 }) {
  if (!data || data.length === 0)
    return (
      <div className="py-20 text-center text-gray-500 font-medium">
        Tidak ada data duplikat ditemukan.
      </div>
    );

  // *** GROUPING DATA ***
  const grouped = {};
  data.forEach((item) => {
    const key = [
      item.nama,
      item.nama_usaha,
      item.kecamatan,
      item.desa,
      item.jenis_ukm,
      item.nib
    ].join("|");

    if (!grouped[key]) grouped[key] = { ...item, total: 0 };
    grouped[key].total += 1;
  });

  // *** SORT BERDASARKAN TOTAL TERBANYAK ***
  const finalData = Object.values(grouped).sort((a, b) => b.total - a.total);

  // Render nilai kosong
  const renderValue = (value) =>
    !value || value === "0" || value === "NULL" ? (
      <div className="flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-red-200 rounded-lg animate-ping opacity-75"></div>
          <div className="relative bg-red-100 p-2 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
        </div>
      </div>
    ) : (
      <span className="text-gray-700 font-medium">{value}</span>
    );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">

            {/* HEADER */}
            <thead className="sticky top-0 z-20">
              <tr className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white">
                <th className="px-6 py-5 text-left font-bold text-sm uppercase sticky left-0 bg-orange-600 z-30">No</th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase">Nama</th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase">Nama Usaha</th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase">Kecamatan</th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase">Desa</th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase">Jenis UKM</th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase">NIB</th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase">Total</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="divide-y divide-gray-200">
              {finalData.map((item, i) => {
                const number = (page - 1) * limit + i + 1;

                return (
                  <tr key={i} className="hover:bg-orange-50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-orange-600 sticky left-0 bg-white group-hover:bg-orange-50">
                      {number}
                    </td>

                    <td className="px-6 py-4">{renderValue(item.nama)}</td>
                    <td className="px-6 py-4">{renderValue(item.nama_usaha)}</td>
                    <td className="px-6 py-4">{renderValue(item.kecamatan)}</td>
                    <td className="px-6 py-4">{renderValue(item.desa)}</td>
                    <td className="px-6 py-4">{renderValue(item.jenis_ukm)}</td>
                    <td className="px-6 py-4 font-mono">{renderValue(item.nib)}</td>

                    {/* TOTAL DUPLIKASI */}
                    <td className="px-6 py-4 font-bold text-red-600 text-center">
                      {item.total}
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      </div>

      {/* LEGEND */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 shadow-lg border-2 border-red-200">
        <div className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-red-200 rounded-lg animate-ping opacity-75"></div>
            <div className="relative bg-red-100 p-2 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800 mb-1">Data Belum Terisi</p>
            <p className="text-xs text-gray-600">Kolom kosong akan ditandai merah.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
