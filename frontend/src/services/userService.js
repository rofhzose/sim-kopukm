import axiosInstance from "../utils/axiosInstance";

export const getCurrentUser = async () => {
  return axiosInstance.get(`/auth/me`);
};