import pool from "../config/db.js";

/* ================================================================
   🧩 1. STATISTIK UMKM
================================================================ */
export const getUMKMSummary = async (req, res) => {
  try {
    // 🔹 Total seluruh UMKM
    const [[jumlahUmkm]] = await pool.query(`
      SELECT COUNT(*) AS total_umkm FROM data_umkm;
    `);

    // 🔹 UMKM yang datanya belum lengkap (ada kolom kosong/null penting)
    const [[belumLengkap]] = await pool.query(`
      SELECT COUNT(*) AS total_belum_lengkap
      FROM data_umkm
      WHERE 
        nama = '' OR nama IS NULL OR
        jenis_kelamin = '' OR jenis_kelamin IS NULL OR
        nama_usaha = '' OR nama_usaha IS NULL OR
        alamat = '' OR alamat IS NULL OR
        kecamatan = '' OR kecamatan IS NULL OR
        desa = '' OR desa IS NULL OR
        longitude = '' OR longitude IS NULL OR
        latitude = '' OR latitude IS NULL OR
        jenis_ukm = '' OR jenis_ukm IS NULL OR
        nib = '' OR nib IS NULL;
    `);

    // 🔹 UMKM yang lengkap
    const totalLengkap = jumlahUmkm.total_umkm - belumLengkap.total_belum_lengkap;

    // 🔹 Kirim hasil
    res.json({
      success: true,
      data: {
        total_umkm: jumlahUmkm.total_umkm,
        total_lengkap: totalLengkap,
        total_belum_lengkap: belumLengkap.total_belum_lengkap,
        analisis: {
          keterangan:
            "Data ini menunjukkan total UMKM yang terdaftar serta kelengkapan datanya berdasarkan pengisian kolom penting seperti nama, alamat, lokasi, dan NIB.",
          sumber_data: ["data_umkm"],
          dasar_perhitungan: {
            total_umkm:
              "Jumlah seluruh UMKM yang tercatat di tabel data_umkm.",
            total_lengkap:
              "Jumlah UMKM yang sudah mengisi semua kolom penting (nama, usaha, alamat, kecamatan, desa, lokasi, jenis UKM, dan NIB).",
            total_belum_lengkap:
              "Jumlah UMKM yang masih memiliki kolom kosong atau belum diisi dengan lengkap."
          },
          catatan:
            "Kolom yang diperiksa antara lain: nama, jenis_kelamin, nama_usaha, alamat, kecamatan, desa, longitude, latitude, jenis_ukm, dan nib."
        }
      }
    });
  } catch (err) {
    console.error("❌ getUMKMSummary:", err.message);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data UMKM summary.",
      error: err.message
    });
  }
};



