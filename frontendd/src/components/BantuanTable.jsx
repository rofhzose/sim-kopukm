import React from "react";
import { AlertTriangle } from "lucide-react";

export default function TableBantuan({ data }) {
  if (!data || data.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-10">
        Data bantuan tidak ditemukan.
      </p>
    );
  }

  const renderValue = (value) =>
    value === null || value === 0 || value === "0" || value === "" ? (
      <div className="flex items-center justify-center text-yellow-500">
        <AlertTriangle size={18} />
      </div>
    ) : (
      value
    );

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full border border-gray-200 rounded-lg bg-white shadow">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="px-4 py-2 text-left">No</th>
            <th className="px-4 py-2 text-left">Nama</th>
            <th className="px-4 py-2 text-left">NIK</th>
            <th className="px-4 py-2 text-left">Nama Produk</th>
            <th className="px-4 py-2 text-left">Nama UMKM</th>
            <th className="px-4 py-2 text-left">Alamat</th>
            <th className="px-4 py-2 text-left">Kecamatan</th>
            <th className="px-4 py-2 text-left">No. HP</th>
            <th className="px-4 py-2 text-left">NIB</th>
            <th className="px-4 py-2 text-left">No. PIRT</th>
            <th className="px-4 py-2 text-left">No. Halal</th>
            <th className="px-4 py-2 text-left">Jenis Alat Bantu</th>
            <th className="px-4 py-2 text-left">Tahun</th>
            <th className="px-4 py-2 text-left">Keterangan</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, i) => (
            <tr
              key={item.id}
              className="border-b hover:bg-blue-50 transition-colors"
            >
              <td className="px-4 py-2">{i + 1}</td>
              <td className="px-4 py-2">{renderValue(item.nama)}</td>
              <td className="px-4 py-2">{renderValue(item.nik)}</td>
              <td className="px-4 py-2">{renderValue(item.nama_produk)}</td>
              <td className="px-4 py-2">{renderValue(item.nama_umkm)}</td>
              <td className="px-4 py-2">{renderValue(item.alamat)}</td>
              <td className="px-4 py-2">{renderValue(item.kecamatan)}</td>
              <td className="px-4 py-2">{renderValue(item.no_hp)}</td>
              <td className="px-4 py-2">{renderValue(item.nib)}</td>
              <td className="px-4 py-2">{renderValue(item.no_pirt)}</td>
              <td className="px-4 py-2">{renderValue(item.no_halal)}</td>
              <td className="px-4 py-2">{renderValue(item.jenis_alat_bantu)}</td>
              <td className="px-4 py-2">{renderValue(item.tahun)}</td>
              <td className="px-4 py-2">{renderValue(item.keterangan)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
