// import pool from "../config/db.js";

// // ================================
// // 📊 1) Jumlah UMKM Terdaftar
// // ================================
// export const getJumlahUMKM = async (req, res) => {
//   try {
//     const [rows] = await pool.query(`SELECT COUNT(*) AS jumlah_umkm FROM data_umkm;`);
//     res.json({ success: true, data: rows[0] });
//   } catch (err) {
//     console.error("❌ Error getJumlahUMKM:", err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ===========================================
// // ⚠️ 2) Data Terindikasi Duplikasi Nama + Usaha
// // ===========================================
// export const getDataDuplikat = async (req, res) => {
//   try {
//     const [rows] = await pool.query(`
//       SELECT 
//         nama, 
//         nama_usaha, 
//         COUNT(*) AS jumlah_kemunculan
//       FROM data_umkm
//       WHERE nama IS NOT NULL 
//         AND nama != ''
//         AND nama_usaha IS NOT NULL 
//         AND nama_usaha != ''
//       GROUP BY nama, nama_usaha
//       HAVING COUNT(*) > 1
//       ORDER BY jumlah_kemunculan DESC;
//     `);
//     res.json({ success: true, total: rows.length, data: rows });
//   } catch (err) {
//     console.error("❌ Error getDataDuplikat:", err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ====================================
// // 🧩 3) UMKM Belum Lengkap Profil
// // ====================================
// export const getUMKMProfilBelumLengkap = async (req, res) => {
//   try {
//     const [rows] = await pool.query(`
//       SELECT id, nama, nama_usaha, kecamatan, desa
//       FROM data_umkm
//       WHERE 
//         nama IS NULL OR nama = '' OR
//         jenis_kelamin IS NULL OR jenis_kelamin = '' OR
//         nama_usaha IS NULL OR nama_usaha = '' OR
//         alamat IS NULL OR alamat = '' OR
//         kecamatan IS NULL OR kecamatan = '' OR
//         desa IS NULL OR desa = '' OR
//         longitude IS NULL OR longitude = '' OR
//         latitude IS NULL OR latitude = '' OR
//         jenis_ukm IS NULL OR jenis_ukm = '' OR
//         nib IS NULL OR nib = '';
//     `);
//     res.json({ success: true, total: rows.length, data: rows });
//   } catch (err) {
//     console.error("❌ Error getUMKMProfilBelumLengkap:", err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ====================================
// // 🎁 4) Jumlah Penerima Bantuan
// // ====================================
// export const getJumlahPenerimaBantuan = async (req, res) => {
//   try {
//     const [rows] = await pool.query(`SELECT COUNT(*) AS jumlah_penerima_bantuan FROM data_bantuan_umkm;`);
//     res.json({ success: true, data: rows[0] });
//   } catch (err) {
//     console.error("❌ Error getJumlahPenerimaBantuan:", err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ====================================
// // 📋 5) Profil Belum Lengkap di Bantuan UMKM
// // ====================================
// export const getBantuanProfilBelumLengkap = async (req, res) => {
//   try {
//     const [rows] = await pool.query(`
//       SELECT id, nama, nama_umkm, kecamatan, keterangan
//       FROM data_bantuan_umkm
//       WHERE 
//         nama IS NULL OR nama = '' OR
//         nik IS NULL OR nik = '' OR
//         nama_produk IS NULL OR nama_produk = '' OR
//         nama_umkm IS NULL OR nama_umkm = '' OR
//         alamat IS NULL OR alamat = '' OR
//         kecamatan IS NULL OR kecamatan = '' OR
//         no_hp IS NULL OR no_hp = '' OR
//         nib IS NULL OR nib = '' OR
//         no_pirt IS NULL OR no_pirt = '' OR
//         no_halal IS NULL OR no_halal = '' OR
//         jenis_alat_bantu IS NULL OR jenis_alat_bantu = '' OR
//         tahun IS NULL OR tahun = '' OR
//         keterangan IS NULL OR keterangan = '';
//     `);
//     res.json({ success: true, total: rows.length, data: rows });
//   } catch (err) {
//     console.error("❌ Error getBantuanProfilBelumLengkap:", err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ====================================
// // ✅ 6) Profil Lengkap & Valid di Bantuan UMKM
// // ====================================
// export const getBantuanProfilLengkap = async (req, res) => {
//   try {
//     const [rows] = await pool.query(`
//       SELECT 
//         id,
//         nama,
//         nik,
//         nama_produk,
//         nama_umkm,
//         alamat,
//         kecamatan,
//         no_hp,
//         nib,
//         no_pirt,
//         no_halal,
//         jenis_alat_bantu,
//         tahun,
//         keterangan
//       FROM data_bantuan_umkm
//       WHERE 
//         nama IS NOT NULL AND nama <> '' AND
//         nik IS NOT NULL AND nik <> '' AND
//         nama_produk IS NOT NULL AND nama_produk <> '' AND
//         nama_umkm IS NOT NULL AND nama_umkm <> '' AND
//         alamat IS NOT NULL AND alamat <> '' AND
//         kecamatan IS NOT NULL AND kecamatan <> '' AND
//         no_hp IS NOT NULL AND no_hp <> '' AND
//         nib IS NOT NULL AND nib <> '' AND
//         no_pirt IS NOT NULL AND no_pirt <> '' AND
//         no_halal IS NOT NULL AND no_halal <> '' AND
//         jenis_alat_bantu IS NOT NULL AND jenis_alat_bantu <> '' AND
//         tahun IS NOT NULL AND tahun <> '' AND
//         keterangan IS NOT NULL AND keterangan <> ''
//         AND (
//             UPPER(no_pirt) LIKE 'PIRT%' OR
//             UPPER(no_pirt) LIKE 'P-IRT%' OR
//             UPPER(no_pirt) LIKE 'P IRT%'
//         )
//         AND (
//             no_halal NOT LIKE '0' AND 
//             no_halal NOT LIKE '-'
//         );
//     `);

