import React from "react";

/**
 * Props:
 *  - data: array of { nomor_induk_koperasi, jumlah_duplikat }
 *  - onViewDetails: function(nik) -> open details
 */
export default function DuplikatTableKoperasi({ data = [], onViewDetails = () => {} }) {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-10">Tidak ada data duplikat.</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-md border p-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-3 text-left font-medium">No</th>
            <th className="p-3 text-left font-medium">NIK</th>
            <th className="p-3 text-left font-medium">Jumlah Duplikat</th>
            <th className="p-3 text-left font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={r.nomor_induk_koperasi ?? i} className="border-b hover:bg-gray-50">
              <td className="p-3 align-top">{i + 1}</td>
              <td className="p-3 font-mono">{r.nomor_induk_koperasi || "—"}</td>
              <td className="p-3">{r.jumlah_duplikat ?? r.jumlah ?? r.count ?? 0}</td>
              <td className="p-3">
                <button
                  onClick={() => onViewDetails(r.nomor_induk_koperasi)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  Lihat Detail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
