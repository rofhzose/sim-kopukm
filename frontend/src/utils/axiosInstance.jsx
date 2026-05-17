import axios from "axios";  

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL || "";
  // If the page is accessed via an IP address (like 192.168.x.x) or domain, and VITE_API_URL points to localhost/127.0.0.1
  if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    // Replace localhost or 127.0.0.1 in VITE_API_URL with the actual window.location.hostname
    return envUrl.replace("localhost", window.location.hostname).replace("127.0.0.1", window.location.hostname) + "/api/";
  }
  return envUrl + "/api/";
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk otomatis kirim token kalau ada
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
