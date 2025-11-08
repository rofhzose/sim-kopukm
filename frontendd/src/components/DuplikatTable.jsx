import React from "react";

export default function DuplikatTable({ data }) {
  if (!data || data.length === 0)
    return <p className="text-gray-500 text-center mt-10">Tidak ada data duplikat ditemukan.</p>;

  return (
    <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
      <table className="min-w-full bg-white">
        <thead className="bg-orange-600 text-white">
          <tr>
            <th className="px-4 py-2 text-left">No</th>
            <th className="px-4 py-2 text-left">Nama</th>
            <th className="px-4 py-2 text-left">Nama Usaha</th>
            <th className="px-4 py-2 text-left">Kecamatan</th>
            <th className="px-4 py-2 text-left">Desa</th>
            <th className="px-4 py-2 text-left">Jenis UKM</th>
            <th className="px-4 py-2 text-left">NIB</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr
              key={item.id}
              className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
            >
              <td className="px-4 py-2">{i + 1}</td>
              <td className="px-4 py-2">{item.nama}</td>
              <td className="px-4 py-2">{item.nama_usaha}</td>
              <td className="px-4 py-2">{item.kecamatan}</td>
              <td className="px-4 py-2">{item.desa}</td>
              <td className="px-4 py-2">{item.jenis_ukm}</td>
              <td className="px-4 py-2">{item.nib}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