//     res.json({
//       success: true,
//       total: rows.length,
//       data: rows,
//     });
//   } catch (err) {
//     console.error("❌ Error getBantuanProfilLengkapValid:", err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ====================================
// // 📈 7) Persentase UMKM yang Mendapat Bantuan (unik per nama)
// // ====================================
// export const getPersentaseUMKMDapatBantuan = async (req, res) => {
//   try {
//     const [rows] = await pool.query(`
//       SELECT 
//         COUNT(DISTINCT dbu.nama) AS jumlah_umkm_dapat_bantuan,
//         (SELECT COUNT(DISTINCT nama) FROM data_umkm) AS total_umkm_terdaftar,
//         ROUND(
//           COUNT(DISTINCT dbu.nama) * 100.0 / 
//           (SELECT COUNT(DISTINCT nama) FROM data_umkm),
//         2) AS persentase_dapat_bantuan
//       FROM data_bantuan_umkm AS dbu
//       WHERE dbu.nama IS NOT NULL AND dbu.nama <> '';
//     `);

//     res.json({ success: true, data: rows[0] });
//   } catch (err) {
//     console.error("❌ Error getPersentaseUMKMDapatBantuan:", err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ====================================
// // 🔍 8) Detail Penerima Bantuan yang Belum Terdaftar di Daftar UMKM
// // ====================================
// export const getBantuanBelumTerdaftar = async (req, res) => {
//   try {
//     const [rows] = await pool.query(`
//       SELECT 
//         dbu.id,
//         dbu.nama,
//         dbu.nik,
//         dbu.nama_umkm,
//         dbu.kecamatan,
//         dbu.tahun,
//         dbu.jenis_alat_bantu,
//         dbu.keterangan,
//         (
//           SELECT COUNT(*)
//           FROM data_bantuan_umkm AS d2
//           LEFT JOIN data_umkm AS u2
//             ON TRIM(UPPER(d2.nama)) = TRIM(UPPER(u2.nama))
//           WHERE u2.nama IS NULL
//         ) AS total_tidak_terdaftar
//       FROM data_bantuan_umkm AS dbu
//       LEFT JOIN data_umkm AS ui
//         ON TRIM(UPPER(dbu.nama)) = TRIM(UPPER(ui.nama))
//       WHERE ui.nama IS NULL
//       ORDER BY dbu.tahun ASC, dbu.kecamatan ASC, dbu.nama ASC;
//     `);

//     res.json({ success: true, total: rows.length, data: rows });
//   } catch (err) {
//     console.error("❌ Error getBantuanBelumTerdaftar:", err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ====================================
// // 🗓️ 9) Ringkasan Tidak Terdaftar per Tahun
// // ====================================
// export const getRingkasanTidakTerdaftarPerTahun = async (req, res) => {
//   try {
//     const [rows] = await pool.query(`
//       SELECT 
//         dbu.tahun,
//         COUNT(*) AS jumlah_tidak_terdaftar
//       FROM data_bantuan_umkm AS dbu
//       LEFT JOIN data_umkm AS ui
//         ON TRIM(UPPER(dbu.nama)) = TRIM(UPPER(ui.nama))
//       WHERE ui.nama IS NULL
//       GROUP BY dbu.tahun
//       ORDER BY dbu.tahun ASC;
//     `);

