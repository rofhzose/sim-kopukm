import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

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

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("❌ Token invalid, redirect ke login...");
      localStorage.removeItem("token");
      window.location.href = "/login?redirect=/informasi/data-awal/umkm";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
