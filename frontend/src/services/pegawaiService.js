import axiosInstance from "../utils/axiosInstance";

/**
 * 📋 Get all pegawai (returns ARRAY)
 * Must call without ID to get all records
 */
export const getPegawai = async () => {
  // ✅ IMPORTANT: Call without ID to get all pegawai
  return axiosInstance.get('/pegawai');
  // This calls: GET /api/pegawai (not /api/pegawai/something)
};

/**
 * 🔍 Get single pegawai by ID (returns SINGLE OBJECT)
 */
export const getPegawaiById = async (id) => {
  return axiosInstance.get(`/pegawai/${id}`);
};

/**
 * ➕ Create new pegawai
 */
export const createPegawai = async (pegawaiData) => {
  return axiosInstance.post('/pegawai', pegawaiData);
};

/**
 * ✏️ Update pegawai
 */
export const updatePegawai = async (id, pegawaiData) => {
  return axiosInstance.put(`/pegawai/${id}`, pegawaiData);
};

/**
 * 🗑️ Delete pegawai
 */
export const deletePegawai = async (id) => {
  return axiosInstance.delete(`/pegawai/${id}`);
};