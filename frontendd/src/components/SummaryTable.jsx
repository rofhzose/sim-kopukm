import React from "react";
import { AlertTriangle } from "lucide-react";

export default function TableUMKM({ data }) {
  if (!data || data.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-10">
        Data UMKM tidak ditemukan.
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
            <th className="px-4 py-2 text-left">Jenis Kelamin</th>
            <th className="px-4 py-2 text-left">Nama Usaha</th>
            <th className="px-4 py-2 text-left">Alamat</th>
            <th className="px-4 py-2 text-left">Kecamatan</th>
            <th className="px-4 py-2 text-left">Desa</th>
            <th className="px-4 py-2 text-left">Longitude</th>
            <th className="px-4 py-2 text-left">Latitude</th>
            <th className="px-4 py-2 text-left">Jenis UKM</th>
            <th className="px-4 py-2 text-left">NIB</th>
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
              <td className="px-4 py-2">{renderValue(item.jenis_kelamin)}</td>
              <td className="px-4 py-2">{renderValue(item.nama_usaha)}</td>
              <td className="px-4 py-2">{renderValue(item.alamat)}</td>
              <td className="px-4 py-2">{renderValue(item.kecamatan)}</td>
              <td className="px-4 py-2">{renderValue(item.desa)}</td>
              <td className="px-4 py-2">{renderValue(item.longitude)}</td>
              <td className="px-4 py-2">{renderValue(item.latitude)}</td>
              <td className="px-4 py-2">{renderValue(item.jenis_ukm)}</td>
              <td className="px-4 py-2">{renderValue(item.nib)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
