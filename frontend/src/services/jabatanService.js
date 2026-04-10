import axios from "axios";

const API_URL = "http://127.0.0.1:4849/api/jabatan";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getAllJabatan = async () => {
  return axios.get(API_URL, getAuthHeader());
};

// Sorted by kelas_jabatan (ganti dari level)
export const getJabatanSortedByKelas = async () => {
  try {
    const response = await axios.get(API_URL, getAuthHeader());
    if (response?.data?.data) {
      const KELAS_ORDER = ["1","2","3","5","6","7","8","9","11","12","14","IX"];
      const sorted = response.data.data.slice().sort((a, b) => {
        const ia = KELAS_ORDER.indexOf(String(a.kelas_jabatan ?? ""));
        const ib = KELAS_ORDER.indexOf(String(b.kelas_jabatan ?? ""));
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      });
      return { ...response, data: { ...response.data, data: sorted } };
    }
    return response;
  } catch (error) {
    console.error("Error fetching jabatan sorted by kelas:", error);
    throw error;
  }
};

// Alias agar EditPegawai tidak perlu diubah importnya
export const getJabatanSortedByLevel = getJabatanSortedByKelas;

export const getJabatanById = async (id) => {
  return axios.get(`${API_URL}/${id}`, getAuthHeader());
};

export const createJabatan = async (data) => {
  return axios.post(API_URL, data, getAuthHeader());
};

export const updateJabatan = async (id, data) => {
  return axios.put(`${API_URL}/${id}`, data, getAuthHeader());
};

export const deleteJabatan = async (id) => {
  return axios.delete(`${API_URL}/${id}`, getAuthHeader());
};

// Filter jabatan berdasarkan kelas_jabatan
export const getJabatanByKelas = async (kelas) => {
  try {
    const response = await axios.get(API_URL, getAuthHeader());
    if (response?.data?.data) {
      const filtered = response.data.data.filter(
        (j) => String(j.kelas_jabatan) === String(kelas)
      );
      return { ...response, data: { ...response.data, data: filtered } };
    }
    return response;
  } catch (error) {
    console.error(`Error fetching jabatan kelas ${kelas}:`, error);
    throw error;
  }
};