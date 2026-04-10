import React from "react";
import { Package, Truck, Book, Construction, ArrowRight, ShieldCheck } from "lucide-react";

const MenuCard = ({ title, description, icon: Icon, path, colorClass, comingSoon }) => (
  <div 
    onClick={() => !comingSoon && (window.location.href = path)}
    className={`group relative bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center gap-6 transition-all duration-500 ${comingSoon ? 'opacity-70 grayscale cursor-not-allowed' : 'hover:shadow-2xl hover:shadow-blue-100 hover:-translate-y-2 cursor-pointer'}`}
  >
    {comingSoon && (
      <div className="absolute top-6 right-6 bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200 z-10">
        Coming Soon
      </div>
    )}
    
    <div className={`p-6 rounded-[2rem] ${colorClass} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
      <Icon size={40} className="transition-all" />
    </div>

    <div className="space-y-2">
      <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">{title}</h3>
      <p className="text-sm text-slate-400 font-bold leading-relaxed px-4">
        {description}
      </p>
    </div>

    {!comingSoon && (
      <div className="mt-4 flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
        Buka Data <ArrowRight size={14} />
      </div>
    )}
  </div>
);

export default function InventarisPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center space-y-12">
      
      <div className="text-center space-y-4 max-w-2xl animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-[0.2em] border border-blue-100 mb-2">
          <ShieldCheck size={16} /> Asset Management System
        </div>
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Barang Inventaris</h1>
        <p className="text-slate-500 font-bold text-lg leading-relaxed">
          Kelola data aset tetap dinas secara terstruktur mulai dari peralatan, mesin, hingga aset perpustakaan dan kesenian.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
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
          description="Peralatan dan Mesin (Kendaraan, Alat Kantor, Alat Elektronik)"
          icon={Truck}
          path="/dokumen/kib-b"
          colorClass="bg-blue-50 text-blue-500"
        />

        <MenuCard 
          title="KIB E"
          description="Aset Tetap Lainnya (Buku, Perpustakaan, Kesenian, Kebudayaan)"
          icon={Book}
          path="/dokumen/kib-e"
          colorClass="bg-emerald-50 text-emerald-500"
        />

      </div>

      <div className="pt-8">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
          Dinas Koperasi dan UKM &copy; {new Date().getFullYear()}
        </p>
      </div>

    </div>
  );
}
