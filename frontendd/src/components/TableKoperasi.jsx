import React, { useRef, useEffect } from "react";
import { AlertTriangle } from "lucide-react";

/**
 * TableKoperasi
 * Props:
 *   - data: array of rows
 *   - page, limit: server-side pagination numbers (for row numbering)
 */
export default function TableKoperasi({ data, page, limit }) {
  const tableRef = useRef(null);
  const fakeScrollRef = useRef(null);

  useEffect(() => {
    const tableContainer = tableRef.current;
    const fakeScroll = fakeScrollRef.current;
    if (!tableContainer || !fakeScroll) return;

    const syncScroll = () => (fakeScroll.scrollLeft = tableContainer.scrollLeft);
    const syncFake = () => (tableContainer.scrollLeft = fakeScroll.scrollLeft);

    tableContainer.addEventListener("scroll", syncScroll);
    fakeScroll.addEventListener("scroll", syncFake);

    return () => {
      tableContainer.removeEventListener("scroll", syncScroll);
      fakeScroll.removeEventListener("scroll", syncFake);
    };
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl border border-gray-200">
        <div className="bg-white p-8 rounded-full mb-6 shadow-lg">
          <AlertTriangle className="w-20 h-20 text-gray-400" />
        </div>
        <p className="text-2xl font-bold text-gray-700">Data Koperasi tidak ditemukan</p>
        <p className="text-sm text-gray-500 mt-3">Belum ada data yang tersedia.</p>
      </div>
    );
  }

  const serverPage = page ?? 1;
  const serverLimit = limit ?? 100;

  const renderValue = (value) =>
    value === null || value === undefined || value === "" || value === "0" ? (
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

  // columns based on your Excel mapping — adjust if backend fields differ
  const columns = [
    { key: "nomor_induk_koperasi", label: "NIK" },
    { key: "nama_koperasi", label: "Nama Koperasi" },
    { key: "jenis_koperasi", label: "Jenis" },
    { key: "bentuk_koperasi", label: "Bentuk" },
    { key: "kelurahan", label: "Kelurahan/Desa" },
    { key: "kecamatan", label: "Kecamatan" },
    { key: "kelompok_koperasi", label: "Kelompok" },
    { key: "status_koperasi", label: "Status" },
    { key: "alamat_lengkap", label: "Alamat" },
    { key: "kode_pos", label: "Kode Pos" },
    { key: "email_koperasi", label: "Email" },
    { key: "kuk", label: "KUK" },
    { key: "rade_koperasi", label: "Grade" }, // typo kolom handled earlier
  ];

  return (
    <div className="space-y-6 relative pb-10">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div ref={tableRef} className="overflow-x-auto" style={{ maxHeight: "70vh" }}>
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <th className="px-6 py-5 text-left font-bold text-sm uppercase sticky left-0 bg-blue-600">No</th>
                {columns.map((c) => (
                  <th key={c.key} className="px-6 py-5 text-left font-bold text-sm uppercase">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {data.map((item, i) => {
                const rowNumber = (serverPage - 1) * serverLimit + i + 1;
                return (
                  <tr key={item.id ?? item.nomor_induk_koperasi ?? rowNumber} className="hover:bg-blue-50 group">
                    <td className="px-6 py-4 font-bold text-blue-600 sticky left-0 bg-white group-hover:bg-blue-50">
                      {rowNumber}
                    </td>

                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className={`px-6 py-4 ${c.key.includes("kode") || c.key.includes("nomor") ? "font-mono" : ""} ${
                          c.key === "alamat_lengkap" ? "max-w-xs truncate" : ""
                        }`}
                        title={String(item[c.key] ?? "")}
                      >
                        {renderValue(item[c.key])}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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

      <div ref={fakeScrollRef} className="fixed bottom-0 left-0 right-0 h-6 overflow-x-auto bg-white border-t z-50">
        <div className="w-[2200px]"></div>
      </div>
    </div>
  );
}