//     res.json({ success: true, total: rows.length, data: rows });
//   } catch (err) {
//     console.error("❌ Error getRingkasanTidakTerdaftarPerTahun:", err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ====================================
// // 🧮 10) Total Keseluruhan Tidak Terdaftar
// // ====================================
// export const getTotalTidakTerdaftar = async (req, res) => {
//   try {
//     const [rows] = await pool.query(`
//       SELECT 
//         COUNT(*) AS total_tidak_terdaftar
//       FROM data_bantuan_umkm AS dbu
//       LEFT JOIN data_umkm AS ui
//         ON TRIM(UPPER(dbu.nama)) = TRIM(UPPER(ui.nama))
//       WHERE ui.nama IS NULL;
//     `);

//     res.json({ success: true, data: rows[0] });
//   } catch (err) {
//     console.error("❌ Error getTotalTidakTerdaftar:", err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ====================================
// // 🗓️ 12) Jumlah Bantuan Valid per Tahun (Validasi Profil + Legalitas)
// // ====================================
// export const getJumlahBantuanValidPerTahun = async (req, res) => {
//   try {
//     const [rows] = await pool.query(`
//       SELECT 
//         tahun,
//         COUNT(*) AS jumlah_bantuan_valid
//       FROM data_bantuan_umkm
//       WHERE 
//         nama IS NOT NULL AND nama <> '' AND
//         nik IS NOT NULL AND nik <> '' AND
//         nama_produk IS NOT NULL AND nama_produk <> '' AND
//         nama_umkm IS NOT NULL AND nama_umkm <> '' AND
//         alamat IS NOT NULL AND alamat <> '' AND
//         kecamatan IS NOT NULL AND kecamatan <> '' AND
//         no_hp IS NOT NULL AND no_hp <> '' AND
//         nib IS NOT NULL AND nib <> '' AND
//         jenis_alat_bantu IS NOT NULL AND jenis_alat_bantu <> '' AND
//         tahun IS NOT NULL AND tahun <> '' AND
//         keterangan IS NOT NULL AND keterangan <> ''
//         AND (
//             UPPER(no_pirt) LIKE 'PIRT%' OR
//             UPPER(no_pirt) LIKE 'P-IRT%' OR
//             UPPER(no_pirt) LIKE 'P IRT%'
//         )
//         AND (
//             no_halal NOT LIKE '0' AND 
//             no_halal NOT LIKE '-' AND
//             no_halal IS NOT NULL AND no_halal <> ''
//         )
//       GROUP BY tahun
//       ORDER BY tahun ASC;
//     `);

//     res.json({ success: true, total: rows.length, data: rows });
//   } catch (err) {
//     console.error("❌ Error getJumlahBantuanValidPerTahun:", err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ====================================
// // 🧰 13) Penerima per Tahun per Jenis Alat Bantu
// // ====================================
// export const getDistribusiBantuanPerTahun = async (req, res) => {
//   try {
//     const [rows] = await pool.query(`
//       SELECT 
//         tahun,
//         jenis_alat_bantu,
//         COUNT(*) AS jumlah_penerima
//       FROM data_bantuan_umkm
//       WHERE jenis_alat_bantu IS NOT NULL AND jenis_alat_bantu <> ''
//       GROUP BY tahun, jenis_alat_bantu
//       ORDER BY tahun ASC, jumlah_penerima DESC;
//     `);

//     res.json({ success: true, total: rows.length, data: rows });
//   } catch (err) {
//     console.error("❌ Error getDistribusiBantuanPerTahun:", err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ====================================
// // 🔁 14) Menerima Bantuan Tepat 1× dalam Satu Tahun
// // ====================================
// export const getBantuanSatuKaliPerTahun = async (req, res) => {
//   try {
//     const [rows] = await pool.query(`
//       SELECT 
//         nama, 
//         nik,
//         tahun, 
//         COUNT(*) AS jumlah_bantuan
//       FROM data_bantuan_umkm
//       WHERE tahun IS NOT NULL AND tahun <> ''
//       GROUP BY nama, nik, tahun
//       HAVING COUNT(*) = 1
//       ORDER BY tahun, nama;
//     `);

