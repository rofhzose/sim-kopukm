import axiosInstance from "../utils/axiosInstance";

export const getAllJabatan = async () => {
  return axiosInstance.get('/jabatan');
};

// Sorted by kelas_jabatan (ganti dari level)
export const getJabatanSortedByKelas = async () => {
  try {
    const response = await axiosInstance.get('/jabatan');
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
  return axiosInstance.get(`/jabatan/${id}`);
};

export const createJabatan = async (data) => {
  return axiosInstance.post('/jabatan', data);
};

export const updateJabatan = async (id, data) => {
  return axiosInstance.put(`/jabatan/${id}`, data);
};

export const deleteJabatan = async (id) => {
  return axiosInstance.delete(`/jabatan/${id}`);
};

// Filter jabatan berdasarkan kelas_jabatan
export const getJabatanByKelas = async (kelas) => {
  try {
    const response = await axiosInstance.get('/jabatan');
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