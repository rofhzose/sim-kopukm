import React from "react";
import { AlertTriangle } from "lucide-react";

export default function TableBantuan({ data, page, limit }) {

  // Render nilai kosong → ikon + ping animasi
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
    <div className="space-y-6 pb-6">

      {/* TABEL */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            
            {/* HEADER */}
            <thead className="sticky top-0 z-20">
              <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <th className="px-6 py-5 text-left font-bold text-sm uppercase sticky left-0 bg-blue-600 z-30">
                  No
                </th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase">Nama</th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase">NIK</th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase">Nama Produk</th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase">Nama UMKM</th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase">Alamat</th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase">Kecamatan</th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase">No HP</th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase">NIB</th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase">No PIRT</th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase">No Halal</th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase">Jenis Bantuan</th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase">Tahun</th>
                <th className="px-6 py-5 text-left font-bold text-sm uppercase">Keterangan</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="divide-y divide-gray-200">
              {data.map((item, i) => (
                <tr
                  key={item.id}
                  className="hover:bg-blue-50 transition-colors group"
                >
                  <td className="px-6 py-4 font-bold text-blue-600 sticky left-0 bg-white group-hover:bg-blue-50">
                    {(page - 1) * limit + i + 1}
                  </td>

                  <td className="px-6 py-4">{renderValue(item.nama)}</td>
                  <td className="px-6 py-4">{renderValue(item.nik)}</td>
                  <td className="px-6 py-4">{renderValue(item.nama_produk)}</td>
                  <td className="px-6 py-4">{renderValue(item.nama_umkm)}</td>
                  <td className="px-6 py-4 max-w-xs truncate" title={item.alamat}>
                    {renderValue(item.alamat)}
                  </td>
                  <td className="px-6 py-4">{renderValue(item.kecamatan)}</td>
                  <td className="px-6 py-4">{renderValue(item.no_hp)}</td>
                  <td className="px-6 py-4">{renderValue(item.nib)}</td>
                  <td className="px-6 py-4">{renderValue(item.no_pirt)}</td>
                  <td className="px-6 py-4">{renderValue(item.no_halal)}</td>
                  <td className="px-6 py-4">{renderValue(item.jenis_alat_bantu)}</td>
                  <td className="px-6 py-4">{renderValue(item.tahun)}</td>
                  <td className="px-6 py-4">{renderValue(item.keterangan)}</td>
                </tr>
              ))}
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
