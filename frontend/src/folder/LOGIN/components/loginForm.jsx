import React, { useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import ErrorAlert from "./errorAlert";
import FormInput from "./formInput";
import PasswordInput from "./passwordInput";
import RememberMeCheckbox from "./rememberMe";
import LoadingSpinner from "./loadingSpinner";

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.65 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// Fungsi parse UA yang lebih readable
const parseUserAgent = (ua) => {
  const browser = ua.includes("Edg/") ? "Edge" : ua.includes("Chrome") ? "Chrome" : ua.includes("Firefox") ? "Firefox" : ua.includes("Safari") ? "Safari" : ua.includes("Opera") ? "Opera" : "Browser";

  const os = ua.includes("Windows NT 10")
    ? "Windows 10"
    : ua.includes("Windows NT 11")
      ? "Windows 11"
      : ua.includes("Windows")
        ? "Windows"
        : ua.includes("Android")
          ? "Android"
          : ua.includes("iPhone")
            ? "iPhone"
            : ua.includes("iPad")
              ? "iPad"
              : ua.includes("Mac OS")
                ? "macOS"
                : ua.includes("Linux")
                  ? "Linux"
                  : "Unknown OS";

  const device = ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone") ? "Mobile" : "Desktop";

  return `${device} · ${browser} · ${os}`;
};

// Kirim device + lokasi ke backend
const sendDeviceInfo = async (token) => {
  try {
    const device = parseUserAgent(navigator.userAgent);

    const getLocation = async () => {
      // Coba browser geolocation (localhost atau HTTPS)
      const isSecure = window.location.protocol === "https:" || window.location.hostname === "localhost";

      if (isSecure && navigator.geolocation) {
        const coords = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`),
            () => resolve(null),
            { timeout: 5000, maximumAge: 60000 },
          );
        });
        if (coords) return coords;
      }

      // Fallback: IP-based (jalan di HTTP/IP lokal, tanpa izin browser)
      try {
        const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) });
        const ipData = await res.json();
        if (ipData.latitude && ipData.longitude) {
          const city = ipData.city || "";
          const region = ipData.region || "";
          return `${ipData.latitude.toFixed(5)}, ${ipData.longitude.toFixed(5)}${city ? ` (${city}, ${region})` : ""}`;
        }
      } catch {
        // silent
      }
      return null;
    };

    const loc = await getLocation(); // ← rename: bukan 'location'

    await axiosInstance.post("/user/update-device", { device, location: loc }, { headers: { Authorization: `Bearer ${token}` } });
  } catch (err) {
    console.warn("Gagal kirim device info:", err);
  }
};

export default function LoginForm({ onLoginSuccess, onNavigateRegister, onNavigateForgot }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username.trim() || !form.password.trim()) {
      setError("Username dan password tidak boleh kosong");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/auth/login", form);

      if (response.data?.success) {
        const token = response.data.token;
        localStorage.setItem("token", token);

        if (rememberMe) {
          localStorage.setItem("rememberUsername", form.username);
        } else {
          localStorage.removeItem("rememberUsername");
        }

        // Kirim device info di background (non-blocking)
        sendDeviceInfo(token);

        onLoginSuccess?.(response.data.user);
      } else {
        setError(response.data?.message || "Login gagal, periksa username/password");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Terjadi kesalahan server";
      setError(errorMessage);
      console.error("Login Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorAlert message={error} onDismiss={() => setError("")} />

      <FormInput name="username" type="text" label="Username" placeholder="masukkan username" value={form.username} onChange={handleChange} icon={UserIcon} ariaLabel="username" required />

      <PasswordInput name="password" label="Password" placeholder="masukkan password" value={form.password} onChange={handleChange} ariaLabel="password" required />

      <div className="flex items-center justify-between pt-2">
        <RememberMeCheckbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} label="Ingat saya" />
        <button type="button" className="text-sm text-sky-600 hover:text-sky-700 font-medium transition" onClick={() => onNavigateForgot?.()}>
          Lupa password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-6 inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white py-2.5 px-4 rounded-lg font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading && <LoadingSpinner size="sm" />}
        <span>{loading ? "Memproses..." : "Masuk"}</span>
      </button>

      <div className="pt-3 text-center">
        <p className="text-sm text-slate-500">
          Belum punya akun?{" "}
          <button type="button" className="text-sky-600 hover:text-sky-700 font-medium transition" onClick={() => onNavigateRegister?.()}>
            Daftar
          </button>
        </p>
      </div>
    </form>
  );
}
