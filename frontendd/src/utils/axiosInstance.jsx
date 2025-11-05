// // src/utils/axiosInstance.js
// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL: "http://127.0.0.1:4849/api/",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Interceptor untuk otomatis kirim token kalau ada
// axiosInstance.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default axiosInstance;


// src/utils/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api/",
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
