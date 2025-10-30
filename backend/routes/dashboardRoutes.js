// import express from "express";
// import {
//   getJumlahUMKM,
//   getDataDuplikat,
//   getUMKMProfilBelumLengkap,
//   getJumlahPenerimaBantuan,
//   getBantuanProfilBelumLengkap,
//   getBantuanProfilLengkap,
//   getPersentaseUMKMDapatBantuan,
//   getBantuanBelumTerdaftar,
//   getRingkasanTidakTerdaftarPerTahun,
//   getTotalTidakTerdaftar,
//   getJumlahBantuanValidPerTahun,
//   getDistribusiBantuanPerTahun,
//   getBantuanSatuKaliPerTahun,
//   getBantuanGandaPerTahun,
  
// } from "../controllers/dashboardController.js";

// import { verifyToken, isSuperAdmin } from "../middleware/authMiddleware.js";

// const router = express.Router();

// /**
//  * Semua endpoint dashboard hanya bisa diakses oleh user
//  * dengan role "super_admin"
//  * dan harus mengirimkan token JWT yang valid.
//  */
// router.get("/umkm/jumlah", verifyToken, isSuperAdmin, getJumlahUMKM);
// router.get("/umkm/duplikat", verifyToken, isSuperAdmin, getDataDuplikat);
// router.get("/umkm/profil/belum-lengkap", verifyToken, isSuperAdmin, getUMKMProfilBelumLengkap);
// router.get("/umkm/bantuan/jumlah", verifyToken, isSuperAdmin, getJumlahPenerimaBantuan);
// router.get("/umkm/bantuan/belum-lengkap", verifyToken, isSuperAdmin, getBantuanProfilBelumLengkap);
// router.get("/umkm/bantuan/lengkap", verifyToken, isSuperAdmin, getBantuanProfilLengkap);
// router.get("/umkm/bantuan/persentase", verifyToken, isSuperAdmin, getPersentaseUMKMDapatBantuan);
// router.get("/umkm/bantuan/belum-terdaftar", verifyToken, isSuperAdmin, getBantuanBelumTerdaftar);
// router.get("/umkm/bantuan/ringkasan-tidak-terdaftar", verifyToken, isSuperAdmin, getRingkasanTidakTerdaftarPerTahun);
// router.get("/umkm/bantuan/total-tidak-terdaftar", verifyToken, isSuperAdmin, getTotalTidakTerdaftar);
// router.get("/umkm/bantuan/valid-per-tahun", verifyToken, isSuperAdmin, getJumlahBantuanValidPerTahun);
// router.get("/umkm/bantuan/distribusi", verifyToken, isSuperAdmin, getDistribusiBantuanPerTahun);
// router.get("/umkm/bantuan/satu-kali", verifyToken, isSuperAdmin, getBantuanSatuKaliPerTahun);
// router.get("/umkm/bantuan/ganda", verifyToken, isSuperAdmin, getBantuanGandaPerTahun);



// export default router;

import express from "express";
import {
  getUMKMSummary,
  getBantuanSummary,
  getBantuanProfil,
  getBantuanTidakTerdaftar,
  getAnalisisTahunan,
} from "../controllers/dashboardController.js";

import { verifyToken, isSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔒 Semua endpoint butuh token & super_admin
router.get("/umkm-summary", verifyToken, isSuperAdmin, getUMKMSummary);
router.get("/bantuan-summary", verifyToken, isSuperAdmin, getBantuanSummary);
router.get("/bantuan-profil", verifyToken, isSuperAdmin, getBantuanProfil);
router.get("/bantuan-tidak-terdaftar", verifyToken, isSuperAdmin, getBantuanTidakTerdaftar);
router.get("/analisis-tahunan", verifyToken, isSuperAdmin, getAnalisisTahunan);

export default router;
