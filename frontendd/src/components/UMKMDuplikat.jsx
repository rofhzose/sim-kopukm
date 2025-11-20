// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axiosInstance from "../utils/axiosInstance";
// import { AlertCircle, Users, FileText, Building2, TrendingUp, Activity } from "lucide-react";

// export default function UMKMDuplikatSummary() {
//   const [data, setData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await axiosInstance.get("/dashboard/umkm-duplikat-summary");
//         if (res.data.success) {
//           setData(res.data.data.indikasi || {});
//         } else {
//           setError("Gagal memuat data duplikat UMKM.");
//         }
//       } catch (err) {
//         console.error("Error fetch UMKM duplikat:", err);
//         setError("Tidak dapat terhubung ke API duplikat UMKM.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

// const buttonColors = {
//   "border-red-600": "bg-red-700",
//   "border-orange-600": "bg-orange-700",
//   "border-blue-600": "bg-blue-700",
// };


//   // ===========================
//   // LOADING STATE
//   // ===========================
//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-96">
//         <div className="relative">
//           <div className="w-20 h-20 border-4 border-orange-100 rounded-full"></div>
//           <div className="w-20 h-20 border-4 border-orange-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
//         </div>
//         <p className="mt-4 text-gray-600 font-semibold">Memuat data duplikat UMKM...</p>
//       </div>
//     );
//   }

//   // ===========================
//   // ERROR STATE
//   // ===========================
//   if (error) {
//     return (
//       <div className="bg-red-50 border-2 border-red-500 p-6 rounded-xl">
//         <div className="flex items-center gap-3">
//           <AlertCircle className="w-6 h-6 text-red-600" />
//           <p className="text-red-600 font-semibold">{error}</p>
//         </div>
//       </div>
//     );
//   }

  

//   const renderCard = (title, info = {}, type, Icon, color) => (
    
//     <div
    
//       key={type}
//       className={`bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 ${color}`}
//     >
//       {/* Header Card */}
//       <div className="flex items-center gap-3 mb-4">
//         <div className={`${color.replace('border-', 'bg-').replace('600', '100')} p-3 rounded-lg`}>
//           <Icon className={`w-6 h-6 ${color.replace('border-', 'text-')}`} />
//         </div>
//         <div className="flex-1">
//           <h2 className="text-lg font-bold text-gray-800">{title}</h2>
//         </div>
//       </div>

//       {/* Keterangan */}
//       <p className="text-sm text-gray-600 mb-6 leading-relaxed">
//         {info.keterangan || "-"}
//       </p>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-2 gap-4 mb-6">
//         <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
//           <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
//             Usaha Terindikasi Duplikat
//           </p>
//           <p className="text-3xl font-bold text-orange-600">
//             {Number(info.total_duplikat_group || 0).toLocaleString("id-ID")}
//           </p>
//         </div>

//         <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
//           <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
//             Total Data
//           </p>
//           <p className="text-3xl font-bold text-red-600">
//             {Number(info.total_record_duplikat || 0).toLocaleString("id-ID")}
//           </p>
//         </div>
//       </div>

//       {/* Button */}
// <button
//   onClick={() => navigate(`/duplikat?type=${type}`)}
//   className={`w-full py-3 ${buttonColors[color]} text-white text-sm font-bold rounded-lg hover:opacity-90 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
// >
//   <Activity className="w-4 h-4" />
//   Lihat Detail
// </button>


//     </div>
//   );

//   return (
//     <div className=" bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
        
