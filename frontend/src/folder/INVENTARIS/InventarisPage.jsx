import React from "react";
import { 
  Truck, 
  Book, 
  Construction, 
  ArrowRight, 
  ShieldCheck, 
  QrCode,
  LayoutDashboard,
  Search
} from "lucide-react";

const MenuCard = ({ title, description, icon: Icon, path, colorClass, comingSoon, onScan }) => (
  <div className={`group relative bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center gap-6 transition-all duration-500 ${comingSoon ? 'opacity-70 grayscale cursor-not-allowed' : 'hover:shadow-2xl hover:shadow-blue-100 hover:-translate-y-2'}`}>
    {comingSoon && (
      <div className="absolute top-6 right-6 bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200 z-10">
        Coming Soon
      </div>
    )}
    
    <div className={`p-6 rounded-[2rem] ${colorClass} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
      <Icon size={40} />
    </div>

    <div className="space-y-2">
      <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">{title}</h3>
      <p className="text-sm text-slate-400 font-bold leading-relaxed px-4">{description}</p>
    </div>

    {!comingSoon && (
      <div className="flex flex-col w-full gap-3 mt-2">
        <button 
          onClick={() => (window.location.href = path)}
          className="w-full py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
        >
          Lihat Tabel Data <ArrowRight size={14} />
        </button>

        {/* TOMBOL SCAN DI DALAM KARTU */}
        <button 
          onClick={onScan}
          className="w-full py-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
        >
          <QrCode size={14} /> Scan QR Asset
        </button>
      </div>
    )}
  </div>
);

export default function InventarisPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* --- HEADER NAVIGASI (TOMBOL BARU DI SINI) --- */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-[100] shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-black text-slate-800 uppercase tracking-tighter">
            <LayoutDashboard className="text-blue-600" /> Asset Control
          </div>

          <div className="flex gap-2">
            {/* TOMBOL AKSES CEPAT HASIL SCAN */}
            <button 
              onClick={() => window.location.href = '/hasilscanb'}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
            >
              <Search size={14} /> Cek Scan KIB B
            </button>

            <button 
              onClick={() => window.location.href = '/hasilscanqre'}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200"
            >
              <Search size={14} /> Cek Scan KIB E
            </button>
          </div>
        </div>
      </nav>

      <div className="p-8 flex flex-col items-center justify-center space-y-12">
        {/* HERO SECTION */}
        <div className="text-center space-y-4 max-w-2xl mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-[0.2em] border border-blue-100 mb-2">
            <ShieldCheck size={16} /> Asset Management System
          </div>
          <h1 className="text-5xl font-black text-slate-800 tracking-tighter uppercase">Barang Inventaris</h1>
          <p className="text-slate-500 font-bold text-lg leading-relaxed">Kelola data aset tetap dinas secara terstruktur.</p>
        </div>

        {/* GRID UTAMA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl pb-20">
          <MenuCard 
            title="KIB A"
            description="Tanah dan Bangunan Milik Pemerintah Daerah"
            icon={Construction}
            path="#"
            colorClass="bg-rose-50 text-rose-500"
            comingSoon={true}
          />

          <MenuCard 
            title="KIB B"
            description="Peralatan dan Mesin (Kendaraan, Alat Kantor)"
            icon={Truck}
            path="/dokumen/kib-b"
            colorClass="bg-blue-50 text-blue-500"
            onScan={() => window.location.href = '/hasilscanb'}
          />

          <MenuCard 
            title="KIB E"
            description="Aset Tetap Lainnya (Buku, Kesenian, Kebudayaan)"
            icon={Book}
            path="/dokumen/kib-e"
            colorClass="bg-emerald-50 text-emerald-500"
            onScan={() => window.location.href = '/hasilscanqre'}
          />
        </div>
      </div>
    </div>
  );
}