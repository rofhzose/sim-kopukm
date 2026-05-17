import axiosInstance from "../utils/axiosInstance";

/**
 * 📋 Get all hirarki relationships
 * Returns: id, id_pegawai, id_atasan, valid_dari, valid_sampai
 */
export const getAllHirarki = async () => {
  return axiosInstance.get('/pegawai-hirarki');
};

/**
 * 🔍 Get hirarki by ID
 */
export const getHirarkiById = async (id) => {
  return axiosInstance.get(`/pegawai-hirarki/${id}`);
};

/**
 * ➕ Create new hirarki
 * Expects: { id_pegawai, id_atasan, valid_dari, valid_sampai }
 */
export const createHirarki = async (hirarkiData) => {
  return axiosInstance.post('/pegawai-hirarki', hirarkiData);
};

/**
 * ✏️ Update hirarki
 */
export const updateHirarki = async (id, hirarkiData) => {
  return axiosInstance.put(`/pegawai-hirarki/${id}`, hirarkiData);
};

/**
 * 🗑️ Delete hirarki
 */
export const deleteHirarki = async (id) => {
  return axiosInstance.delete(`/pegawai-hirarki/${id}`);
};