//     res.json({ success: true, total: rows.length, data: rows });
//   } catch (err) {
//     console.error("❌ Error getBantuanSatuKaliPerTahun:", err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ====================================
// // ♻️ 15) Menerima Bantuan >1× dalam Satu Tahun (dengan daftar jenis)
// // ====================================
// export const getBantuanGandaPerTahun = async (req, res) => {
//   try {
//     const [rows] = await pool.query(`
//       SELECT 
//         nama,
//         nik,
//         tahun,
//         GROUP_CONCAT(DISTINCT jenis_alat_bantu SEPARATOR ', ') AS daftar_jenis_bantuan,
//         COUNT(*) AS jumlah_bantuan
//       FROM data_bantuan_umkm
//       WHERE tahun IS NOT NULL AND tahun <> ''
//       GROUP BY nama, nik, tahun
//       HAVING COUNT(*) > 1
//       ORDER BY tahun ASC, jumlah_bantuan DESC, nama ASC;
//     `);

//     res.json({ success: true, total: rows.length, data: rows });
//   } catch (err) {
//     console.error("❌ Error getBantuanGandaPerTahun:", err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

import pool from "../config/db.js";

/* ================================================================
   🧩 1. STATISTIK UMKM
================================================================ */
export const getUMKMSummary = async (req, res) => {
  try {
    const [[jumlahUmkm]] = await pool.query(`
      SELECT COUNT(*) AS total_umkm FROM data_umkm;
    `);

    const [duplikat] = await pool.query(`
      SELECT nama, nama_usaha, COUNT(*) AS jumlah
      FROM data_umkm
      WHERE nama != '' AND nama_usaha != ''
      GROUP BY nama, nama_usaha
      HAVING COUNT(*) > 1;
    `);

    const [belumLengkap] = await pool.query(`
      SELECT id, nama, nama_usaha, kecamatan, desa
      FROM data_umkm
      WHERE nama = '' OR jenis_kelamin = '' OR nama_usaha = ''
         OR alamat = '' OR kecamatan = '' OR desa = ''
         OR longitude = '' OR latitude = '' OR jenis_ukm = '' OR nib = '';
    `);

    res.json({
      success: true,
      data: {
        total_umkm: jumlahUmkm.total_umkm,
        total_duplikat: duplikat.length,
        total_belum_lengkap: belumLengkap.length,
      },
    });
  } catch (err) {
    console.error("❌ getUMKMSummary:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUMKMList = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;

    // 🔹 Ambil semua kolom dari tabel data_umkm
    const [rows] = await pool.query(
      `
      SELECT 
        id,
        nama,
        jenis_kelamin,
        nama_usaha,
        alamat,
        kecamatan,
        desa,
        longitude,
        latitude,
        jenis_ukm,
        nib
      FROM data_umkm
      ORDER BY id ASC
      LIMIT ? OFFSET ?;
      `,
      [parseInt(limit), parseInt(offset)]
    );

    // 🔹 Hitung total semua data
    const [[{ total }]] = await pool.query(`
      SELECT COUNT(*) AS total FROM data_umkm;
    `);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
      },
    });
  } catch (err) {
    console.error("❌ getUMKMList:", err.message);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


/* ================================================================
   🎁 2. STATISTIK BANTUAN (total & coverage)
================================================================ */
export const getBantuanSummary = async (req, res) => {
  try {
    const [[jumlahBantuan]] = await pool.query(`
      SELECT COUNT(*) AS jumlah_penerima FROM data_bantuan_umkm;
    `);

    const [[persentase]] = await pool.query(`
      SELECT 
        COUNT(DISTINCT dbu.nama) AS jumlah_umkm_dapat_bantuan,
        (SELECT COUNT(DISTINCT nama) FROM data_umkm) AS total_umkm_terdaftar,
        ROUND(
          COUNT(DISTINCT dbu.nama) * 100.0 / 
          (SELECT COUNT(DISTINCT nama) FROM data_umkm),
        2) AS persentase_dapat_bantuan
      FROM data_bantuan_umkm AS dbu
      WHERE dbu.nama IS NOT NULL AND dbu.nama <> '';
    `);

    res.json({
      success: true,
      data: {
        total_penerima: jumlahBantuan.jumlah_penerima,
        jumlah_umkm_dapat_bantuan: persentase.jumlah_umkm_dapat_bantuan,
        total_umkm_terdaftar: persentase.total_umkm_terdaftar,
        persentase_dapat_bantuan: persentase.persentase_dapat_bantuan,
      },
    });
  } catch (err) {
    console.error("❌ getBantuanSummary:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBantuanList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(`
      SELECT * FROM data_bantuan_umkm
      ORDER BY id DESC
      LIMIT ? OFFSET ?;
    `, [limit, offset]);

    const [[{ total }]] = await pool.query(`
      SELECT COUNT(*) AS total FROM data_bantuan_umkm;
    `);

    res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("❌ getBantuanList:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};


/* ================================================================
   🧾 3. PROFIL BANTUAN (lengkap / belum lengkap)
================================================================ */
export const getBantuanProfil = async (req, res) => {
  const { status } = req.query;
  try {
    let query = "";

    if (status === "lengkap") {
      // ✅ data lengkap dan valid (ada PIRT + Halal)
      query = `
        SELECT * FROM data_bantuan_umkm
        WHERE 
          nama IS NOT NULL AND TRIM(nama) <> '' AND nama <> 'NULL' AND
          nik IS NOT NULL AND TRIM(nik) <> '' AND nik <> 'NULL' AND
          nama_produk IS NOT NULL AND TRIM(nama_produk) <> '' AND nama_produk <> 'NULL' AND
          nama_umkm IS NOT NULL AND TRIM(nama_umkm) <> '' AND nama_umkm <> 'NULL' AND
          alamat IS NOT NULL AND TRIM(alamat) <> '' AND alamat <> 'NULL' AND
          kecamatan IS NOT NULL AND TRIM(kecamatan) <> '' AND kecamatan <> 'NULL' AND
          no_hp IS NOT NULL AND TRIM(no_hp) <> '' AND no_hp <> 'NULL' AND
          nib IS NOT NULL AND TRIM(nib) <> '' AND nib <> 'NULL' AND
          no_pirt IS NOT NULL AND TRIM(no_pirt) <> '' AND no_pirt <> 'NULL' AND
          no_halal IS NOT NULL AND TRIM(no_halal) <> '' AND no_halal <> 'NULL' AND
          jenis_alat_bantu IS NOT NULL AND TRIM(jenis_alat_bantu) <> '' AND jenis_alat_bantu <> 'NULL' AND
          tahun IS NOT NULL AND TRIM(tahun) <> '' AND tahun <> 'NULL' AND
          keterangan IS NOT NULL AND TRIM(keterangan) <> '' AND keterangan <> 'NULL'
          AND (
              UPPER(no_pirt) LIKE 'PIRT%' OR
              UPPER(no_pirt) LIKE 'P-IRT%' OR
              UPPER(no_pirt) LIKE 'P IRT%'
          )
          AND (
              no_halal NOT LIKE '0' AND 
              no_halal NOT LIKE '-'
          );
      `;
    } else {
      // ⚠️ data belum lengkap (NULL / kosong / 'NULL')
      query = `
        SELECT id, nama, nama_umkm, kecamatan, keterangan
        FROM data_bantuan_umkm
        WHERE 
          nama IS NULL OR TRIM(nama) = '' OR nama = 'NULL' OR
          nik IS NULL OR TRIM(nik) = '' OR nik = 'NULL' OR
          nama_produk IS NULL OR TRIM(nama_produk) = '' OR nama_produk = 'NULL' OR
          nama_umkm IS NULL OR TRIM(nama_umkm) = '' OR nama_umkm = 'NULL' OR
          alamat IS NULL OR TRIM(alamat) = '' OR alamat = 'NULL' OR
          kecamatan IS NULL OR TRIM(kecamatan) = '' OR kecamatan = 'NULL' OR
          no_hp IS NULL OR TRIM(no_hp) = '' OR no_hp = 'NULL' OR
          nib IS NULL OR TRIM(nib) = '' OR nib = 'NULL' OR
          no_pirt IS NULL OR TRIM(no_pirt) = '' OR no_pirt = 'NULL' OR
          no_halal IS NULL OR TRIM(no_halal) = '' OR no_halal = 'NULL' OR
          jenis_alat_bantu IS NULL OR TRIM(jenis_alat_bantu) = '' OR jenis_alat_bantu = 'NULL' OR
          tahun IS NULL OR TRIM(tahun) = '' OR tahun = 'NULL' OR
          keterangan IS NULL OR TRIM(keterangan) = '' OR keterangan = 'NULL';
      `;
    }

    const [rows] = await pool.query(query);

    res.json({
      success: true,
      status: status === "lengkap" ? "Lengkap & Valid" : "Belum Lengkap",
      total: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("❌ Error getBantuanProfil:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};


/* ================================================================
   🧮 4. DATA TIDAK TERDAFTAR (detail / ringkasan / total)
================================================================ */
export const getBantuanTidakTerdaftar = async (req, res) => {
  const { mode } = req.query;
  try {
    let query = "";

    if (mode === "detail") {
      query = `
        SELECT dbu.* 
        FROM data_bantuan_umkm AS dbu
        LEFT JOIN data_umkm AS ui ON TRIM(UPPER(dbu.nama)) = TRIM(UPPER(ui.nama))
        WHERE ui.nama IS NULL
        ORDER BY dbu.tahun ASC, dbu.kecamatan ASC;
      `;
    } else if (mode === "ringkasan") {
      query = `
        SELECT dbu.tahun, COUNT(*) AS jumlah_tidak_terdaftar
        FROM data_bantuan_umkm AS dbu
        LEFT JOIN data_umkm AS ui ON TRIM(UPPER(dbu.nama)) = TRIM(UPPER(ui.nama))
        WHERE ui.nama IS NULL
        GROUP BY dbu.tahun
        ORDER BY dbu.tahun ASC;
      `;
    } else {
      query = `
        SELECT COUNT(*) AS total_tidak_terdaftar
        FROM data_bantuan_umkm AS dbu
        LEFT JOIN data_umkm AS ui ON TRIM(UPPER(dbu.nama)) = TRIM(UPPER(ui.nama))
        WHERE ui.nama IS NULL;
      `;
    }

    const [rows] = await pool.query(query);
    res.json({
      success: true,
      mode,
      total: rows.length || rows[0]?.total_tidak_terdaftar || 0,
      data: rows,
    });
  } catch (err) {
    console.error("❌ getBantuanTidakTerdaftar:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================================================================
   📊 5. ANALISIS TAHUNAN (valid / distribusi / 1x / ganda)
================================================================ */
export const getAnalisisTahunan = async (req, res) => {
  const { tipe } = req.query;
  try {
    let query = "";

    switch (tipe) {
      case "valid":
        query = `
          SELECT tahun, COUNT(*) AS jumlah_bantuan_valid
          FROM data_bantuan_umkm
          WHERE nama != '' AND nik != '' AND nama_produk != '' AND
                nama_umkm != '' AND alamat != '' AND kecamatan != '' AND
                no_hp != '' AND nib != '' AND jenis_alat_bantu != '' AND
                tahun != '' AND keterangan != ''
                AND (UPPER(no_pirt) LIKE 'PIRT%' OR UPPER(no_pirt) LIKE 'P-IRT%' OR UPPER(no_pirt) LIKE 'P IRT%')
                AND (no_halal NOT LIKE '0' AND no_halal NOT LIKE '-' AND no_halal != '')
          GROUP BY tahun ORDER BY tahun ASC;
        `;
        break;

      case "distribusi":
        query = `
          SELECT tahun, jenis_alat_bantu, COUNT(*) AS jumlah_penerima
          FROM data_bantuan_umkm
          WHERE jenis_alat_bantu != ''
          GROUP BY tahun, jenis_alat_bantu
          ORDER BY tahun ASC, jumlah_penerima DESC;
        `;
        break;

      case "1x":
        query = `
          SELECT nama, nik, tahun, COUNT(*) AS jumlah_bantuan
          FROM data_bantuan_umkm
          WHERE tahun != ''
          GROUP BY nama, nik, tahun
          HAVING COUNT(*) = 1
          ORDER BY tahun, nama;
        `;
        break;

      case "ganda":
        query = `
          SELECT nama, nik, tahun,
                 GROUP_CONCAT(DISTINCT jenis_alat_bantu SEPARATOR ', ') AS daftar_jenis_bantuan,
                 COUNT(*) AS jumlah_bantuan
          FROM data_bantuan_umkm
          WHERE tahun != ''
          GROUP BY nama, nik, tahun
          HAVING COUNT(*) > 1
          ORDER BY tahun ASC, jumlah_bantuan DESC, nama ASC;
        `;
        break;

      default:
        return res.status(400).json({ success: false, message: "Parameter tipe tidak valid" });
    }

    const [rows] = await pool.query(query);
    res.json({ success: true, tipe, total: rows.length, data: rows });
  } catch (err) {
    console.error("❌ getAnalisisTahunan:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
