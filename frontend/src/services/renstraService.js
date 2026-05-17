import axiosInstance from "@/utils/axiosInstance";

const renstraService = {
  // Mengambil semua data hirarki
  getHirarki: () => axiosInstance.get("/hirarki"),

  // Mengambil semua dokumen
  getDokumen: () => axiosInstance.get("/renstra/dokumen"),

  // Mengambil semua program
  getProgram: () => axiosInstance.get("/renstra/program"),

  // Mengambil kegiatan berdasarkan program ID
  getKegiatanByProgram: (programId) =>
    axiosInstance.get(`/renstra/kegiatan?program_id=${programId}`),

  // Menghapus program
  deleteProgram: (id) => axiosInstance.delete(`/renstra/program/${id}`),
};

export default renstraService;