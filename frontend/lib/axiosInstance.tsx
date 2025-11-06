import axios from "axios";

// ✅ Ambil base URL dari env
const baseURL =
  process.env.NEXT_PUBLIC_API_URL || "http://api.khfdz.my.id/api"; // fallback otomatis

// ✅ Log untuk debug di development
if (typeof window === "undefined") {
  console.log("🌐 [Server] Base URL:", baseURL);
} else {
  console.log("🌐 [Client] Base URL:", baseURL);
}

// ✅ Buat instance Axios
const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor sebelum request dikirim
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token dikirim:", token);
    } else {
      console.warn("⚠️ Token belum ada di localStorage");
    }
  }
  return config;
});

// ✅ Interceptor setelah respons diterima
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("❌ Token invalid, redirect ke login...");
      localStorage.removeItem("token");

      // Redirect otomatis ke halaman login dengan redirect path
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        window.location.href = `/login?redirect=${currentPath}`;
      }
    }

    // Log error lain untuk debugging
    if (error.response) {
      console.error(
        `❌ API Error [${error.response.status}]: ${error.response.config.url}`,
        error.response.data
      );
    } else {
      console.error("❌ Network Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
