"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import UMKMBantuanSummary from "@/components/dashboard/UMKMBantuanSummary";
import UMKMSummary from "@/components/dashboard/UMKMSummary";



export default function UmkmPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");

      if (!token || token === "undefined" || token === "null") {
        // 🚀 Redirect ke login + query redirect ke halaman sekarang
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else {
        setAuthorized(true);
      }

      setLoading(false);
    };

    checkAuth();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 text-lg">
        🔍 Memeriksa sesi login...
      </div>
    );
  }

  if (!authorized) return null;

return (
  <div className="min-h-screen bg-gray-50 p-6">
    <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
      📋 Data UMKM Karawang
    </h1>

    <UMKMBantuanSummary />
    <UMKMSummary />
  </div>
);

}