//         {/* HEADER */}
//         <div className="mb-8 bg-white rounded-xl p-6 shadow-md border border-gray-200">
//           <div className="flex items-center gap-3">
//             <div className="bg-orange-600 p-3 rounded-xl">
//               <AlertCircle className="w-8 h-8 text-white" />
//             </div>
//             <div>
//               <h1 className="text-3xl font-bold text-gray-800">
//                 Indikasi Duplikasi Data UMKM
//               </h1>
//               <p className="text-gray-600 text-sm mt-1">
//                 Ringkasan data yang terindikasi duplikat berdasarkan kategori
//               </p>
//             </div>
//             <div className="ml-auto flex items-center gap-3">
//               <button
//                 onClick={() => window.location.reload()}
//                 className="px-3 py-2 bg-slate-100 rounded-md border text-sm hover:bg-slate-200"
//               >
//                 Refresh
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* CARDS GRID */}
//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//        {renderCard(
//   "Kombinasi Nama + Usaha + Wilayah",
//   data.kombinasi_nama_usaha_wilayah,
//   "kombinasi",
//   Users,
//   "border-orange-600"
// )}

// {renderCard(
//   "Nama Saja",
//   data.nama_saja,
//   "nama",
//   FileText,
//   "border-orange-600"
// )}

// {renderCard(
//   "Nama Usaha Saja",
//   data.nama_usaha_saja,
//   "usaha",
//   Building2,
//   "border-orange-600"
// )}

//         </div>

//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { AlertCircle, Users, FileText, Building2, TrendingUp, Activity } from "lucide-react";

export default function UMKMDuplikatSummary() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get("/dashboard/umkm-duplikat-summary");
        if (res.data.success) {
          setData(res.data.data.indikasi || {});
        } else {
          setError("Gagal memuat data duplikat UMKM.");
        }
      } catch (err) {
        console.error("Error fetch UMKM duplikat:", err);
        setError("Tidak dapat terhubung ke API duplikat UMKM.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

const buttonColors = {
  "border-red-600": "bg-red-700",
  "border-orange-600": "bg-orange-700",
  "border-blue-600": "bg-blue-700",
};


  // ===========================
  // LOADING STATE
  // ===========================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-orange-100 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-orange-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
        </div>
        <p className="mt-4 text-gray-600 font-semibold">Memuat data duplikat UMKM...</p>
      </div>
    );
  }

  // ===========================
  // ERROR STATE
  // ===========================
  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-500 p-6 rounded-xl">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  

  const renderCard = (title, info = {}, type, Icon, color) => (
    
    <div
    
      key={type}
      className={`bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 ${color}`}
    >
      {/* Header Card */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`${color.replace('border-', 'bg-').replace('600', '100')} p-3 rounded-lg`}>
          <Icon className={`w-6 h-6 ${color.replace('border-', 'text-')}`} />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        </div>
      </div>

      {/* Keterangan */}
      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
        {info.keterangan || "-"}
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Usaha Terindikasi Duplikat
          </p>
          <p className="text-3xl font-bold text-orange-600">
            {Number(info.total_duplikat_group || 0).toLocaleString("id-ID")}
          </p>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Total Data
          </p>
          <p className="text-3xl font-bold text-red-600">
            {Number(info.total_record_duplikat || 0).toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Button */}
<button
  onClick={() => navigate(`/duplikat?type=${type}`)}
  className={`w-full py-3 ${buttonColors[color]} text-white text-sm font-bold rounded-lg hover:opacity-90 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
>
  <Activity className="w-4 h-4" />
  Lihat Detail
</button>


    </div>
  );

  return (
    <div className=" bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8 bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-3 rounded-xl">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Indikasi Duplikasi Data UMKM
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Ringkasan data yang terindikasi duplikat berdasarkan kategori
              </p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-2 bg-slate-100 rounded-md border text-sm hover:bg-slate-200"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
       {renderCard(
  "Kombinasi Nama + Usaha + Wilayah",
  data.kombinasi_nama_usaha_wilayah,
  "kombinasi",
  Users,
  "border-orange-600"
)}

{renderCard(
  "Nama Saja",
  data.nama_saja,
  "nama",
  FileText,
  "border-orange-600"
)}
{/* 
{renderCard(
  "Nama Usaha Saja",
  data.nama_usaha_saja,
  "usaha",
  Building2,
  "border-orange-600"
)} */}

        </div>

      </div>
    </div>
  );
}