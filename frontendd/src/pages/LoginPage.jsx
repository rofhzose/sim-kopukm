import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

// Import existing image assets
import logoDinkop from "../assets/logo_dinkopukm.png";
import logoKarawang from "../assets/logo_karawang.png";
import logoKoperasi from "../assets/logo_koperasi.png";

export default function LoginPageKece() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.post("/auth/login", form);
      if (res.data?.success) {
        localStorage.setItem("token", res.data.token);
        navigate("/overview");
      } else {
        setError(res.data?.message || "Login gagal, periksa username/password");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-rose-50 p-6">
      {/* Decorative background shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-20 -top-10 blur-3xl opacity-30 w-72 h-72 rounded-full bg-blue-300 transform rotate-45" />
        <div className="absolute right-0 bottom-0 blur-2xl opacity-25 w-60 h-60 rounded-full bg-pink-200" />
      </div>

      <div className="relative z-10 w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left: Branding / Promo */}
        <div className="hidden md:flex flex-col items-start justify-center bg-gradient-to-tr from-white/60 to-white/30 p-8 rounded-2xl shadow-lg border border-white/60 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <img src={logoDinkop} alt="Logo DinkopUKM" className="w-100 h-30 object-contain" />
          </div>

          <h3 className="text-2xl font-semibold text-slate-800 mb-2">Selamat Datang</h3>
          <p className="text-sm text-slate-600 mb-6">Masuk untuk mengelola data umkm, koperasi, pelayanan, dan laporan.</p>

          <ul className="text-sm text-slate-600 space-y-2">
            <li>• Akses laporan real-time</li>
            <li>• Kelola pengaduan dan layanan</li>
            <li>• Dashboard analisa</li>
          </ul>
        </div>

        {/* Right: Login Card */}
        <div className="bg-white/95 p-6 md:p-10 rounded-2xl shadow-2xl border border-slate-100">
          <div className="flex items-center justify-center mb-1">
              {/* Use Karawang and Koperasi logos side-by-side on the card */}
              <div className="flex items-center justify-center">
                <img src={logoKarawang} alt="Logo Kabupaten Karawang" className="w-45 h-45 object-contain" />
                <img src={logoKoperasi} alt="Logo Koperasi" className="w-40 h-40 object-contain" />
              </div>
          </div>

          <h1 className="text-center text-2xl md:text-3xl font-bold text-slate-800 mb-2">Login SIM-KOPUKM</h1>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="block text-sm text-slate-600 mb-0.5">Username</label>
                    <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-sky-300">
                    <div className="px-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.65 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    </div>
                    <input
                    name="username"
                    type="text"
                    value={form.username}
                    onChange={handleChange}
                    required
                    placeholder="username"
                    className="flex-1 px-3 py-2 text-sm bg-transparent outline-none"
                    aria-label="username"
                    />  
            </div>

            <label className="block text-sm text-slate-600 mb-0.5">Password</label>
            <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-sky-300">
              <div className="px-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4 9 5.567 9 7.5 10.343 11 12 11z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>

              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                required
                placeholder="password"
                className="flex-1 px-3 py-2 text-sm bg-transparent outline-none"
                aria-label="password"
              />

              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="px-3"
                aria-label={showPassword ? "sembunyikan password" : "tampilkan password"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-3.582-10-8s4.477-8 10-8c1.108 0 2.172.17 3.174.486M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-slate-600">Ingat saya</span>
              </label>

              <button
                type="button"
                className="text-sky-600 hover:underline"
                onClick={() => navigate('/forgot-password')}
              >
                Lupa password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-lg font-medium transition disabled:opacity-60"
            >
              {loading ? (
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : null}
              {loading ? 'Memproses...' : 'Masuk'}
            </button>

            <div className="pt-3 text-center text-sm text-slate-500">
              Belum punya akun? <button type="button" className="text-sky-600 font-medium" onClick={() => navigate('/register')}>Daftar</button>
            </div>
          </form>

          {/* Small footer */}
          <div className="mt-6 text-xs text-center text-slate-400">© DinkopUKM • Sistem Internal</div>
        </div>
      </div>
    </div>
  );
}