export const getUMKMList = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      search = "",
      kecamatan = "",
      desa = "",
      jenis_ukm = "",
    } = req.query;

    const offset = (page - 1) * limit;
    const params = [];

    // 🧩 Base Query
    let sql = `
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
      WHERE 1=1
    `;

    // 🔎 CASE INSENSITIVE SEARCH FIX
    if (search) {
      sql += `
        AND (
          LOWER(nama) LIKE ? OR
          LOWER(nama_usaha) LIKE ? OR
          LOWER(nib) LIKE ? OR
          LOWER(alamat) LIKE ? OR
          LOWER(kecamatan) LIKE ? OR
          LOWER(desa) LIKE ? OR
          LOWER(jenis_ukm) LIKE ?
        )
      `;
      const s = `%${search.toLowerCase()}%`;
      for (let i = 0; i < 7; i++) params.push(s);
    }

    // 🔍 Filter tambahan
    if (kecamatan) {
      sql += ` AND LOWER(kecamatan) = ?`;
      params.push(kecamatan.toLowerCase());
    }

    if (desa) {
      sql += ` AND LOWER(desa) = ?`;
      params.push(desa.toLowerCase());
    }

    if (jenis_ukm) {
      sql += ` AND LOWER(jenis_ukm) = ?`;
      params.push(jenis_ukm.toLowerCase());
    }

    // 🔢 Order & Limit
    sql += ` ORDER BY id ASC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(sql, params);

    // 🧮 Hitung total hasil
    let countQuery = `
      SELECT COUNT(*) AS total
      FROM data_umkm
      WHERE 1=1
    `;
    const countParams = [];

    if (search) {
      countQuery += `
        AND (
          LOWER(nama) LIKE ? OR
          LOWER(nama_usaha) LIKE ? OR
          LOWER(nib) LIKE ? OR
          LOWER(alamat) LIKE ? OR
          LOWER(kecamatan) LIKE ? OR
          LOWER(desa) LIKE ? OR
          LOWER(jenis_ukm) LIKE ?
        )
      `;
      const s = `%${search.toLowerCase()}%`;
      for (let i = 0; i < 7; i++) countParams.push(s);
    }

    if (kecamatan) {
      countQuery += ` AND LOWER(kecamatan) = ?`;
      countParams.push(kecamatan.toLowerCase());
    }

    if (desa) {
      countQuery += ` AND LOWER(desa) = ?`;
      countParams.push(desa.toLowerCase());
    }

    if (jenis_ukm) {
      countQuery += ` AND LOWER(jenis_ukm) = ?`;
      countParams.push(jenis_ukm.toLowerCase());
    }

    const [[{ total }]] = await pool.query(countQuery, countParams);
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
    console.error("❌ getUMKMList Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat mengambil data UMKM.",
    });
  }
};

export const getUMKMFilters = async (req, res) => {
  try {
    const [kecamatanRows] = await pool.query(`
      SELECT DISTINCT kecamatan FROM data_umkm 
      WHERE kecamatan IS NOT NULL AND kecamatan <> '' 
      ORDER BY kecamatan ASC;
    `);

    const [desaRows] = await pool.query(`
      SELECT DISTINCT desa FROM data_umkm 
      WHERE desa IS NOT NULL AND desa <> '' 
      ORDER BY desa ASC;
    `);

    const [jenisRows] = await pool.query(`
      SELECT DISTINCT jenis_ukm FROM data_umkm 
      WHERE jenis_ukm IS NOT NULL AND jenis_ukm <> '' 
      ORDER BY jenis_ukm ASC;
    `);

    res.json({
      success: true,
      data: {
        kecamatan: kecamatanRows.map((r) => r.kecamatan),
        desa: desaRows.map((r) => r.desa),
        jenis_ukm: jenisRows.map((r) => r.jenis_ukm),
      },
    });
  } catch (err) {
    console.error("❌ getUMKMFilters:", err.message);
    res.status(500).json({
      success: false,
      message: "Gagal memuat data filter.",
    });
  }
};

// ===============================
// 🔹 GET DETAIL UMKM DUPLIKAT
// ===============================
// ===============================
// 🔹 GET SUMMARY UMKM DUPLIKAT
// ===============================
export const getUMKMDuplikatSummary = async (req, res) => {
  try {
    // === 1️⃣ Duplikat berdasarkan kombinasi utama (nama + usaha + kecamatan + desa)
    const [comboDuplikat] = await pool.query(`
      SELECT 
        COUNT(*) AS total_duplikat_group,
        SUM(jumlah) AS total_record_duplikat,
        SUM(jumlah - 1) AS total_kelebihan_duplikat
      FROM (
        SELECT COUNT(*) AS jumlah
        FROM data_umkm
        WHERE nama != '' AND nama_usaha != ''
        GROUP BY nama, nama_usaha, kecamatan, desa
        HAVING COUNT(*) > 1
      ) AS t;
    `);

    // === 2️⃣ Duplikat berdasarkan nama saja
    const [namaDuplikat] = await pool.query(`
      SELECT 
        COUNT(*) AS total_group,
        SUM(jumlah) AS total_record
      FROM (
        SELECT COUNT(*) AS jumlah
        FROM data_umkm
        WHERE nama != ''
        GROUP BY nama
        HAVING COUNT(*) > 1
      ) AS t;
    `);

    // === 3️⃣ Duplikat berdasarkan nama_usaha saja
    const [usahaDuplikat] = await pool.query(`
      SELECT 
        COUNT(*) AS total_group,
        SUM(jumlah) AS total_record
      FROM (
        SELECT COUNT(*) AS jumlah
        FROM data_umkm
        WHERE nama_usaha != ''
        GROUP BY nama_usaha
        HAVING COUNT(*) > 1
      ) AS t;
    `);

    // === 4️⃣ Gabungkan hasil ke satu response
    res.json({
      success: true,
      data: {
        indikasi: {
          kombinasi_nama_usaha_wilayah: {
            keterangan: "Duplikasi kombinasi nama + nama_usaha + kecamatan + desa",
            total_duplikat_group: comboDuplikat[0].total_duplikat_group || 0,
            total_record_duplikat: comboDuplikat[0].total_record_duplikat || 0,
            total_kelebihan_duplikat: comboDuplikat[0].total_kelebihan_duplikat || 0
          },
          nama_saja: {
            keterangan: "Nama sama, walau usaha/kecamatan berbeda",
            total_duplikat_group: namaDuplikat[0].total_group || 0,
            total_record_duplikat: namaDuplikat[0].total_record || 0
          },
          nama_usaha_saja: {
            keterangan: "Nama usaha sama, walau nama pelaku berbeda",
            total_duplikat_group: usahaDuplikat[0].total_group || 0,
            total_record_duplikat: usahaDuplikat[0].total_record || 0
          }
        }
      }
    });
  } catch (err) {
    console.error("❌ getUMKMDuplikatSummary:", err.message);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil summary UMKM duplikat."
    });
  }
};




// ===============================
// 🔹 GET LIST DETAIL UMKM DUPLIKAT
// ===============================
// ✅ Controller: getUMKMDuplikatList








/* ================================================================
   🎁 2. STATISTIK BANTUAN (total & coverage)
================================================================ */
export const getBantuanSummary = async (req, res) => {
  try {
    // 🔹 Total semua penerima bantuan
    const [[jumlahBantuan]] = await pool.query(`
      SELECT COUNT(*) AS jumlah_penerima 
      FROM data_bantuan_umkm;
    `);

    // 🔹 Total UMKM unik yang dapat bantuan + persentase
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

    // 🔹 Profil Lengkap (semua kolom penting terisi)
    const [[lengkap]] = await pool.query(`
      SELECT COUNT(*) AS total_lengkap
      FROM data_bantuan_umkm
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
        keterangan IS NOT NULL AND TRIM(keterangan) <> '' AND keterangan <> 'NULL';
    `);

    // 🔹 Profil Lengkap & Valid (ada PIRT + Halal valid)
    const [[lengkapValid]] = await pool.query(`
      SELECT COUNT(*) AS total_lengkap_valid
      FROM data_bantuan_umkm
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
            no_halal NOT LIKE '-' AND 
            no_halal NOT LIKE ''
        );
    `);

    // 🔹 Profil belum lengkap
    const total_belum_lengkap =
      jumlahBantuan.jumlah_penerima - lengkap.total_lengkap;

    // 🔹 Kirim hasil
    res.json({
      success: true,
      data: {
        total_penerima: jumlahBantuan.jumlah_penerima,
        jumlah_umkm_dapat_bantuan: persentase.jumlah_umkm_dapat_bantuan,
        total_umkm_terdaftar: persentase.total_umkm_terdaftar,
        persentase_dapat_bantuan: persentase.persentase_dapat_bantuan,
        total_lengkap: lengkap.total_lengkap,
        total_lengkap_valid: lengkapValid.total_lengkap_valid,
        total_belum_lengkap: total_belum_lengkap,
        analisis: {
          keterangan:
            "Data ini menampilkan jumlah penerima bantuan serta tingkat kelengkapan dan validitas profil bantuan (berdasarkan pengisian kolom wajib, PIRT, dan Halal).",
          sumber_data: ["data_bantuan_umkm", "data_umkm"],
          dasar_perhitungan: {
            total_penerima:
              "Jumlah seluruh penerima bantuan (bisa termasuk yang dapat lebih dari satu kali).",
            jumlah_umkm_dapat_bantuan:
              "Jumlah UMKM unik yang sudah pernah menerima bantuan.",
            total_lengkap:
              "Jumlah penerima bantuan yang telah mengisi semua kolom penting seperti nama, NIK, alamat, produk, dan izin usaha.",
            total_lengkap_valid:
              "Jumlah penerima bantuan yang datanya lengkap serta memiliki PIRT dan sertifikat halal yang valid.",
            total_belum_lengkap:
              "Jumlah penerima bantuan yang masih memiliki kolom kosong atau data tidak lengkap.",
            persentase_dapat_bantuan:
              "Perbandingan antara jumlah UMKM yang sudah mendapat bantuan dengan total UMKM terdaftar di sistem."
          },
          catatan:
            "Kolom yang dicek: nama, nik, nama_produk, nama_umkm, alamat, kecamatan, no_hp, nib, no_pirt, no_halal, jenis_alat_bantu, tahun, dan keterangan. Untuk status valid, dicek juga format PIRT dan keabsahan nomor Halal."
        }
      }
    });

  } catch (err) {
    console.error("❌ getBantuanSummary:", err.message);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data summary bantuan.",
      error: err.message
    });
  }
};



export const getUMKMDuplikatByType = async (req, res) => {
  const { type = "kombinasi", page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let queryGroup = "";
    let label = "";
    
    // ==============================
    // 🔹 Pilih tipe duplikasi
    // ==============================
    switch (type) {
      case "nama":
        queryGroup = `
          SELECT nama, COUNT(*) AS jumlah
          FROM data_umkm
          WHERE nama != ''
          GROUP BY nama
          HAVING COUNT(*) > 1
          ORDER BY jumlah DESC
          LIMIT ? OFFSET ?;
        `;
        label = "Nama sama, walau usaha/kecamatan berbeda";
        break;

      case "usaha":
        queryGroup = `
          SELECT nama_usaha, COUNT(*) AS jumlah
          FROM data_umkm
          WHERE nama_usaha != ''
          GROUP BY nama_usaha
          HAVING COUNT(*) > 1
          ORDER BY jumlah DESC
          LIMIT ? OFFSET ?;
        `;
        label = "Nama usaha sama, walau nama pelaku berbeda";
        break;

      case "kombinasi":
      default:
        queryGroup = `
          SELECT nama, nama_usaha, kecamatan, desa, COUNT(*) AS jumlah
          FROM data_umkm
          WHERE nama != '' AND nama_usaha != ''
          GROUP BY nama, nama_usaha, kecamatan, desa
          HAVING COUNT(*) > 1
          ORDER BY jumlah DESC
          LIMIT ? OFFSET ?;
        `;
        label = "Duplikasi kombinasi nama + nama_usaha + kecamatan + desa";
        break;
    }

    // ==============================
    // 🔹 Ambil grup duplikat sesuai tipe
    // ==============================
    const [groups] = await pool.query(queryGroup, [Number(limit), Number(offset)]);

    if (groups.length === 0) {
      return res.json({
        success: true,
        pagination: {
          current_page: Number(page),
          per_page: Number(limit),
          total_group: 0
        },
        data: [],
        keterangan: label
      });
    }

    // ==============================
    // 🔹 Buat kondisi untuk ambil data aslinya
    // ==============================
    let kondisi = "";

    if (type === "nama") {
      kondisi = groups.map(g => `nama = ${pool.escape(g.nama)}`).join(" OR ");
    } else if (type === "usaha") {
      kondisi = groups.map(g => `nama_usaha = ${pool.escape(g.nama_usaha)}`).join(" OR ");
    } else {
      kondisi = groups.map(g => `
        (nama = ${pool.escape(g.nama)} 
         AND nama_usaha = ${pool.escape(g.nama_usaha)} 
         AND kecamatan = ${pool.escape(g.kecamatan)} 
         AND desa = ${pool.escape(g.desa)})
      `).join(" OR ");
    }

    // ==============================
    // 🔹 Ambil data detail duplikat
    // ==============================
    const [duplikatData] = await pool.query(`
      SELECT 
        id, nama, jenis_kelamin, nama_usaha, alamat,
        kecamatan, desa, longitude, latitude, jenis_ukm, nib
      FROM data_umkm
      WHERE ${kondisi}
      ORDER BY nama, nama_usaha;
    `);

    // ==============================
    // 🔹 Kirim response
    // ==============================
    res.json({
      success: true,
      pagination: {
        current_page: Number(page),
        per_page: Number(limit),
        total_group: groups.length
      },
      keterangan: label,
      data: duplikatData
    });

  } catch (err) {
    console.error("❌ getUMKMDuplikatByType:", err.message);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data UMKM duplikat berdasarkan tipe."
    });
  }
};


export const getBantuanList = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      search = "",
      kecamatan = "",
      jenis_alat_bantu = "",
      tahun = "",
      keterangan = "",
      status_profil = "", // ✅ Tambahan baru
    } = req.query;

    const offset = (page - 1) * limit;
    const params = [];

    // 🧱 Base query
    let sql = `
      SELECT 
        id,
        nama,
        nik,
        nama_produk,
        nama_umkm,
        alamat,
        kecamatan,
        no_hp,
        nib,
        no_pirt,
        no_halal,
        jenis_alat_bantu,
        tahun,
        keterangan
      FROM data_bantuan_umkm
      WHERE 1=1
    `;

    // 🔍 Global search
    if (search) {
      sql += ` AND (
        nama LIKE ? OR 
        nama_umkm LIKE ? OR 
        nama_produk LIKE ? OR 
        nik LIKE ?
      )`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    // 🔎 Filter tambahan biasa
    if (kecamatan) {
      sql += ` AND kecamatan = ?`;
      params.push(kecamatan);
    }

    if (jenis_alat_bantu) {
      sql += ` AND jenis_alat_bantu = ?`;
      params.push(jenis_alat_bantu);
    }

    if (tahun) {
      sql += ` AND tahun = ?`;
      params.push(tahun);
    }

    if (keterangan) {
      sql += ` AND keterangan = ?`;
      params.push(keterangan);
    }

    // 🧠 Filter berdasarkan status profil (dari analisis summary)
    if (status_profil === "lengkap") {
      sql += `
        AND (
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
        )
      `;
    } else if (status_profil === "lengkap_valid") {
      sql += `
        AND (
          nama IS NOT NULL AND TRIM(nama) <> '' AND
          nik IS NOT NULL AND TRIM(nik) <> '' AND
          nama_produk IS NOT NULL AND TRIM(nama_produk) <> '' AND
          nama_umkm IS NOT NULL AND TRIM(nama_umkm) <> '' AND
          alamat IS NOT NULL AND TRIM(alamat) <> '' AND
          kecamatan IS NOT NULL AND TRIM(kecamatan) <> '' AND
          no_hp IS NOT NULL AND TRIM(no_hp) <> '' AND
          nib IS NOT NULL AND TRIM(nib) <> '' AND
          no_pirt IS NOT NULL AND TRIM(no_pirt) <> '' AND
          no_halal IS NOT NULL AND TRIM(no_halal) <> '' AND
          jenis_alat_bantu IS NOT NULL AND TRIM(jenis_alat_bantu) <> '' AND
          tahun IS NOT NULL AND TRIM(tahun) <> '' AND
          keterangan IS NOT NULL AND TRIM(keterangan) <> '' AND
          (
            UPPER(no_pirt) LIKE 'PIRT%' OR
            UPPER(no_pirt) LIKE 'P-IRT%' OR
            UPPER(no_pirt) LIKE 'P IRT%'
          ) AND (
            no_halal NOT LIKE '0' AND 
            no_halal NOT LIKE '-' AND 
            no_halal NOT LIKE ''
          )
        )
      `;
    } else if (status_profil === "belum_lengkap") {
      sql += `
        AND (
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
          keterangan IS NULL OR TRIM(keterangan) = '' OR keterangan = 'NULL'
        )
      `;
    }

    // 🔢 Order & pagination
    sql += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    // Eksekusi query utama
    const [rows] = await pool.query(sql, params);

    // 🧮 Hitung total data
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM (${sql.replace(
        /ORDER BY id DESC LIMIT \? OFFSET \?/,
        ""
      )}) AS subquery`,
      params.slice(0, -2) // remove limit & offset
    );

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
    console.error("❌ getBantuanList:", err.message);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat mengambil data bantuan.",
    });
  }
};


