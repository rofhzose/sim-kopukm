import React, { useEffect, useState, useMemo, useRef } from "react";
import { PlusCircle, ArrowLeft, PencilLine, Trash2, Search, AlertCircle, LogIn, CheckCircle, Monitor, Smartphone, MapPin, Clock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ROLE_COLORS = {
  super_admin: "bg-red-100 text-red-700 border-red-200",
  admin: "bg-blue-100 text-blue-700 border-blue-200",
  sekdin: "bg-green-100 text-green-700 border-green-200",
  kadin: "bg-purple-100 text-purple-700 border-purple-200",
  user: "bg-gray-100 text-gray-700 border-gray-200",
};

const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin: "Admin",
  sekdin: "Sekdin",
  kadin: "Kadin",
  user: "User",
};

const formatWaNumber = (phone) => {
  if (!phone) return null;
  let num = phone.replace(/\D/g, "");
  if (num.startsWith("0")) num = "62" + num.slice(1);
  if (!num.startsWith("62")) num = "62" + num;
  return num;
};

const DeviceBadge = ({ device }) => {
  if (!device) return <span className="text-gray-400 text-xs">-</span>;
  const isMobile = device.includes("Mobile");
  const browser = device.includes("Edge") ? "Edge" : device.includes("Chrome") ? "Chrome" : device.includes("Firefox") ? "Firefox" : device.includes("Safari") ? "Safari" : "Browser";
  const os = device.includes("Windows 10")
    ? "Win 10"
    : device.includes("Windows 11")
      ? "Win 11"
      : device.includes("Windows")
        ? "Windows"
        : device.includes("Android")
          ? "Android"
          : device.includes("iPhone")
            ? "iPhone"
            : device.includes("iPad")
              ? "iPad"
              : device.includes("macOS")
                ? "macOS"
                : device.includes("Linux")
                  ? "Linux"
                  : "Unknown";
  return (
    <div className="flex items-center gap-1.5">
      {isMobile ? <Smartphone size={13} className="text-indigo-500 shrink-0" /> : <Monitor size={13} className="text-slate-500 shrink-0" />}
      <span className="text-xs text-gray-600">
        {browser} · {os}
      </span>
    </div>
  );
};

// ── Cache geocode global (persists selama session) ────────────────────────────
const geocodeCache = {};

// ── Parse "lat, lng" atau "lat, lng (Kota)" dari DB ──────────────────────────
const parseLatLng = (raw) => {
  if (!raw) return null;
  const clean = raw.replace(/\(.*\)/, "").trim();
  const parts = clean.split(",").map((s) => s.trim());
  if (parts.length < 2) return null;
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
};

// ── Reverse geocode via Nominatim OSM ────────────────────────────────────────
const reverseGeocode = async (lat, lng) => {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (geocodeCache[key]) return geocodeCache[key];

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`, { headers: { "Accept-Language": "id" } });
    const data = await res.json();
    const addr = data.address || {};

    // Prioritas field untuk Indonesia
    const kecamatan = addr.suburb || addr.subdistrict || addr.village || addr.hamlet || "";
    const kota =
      addr.city ||
      addr.town ||
      addr.regency || // kabupaten
      addr.county ||
      addr.state_district ||
      "";
    const provinsi = addr.state || "";

    let label = "";
    if (kecamatan && kota) {
      label = `Kec. ${kecamatan}, ${kota}`;
    } else if (kota && provinsi) {
      label = `${kota}, ${provinsi}`;
    } else {
      // Fallback: ambil 3 segmen pertama display_name
      label = data.display_name?.split(",").slice(0, 3).join(",").trim() || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }

    geocodeCache[key] = label;
    return label;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

// ── LocationCell — fetch mandiri per baris, dengan stagger delay ──────────────
function LocationCell({ rawLocation, delayMs = 0 }) {
  const [label, setLabel] = useState(null);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!rawLocation) return;

    const coords = parseLatLng(rawLocation);

    // Bukan format koordinat → tampil langsung
    if (!coords) {
      setLabel(rawLocation);
      return;
    }

    const cacheKey = `${coords.lat.toFixed(4)},${coords.lng.toFixed(4)}`;
    if (geocodeCache[cacheKey]) {
      setLabel(geocodeCache[cacheKey]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      const result = await reverseGeocode(coords.lat, coords.lng);
      if (mounted.current) {
        setLabel(result);
        setLoading(false);
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [rawLocation, delayMs]);

  if (!rawLocation) return <span className="text-gray-400 text-xs">-</span>;

  const coords = parseLatLng(rawLocation);
  const mapsUrl = coords ? `https://maps.google.com/?q=${coords.lat},${coords.lng}` : `https://maps.google.com/?q=${encodeURIComponent(rawLocation)}`;

  return (
    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors group/loc" title={label || rawLocation}>
      <MapPin size={12} className="shrink-0 mt-0.5 text-blue-400 group-hover/loc:text-blue-600" />
      {loading ? (
        <span className="flex items-center gap-1 text-gray-400 italic">
          <Loader2 size={11} className="animate-spin shrink-0" />
          Memuat...
        </span>
      ) : (
        <span className="leading-snug hover:underline">{label || rawLocation}</span>
      )}
    </a>
  );
}

