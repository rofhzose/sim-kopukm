"use client";
import DashboardSummary from "@/components/dashboard/DashboardSummary";
import UmkmTableKotor from "@/components/umkm/UmkmTableKotor";
import UmkmTableBersih from "@/components/umkm/UmkmTableBersih";
import UmkmDapatBantuanTable from "@/components/umkm/UmkmDapatBantuanTable";
import UmkmDuplikatTable from "@/components/umkm/UmkmDuplikatTable";
import UmkmGandaBantuanTable from "@/components/umkm/UmkmGandaBantuanTable";
import UmkmTidakBantuanTable from "@/components/umkm/UmkmTidakDapatBantuanTable";

export default function UmkmPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
        📋 Data UMKM Karawang
      </h1>

            <DashboardSummary />

      {/* 🔹 Komponen tabel kotor */}
      <UmkmTableKotor />
      <UmkmTableBersih />
      <UmkmDapatBantuanTable />
      <UmkmDuplikatTable />
      <UmkmGandaBantuanTable />
      <UmkmTidakBantuanTable />
    </div>
  );
}
