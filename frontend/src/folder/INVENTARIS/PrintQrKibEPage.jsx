import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import axiosInstance from "@/utils/axiosInstance";
import { Loader2, Box, Calendar } from "lucide-react";

export default function PrintQrKibEPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get("/kib-e");
        setData(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && data.length > 0) {
      setTimeout(() => {
        window.print();
      }, 1000);
    }
  }, [loading, data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-white p-8 min-h-screen print:p-0">
      <div className="grid grid-cols-4 gap-4 print:grid-cols-4 print:gap-4">
        {data.map((item) => (
          <div key={item.id} className="border-2 border-black rounded-lg p-3 flex flex-col items-center justify-between text-center page-break-inside-avoid h-[320px] relative">
            
            <div className="w-full border-b-2 border-black pb-2 mb-2">
               <h3 className="text-[10px] font-black text-black uppercase tracking-wider">
                 LABEL INVENTARIS KIB-E
               </h3>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <QRCodeCanvas
                value={`${window.location.origin}/verifikasi-aset-e/${item.id}`}
                size={140}
                level={"H"}
              />
            </div>

            <div className="w-full mt-2">
               <p className="text-sm font-black text-black leading-tight tracking-wider">
                 {item.kode_barang}
               </p>
               <p className="text-xs font-bold text-black mt-1 line-clamp-2 leading-tight">
                 {item.nama_barang}
               </p>
            </div>

            <div className="w-full mt-3 pt-2 border-t border-dashed border-slate-400">
               <div className="flex flex-col gap-1 items-center justify-center">
                 <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase">
                    <Box size={10} />
                    <span className="truncate max-w-[120px]">Reg: {item.nomor_register || "-"}</span>
                 </div>
                 <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500">
                    <Calendar size={10} />
                    <span>Thn: {item.tahun_perolehan}</span>
                 </div>
               </div>
            </div>

          </div>
        ))}
      </div>

      <style>{`
        @media print {
          @page {
            margin: 10mm;
            size: auto;
          }
          body {
            background: white;
            -webkit-print-color-adjust: exact;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
