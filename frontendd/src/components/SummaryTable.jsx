import React, { useRef, useEffect } from "react";
import { AlertTriangle, Trash2, Loader2  } from "lucide-react";

export default function TableUMKM({ data, page, limit, deletingId, onDelete, openEditModal }) {
  const tableRef = useRef(null);
  const fakeScrollRef = useRef(null);

  // === Sinkronisasi scroll ===
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

  // === Handle no data ===
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl border border-gray-200">
        <div className="bg-white p-8 rounded-full mb-6 shadow-lg">
          <AlertTriangle className="w-20 h-20 text-gray-400" />
        </div>
        <p className="text-2xl font-bold text-gray-700">Data UMKM tidak ditemukan</p>
        <p className="text-sm text-gray-500 mt-3">Belum ada data yang tersedia.</p>
      </div>
    );
  }

  // === Gunakan pagination server ===
  const serverPage = page ?? 1;
  const serverLimit = limit ?? 100;

  // === Render cell kosong ===
  const renderValue = (value) =>
    value === null || value === "" || value === "0" ? (
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
    <div className="space-y-6 relative pb-10">

      {/* TABLE WRAPPER */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div
          ref={tableRef}
          className="overflow-x-auto"
          style={{ maxHeight: "100vh" }}
        >
          <table className="min-w-full">
           <thead className="sticky top-0 z-20">
  <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
    <th className="px-6 py-5 text-left font-bold text-sm uppercase sticky left-0 bg-blue-600 z-30">
      No
    </th>
    <th className="px-6 py-5 text-left font-bold text-sm uppercase bg-blue-600">Nama</th>
    <th className="px-6 py-5 text-left font-bold text-sm uppercase bg-blue-600">Jenis Kelamin</th>
    <th className="px-6 py-5 text-left font-bold text-sm uppercase bg-blue-600">Nama Usaha</th>
    <th className="px-6 py-5 text-left font-bold text-sm uppercase bg-blue-600">Alamat</th>
    <th className="px-6 py-5 text-left font-bold text-sm uppercase bg-blue-600">Kecamatan</th>
    <th className="px-6 py-5 text-left font-bold text-sm uppercase bg-blue-600">Desa</th>
    <th className="px-6 py-5 text-left font-bold text-sm uppercase bg-blue-600">Longitude</th>
    <th className="px-6 py-5 text-left font-bold text-sm uppercase bg-blue-600">Latitude</th>
    <th className="px-6 py-5 text-left font-bold text-sm uppercase bg-blue-600">Lokasi</th>
    <th className="px-6 py-5 text-left font-bold text-sm uppercase bg-blue-600">Jenis UKM</th>
    <th className="px-6 py-5 text-left font-bold text-sm uppercase bg-blue-600">NIB</th>
    <th className="px-6 py-5 text-left font-bold text-sm uppercase bg-blue-600">Aksi</th>
  </tr>
</thead>


            <tbody className="divide-y divide-gray-200">
              {data.map((item, i) => {
                
                // === Nomor baris berdasarkan SERVER ===
                const rowNumber = (serverPage - 1) * serverLimit + i + 1;

                return (
                  <tr key={item.id} className="hover:bg-blue-50 group">
                    <td className="px-6 py-4 font-bold text-blue-600 sticky left-0 bg-white group-hover:bg-blue-50">
                      {rowNumber}
                    </td>

                    <td className="px-6 py-4">{renderValue(item.nama)}</td>

                    <td className="px-6 py-4">
                      {item.jenis_kelamin ? (
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                            item.jenis_kelamin.toLowerCase().startsWith("l")
                              ? "bg-blue-100 text-blue-700"
                              : "bg-pink-100 text-pink-700"
                          }`}
                        >
                          {item.jenis_kelamin}
                        </span>
                      ) : (
                        renderValue(item.jenis_kelamin)
                      )}
                    </td>

                    <td className="px-6 py-4">{renderValue(item.nama_usaha)}</td>

                    <td className="px-6 py-4 max-w-xs truncate" title={item.alamat}>
                      {renderValue(item.alamat)}
                    </td>

                    <td className="px-6 py-4">{renderValue(item.kecamatan)}</td>

                    <td className="px-6 py-4">{renderValue(item.desa)}</td>

                    <td className="px-6 py-4 font-mono">{renderValue(item.longitude)}</td>

                    <td className="px-6 py-4 font-mono">{renderValue(item.latitude)}</td>

                    <td className="px-6 py-4">
  <a
    href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200 transition"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M12 11a2 2 0 100-4 2 2 0 000 4zm0 0c-2.21 0-4 1.79-4 4v6h8v-6c0-2.21-1.79-4-4-4z"
      />
    </svg>
    Maps
  </a>
</td>

                    <td className="px-6 py-4">{renderValue(item.jenis_ukm)}</td>

                    <td className="px-6 py-4 font-mono">{renderValue(item.nib)}</td>

                    <td className="px-6 py-4">
  <div className="flex gap-2">

<button
  onClick={() => openEditModal(item.id)}  // Ganti ini!
  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold rounded-lg transition"
>
  Edit
</button>

<button
      onClick={() => onDelete(item.id, item.nama || item.nama_usaha || "Data UMKM")}
      disabled={deletingId === item.id}
      className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
        deletingId === item.id
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-red-600 hover:bg-red-700 text-white"
      }`}
    >
      {deletingId === item.id ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Menghapus...
        </>
      ) : (
        <>
          <Trash2 className="w-4 h-4" />
          Delete
        </>
      )}
    </button>

  </div>
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

      {/* SCROLL PALSU DI BAWAH LAYAR */}
      <div
        ref={fakeScrollRef}
        className="fixed bottom-0 left-0 right-0 h-6 overflow-x-auto bg-white border-t z-50"
      >
        <div className="w-[2000px]"></div>
      </div>

    </div>
  );
}