// ── Main DaftarUser ───────────────────────────────────────────────────────────
export default function DaftarUser() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4849/api/user", {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      setError("Gagal memuat data pengguna. Silahkan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(
      (item) =>
        (item.name && item.name.toLowerCase().includes(query)) ||
        item.username.toLowerCase().includes(query) ||
        (item.nip && item.nip.toLowerCase().includes(query)) ||
        (item.role && item.role.toLowerCase().includes(query)) ||
        (item.phone && item.phone.includes(query)),
    );
  }, [data, searchQuery]);

  const stats = useMemo(() => {
    const activeCount = data.filter((u) => u.is_active === 1).length;
    const inactiveCount = data.filter((u) => u.is_active === 0).length;
    const roleCount = {
      super_admin: data.filter((u) => u.role === "super_admin").length,
      admin: data.filter((u) => u.role === "admin").length,
      sekdin: data.filter((u) => u.role === "sekdin").length,
      kadin: data.filter((u) => u.role === "kadin").length,
      user: data.filter((u) => u.role === "user").length,
    };
    return { total: data.length, active: activeCount, inactive: inactiveCount, role: roleCount };
  }, [data]);

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:4849/api/user/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Gagal menghapus data");
      fetchUsers();
    } catch (error) {
      alert(error.message || "Gagal menghapus data");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getRoleColor = (role) => ROLE_COLORS[role] || "bg-gray-100 text-gray-700 border-gray-200";
  const getRoleLabel = (role) => ROLE_LABELS[role] || role;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100 text-gray-900 overflow-x-auto">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 bg-blue-300" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 bg-cyan-300" />
      </div>

      <div className="relative z-10">
        <header className="backdrop-blur-xl bg-white/40 border-b border-blue-200/50 sticky top-0 z-20 shadow-sm">
          <div className="px-4 sm:px-6 py-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold bg-linear-to-r from-blue-700 via-blue-600 to-cyan-600 bg-clip-text text-transparent">Daftar Pengguna</h1>
                  <p className="text-gray-600 text-sm">Kelola data pengguna dan akun di sistem</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => navigate(-1)} className="px-4 py-2.5 rounded-lg bg-white/60 hover:bg-white/80 border border-blue-200 text-gray-700 font-medium text-sm transition-all duration-200 flex items-center gap-2">
                    <ArrowLeft size={16} />
                    <span className="hidden sm:inline">Kembali</span>
                  </button>
                  {/* <button
                    onClick={() => navigate("/dokumen/pengguna/create")}
                    className="px-4 py-2.5 rounded-lg bg-linear-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 font-bold text-sm transition-all duration-200 shadow-lg shadow-blue-500/30 flex items-center gap-2 text-white"
                  >
                    <PlusCircle size={16} />
                    <span className="hidden sm:inline">Tambah Pengguna</span>
                  </button> */}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-xl border-2 border-blue-200 bg-linear-to-br from-blue-50 to-blue-100/50">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total User</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                </div>
                <div className="p-3 rounded-xl border-2 border-green-200 bg-linear-to-br from-green-50 to-green-100/50">
                  <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Aktif</p>
                  <p className="text-2xl font-bold text-green-800">{stats.active}</p>
                </div>
                <div className="p-3 rounded-xl border-2 border-red-200 bg-linear-to-br from-red-50 to-red-100/50">
                  <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Tidak Aktif</p>
                  <p className="text-2xl font-bold text-red-800">{stats.inactive}</p>
                </div>
                <div className="p-3 rounded-xl border-2 border-purple-200 bg-linear-to-br from-purple-50 to-purple-100/50">
                  <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Super Admin</p>
                  <p className="text-2xl font-bold text-purple-800">{stats.role.super_admin}</p>
                </div>
              </div>

              <div className="relative">
                <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama, username, NIP, role, atau no HP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/70 border border-blue-200 text-gray-700 placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className="px-4 sm:px-6 pt-6">
            <div className="rounded-2xl border border-red-300 bg-linear-to-br from-red-50 to-red-100/50 backdrop-blur-sm p-4 sm:p-5 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="shrink-0 p-2 rounded-lg bg-red-200/50">
                  <AlertCircle size={20} className="text-red-600" />
                </div>
                <p className="flex-1 text-red-700">{error}</p>
                <button onClick={fetchUsers} className="shrink-0 px-3 py-1 rounded-lg bg-red-200/70 hover:bg-red-300 text-red-700 font-medium text-xs transition-all duration-200">
                  Coba Lagi
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="px-4 sm:px-6 py-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-blue-200" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-cyan-400 animate-spin" />
              </div>
              <p className="text-gray-600 font-medium">Memuat data pengguna...</p>
            </div>
          ) : filteredData.length === 0 && searchQuery ? (
            <div className="flex flex-col items-center justify-center py-24 px-4">
              <div className="p-4 rounded-2xl bg-blue-100 border border-blue-200 mb-4">
                <Search size={48} className="text-blue-400" />
              </div>
              <p className="text-xl font-bold text-gray-800 mb-2">Tidak ada hasil</p>
              <p className="text-gray-600 text-sm mb-6 text-center max-w-sm">Coba ubah pencarian atau tambahkan pengguna baru</p>
              <button onClick={() => navigate("/dokumen/pengguna/create")} className="px-6 py-3 rounded-lg bg-linear-to-r from-blue-500 to-cyan-400 font-bold text-sm text-white shadow-lg shadow-blue-500/30">
                Tambah Pengguna
              </button>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-blue-300 rounded-3xl bg-linear-to-br from-blue-100/30 to-cyan-100/30">
              <div className="p-4 rounded-2xl bg-blue-100 border border-blue-200 mb-4">
                <LogIn size={48} className="text-blue-400" />
              </div>
              <p className="text-xl font-bold text-gray-800 mb-2">Belum Ada Pengguna</p>
              <p className="text-gray-600 text-sm mb-6 text-center max-w-sm">Silahkan tambahkan pengguna baru untuk memulai</p>
              <button onClick={() => navigate("/dokumen/pengguna/create")} className="px-6 py-3 rounded-lg bg-linear-to-r from-blue-500 to-cyan-400 font-bold text-sm text-white shadow-lg shadow-blue-500/30">
                Tambah Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="overflow-x-auto rounded-2xl border border-blue-200/70 shadow-xl">
                <table className="w-full min-w-[1400px]">
                  <thead>
                    <tr className="bg-linear-to-r from-blue-50 to-cyan-50 border-b border-blue-200/70">
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wide w-10">No</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wide">Nama</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wide w-28">Username</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wide w-20">NIP</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wide w-24">Role</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wide w-20">Status</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wide w-32">
                        <div className="flex items-center gap-1">
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-green-600">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          No HP
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wide w-36">Device</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wide w-52">Lokasi</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wide w-36">Login Terakhir</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wide w-32">Dibuat</th>
                      <th className="px-4 py-4 text-center text-xs font-bold text-gray-800 uppercase tracking-wide w-24">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => {
                      const waNumber = formatWaNumber(item.phone);
                      return (
                        <tr key={item.id} className="border-b border-blue-100/70 hover:bg-blue-50/50 transition-all duration-200 group bg-white/50">
                          <td className="px-4 py-4 text-sm text-gray-600 font-mono">{index + 1}</td>
                          <td className="px-4 py-4 text-sm text-gray-800 font-medium group-hover:text-blue-700 transition-colors">{item.name || "-"}</td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">{item.username}</code>
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-600">{item.nip || "-"}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${getRoleColor(item.role)}`}>{getRoleLabel(item.role)}</span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5">
                              {item.is_active === 1 ? (
                                <>
                                  <CheckCircle size={14} className="text-green-600" />
                                  <span className="text-green-700 font-medium text-xs">Aktif</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle size={14} className="text-red-600" />
                                  <span className="text-red-700 font-medium text-xs">Non-aktif</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {waNumber ? (
                              <a
                                href={`https://wa.me/${waNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 transition-colors group/wa"
                                title={`Chat WhatsApp: ${item.phone}`}
                              >
                                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-green-600 shrink-0 group-hover/wa:fill-green-800">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                <span className="text-xs font-medium">{item.phone}</span>
                              </a>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <DeviceBadge device={item.last_device} />
                          </td>

                          {/* Lokasi — reverse geocode Nominatim, stagger 300ms/baris */}
                          <td className="px-4 py-4">
                            <LocationCell rawLocation={item.last_location} delayMs={index * 300} />
                          </td>

                          <td className="px-4 py-4">
                            {item.last_login_at ? (
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Clock size={12} className="text-gray-400 shrink-0" />
                                {formatDate(item.last_login_at)}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-600">{formatDate(item.created_at)}</td>
                          <td className="px-4 py-4">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => navigate(`/dokumen/pengguna/edit/${item.id}`)} className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-all duration-200 text-blue-600 hover:text-blue-800" title="Edit">
                                <PencilLine size={15} />
                              </button>
                              <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-all duration-200 text-red-600 hover:text-red-800" title="Hapus">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="text-xs text-gray-600 text-center mt-4">
                Menampilkan {filteredData.length} dari {data.length} pengguna
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
