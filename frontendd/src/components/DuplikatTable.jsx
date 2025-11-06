import React from "react";

export default function DuplikatTable({ data }) {
  if (!data || data.length === 0)
    return (
      <p className="text-gray-500 text-center mt-6">
        ⚙️ Tidak ada data duplikat ditemukan.
      </p>
    );

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-100">
      <table className="min-w-full table-auto">
        <thead className="bg-orange-100 text-gray-700 uppercase text-sm">
          <tr>
            <th className="px-4 py-3 text-left">#</th>
            <th className="px-4 py-3 text-left">Nama</th>
            <th className="px-4 py-3 text-left">Nama Usaha</th>
            <th className="px-4 py-3 text-left">Kecamatan</th>
            <th className="px-4 py-3 text-left">Desa</th>
            <th className="px-4 py-3 text-left">Jenis UKM</th>
            <th className="px-4 py-3 text-left">NIB</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={item.id}
              className={`border-b hover:bg-orange-50 ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <td className="px-4 py-3 text-gray-700 text-sm">{index + 1}</td>
              <td className="px-4 py-3 font-semibold text-gray-800">
                {item.nama}
              </td>
              <td className="px-4 py-3 text-gray-700">{item.nama_usaha}</td>
              <td className="px-4 py-3 text-gray-600">{item.kecamatan}</td>
              <td className="px-4 py-3 text-gray-600">{item.desa}</td>
              <td className="px-4 py-3 text-gray-600">{item.jenis_ukm}</td>
              <td className="px-4 py-3 text-gray-600">{item.nib}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