export const getBantuanFilters = async (req, res) => {
  try {
    // 🔹 Ambil daftar kecamatan unik
    const [kecamatanRows] = await pool.query(`
      SELECT DISTINCT kecamatan 
      FROM data_bantuan_umkm 
      WHERE kecamatan IS NOT NULL AND TRIM(kecamatan) <> '' 
      ORDER BY kecamatan ASC;
    `);

    // 🔹 Ambil daftar jenis alat bantu unik
    const [jenisRows] = await pool.query(`
      SELECT DISTINCT jenis_alat_bantu 
      FROM data_bantuan_umkm 
      WHERE jenis_alat_bantu IS NOT NULL AND TRIM(jenis_alat_bantu) <> '' 
      ORDER BY jenis_alat_bantu ASC;
    `);

    // 🔹 Ambil daftar tahun unik
    const [tahunRows] = await pool.query(`
      SELECT DISTINCT tahun 
      FROM data_bantuan_umkm 
      WHERE tahun IS NOT NULL AND tahun <> '' 
      ORDER BY tahun DESC;
    `);

    // 🔹 Ambil daftar keterangan unik (misal: UNGGULAN, BUKAN UNGGULAN)
    const [keteranganRows] = await pool.query(`
      SELECT DISTINCT keterangan 
      FROM data_bantuan_umkm 
      WHERE keterangan IS NOT NULL AND TRIM(keterangan) <> '' 
      ORDER BY keterangan ASC;
    `);

    // 🔹 Tambahan status profil (bukan dari DB, tapi predefined)
    const statusProfilOptions = [
      { value: "", label: "Semua Profil" },
      { value: "lengkap_valid", label: "Lengkap & Valid" },
      { value: "lengkap", label: "Lengkap" },
      { value: "belum_lengkap", label: "Belum Lengkap" },
    ];

    // ✅ Kirim hasil lengkap
    res.json({
      success: true,
      data: {
        kecamatan: kecamatanRows.map((r) => r.kecamatan),
        jenis_alat_bantu: jenisRows.map((r) => r.jenis_alat_bantu),
        tahun: tahunRows.map((r) => r.tahun),
        keterangan: keteranganRows.map((r) => r.keterangan),
        status_profil: statusProfilOptions,
      },
    });
  } catch (err) {
    console.error("❌ getBantuanFilters:", err.message);
    res.status(500).json({
      success: false,
      message: "Gagal memuat data filter bantuan.",
      error: err.message,
    });
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
