import pool from "../config/db.js";

export const getKoperasiSummary = async (req, res) => {
  try {
    // =============================
    // 1. TOTAL KOPERASI
    // =============================
    const [[total]] = await pool.query(`
      SELECT COUNT(*) AS total_koperasi
      FROM data_koperasi
    `);

    // =============================
    // 2. TOTAL AKTIF
    // =============================
    const [[aktif]] = await pool.query(`
      SELECT COUNT(*) AS total_aktif
      FROM data_koperasi
      WHERE LOWER(TRIM(COALESCE(status_koperasi, ''))) 
      IN ('aktif','1','ya','yes','true')
    `);

    // =============================
    // 3. TOTAL NONAKTIF
    // =============================
    const [[nonaktif]] = await pool.query(`
      SELECT COUNT(*) AS total_nonaktif
      FROM data_koperasi
      WHERE NOT (
        LOWER(TRIM(COALESCE(status_koperasi, ''))) 
        IN ('aktif','1','ya','yes','true')
      )
    `);

    // =============================
    // 4. NIK VALID vs TIDAK VALID
    // =============================
    const [[nikValid]] = await pool.query(`
      SELECT COUNT(*) AS total_punya_nik
      FROM data_koperasi
      WHERE nomor_induk_koperasi IS NOT NULL
        AND TRIM(nomor_induk_koperasi) <> ''
        AND TRIM(nomor_induk_koperasi) <> '-'
        AND TRIM(nomor_induk_koperasi) <> '0'
    `);

    const [[nikInvalid]] = await pool.query(`
      SELECT COUNT(*) AS total_tanpa_nik
      FROM data_koperasi
      WHERE nomor_induk_koperasi IS NULL
        OR TRIM(nomor_induk_koperasi) = ''
        OR TRIM(nomor_induk_koperasi) = '-'
        OR TRIM(nomor_induk_koperasi) = '0'
    `);

    // =============================
    // 5. KELENGKAPAN DATA
    // (tanpa grade_koperasi )
    // =============================
    const [[lengkap]] = await pool.query(`
      SELECT COUNT(*) AS total_lengkap
      FROM data_koperasi
      WHERE 
          nomor_induk_koperasi IS NOT NULL AND TRIM(nomor_induk_koperasi) <> '' AND TRIM(nomor_induk_koperasi) <> '-'
      AND nama_koperasi IS NOT NULL AND TRIM(nama_koperasi) <> ''
      AND jenis_koperasi IS NOT NULL AND TRIM(jenis_koperasi) <> ''
      AND bentuk_koperasi IS NOT NULL AND TRIM(bentuk_koperasi) <> ''
      AND kelurahan IS NOT NULL AND TRIM(kelurahan) <> ''
      AND kecamatan IS NOT NULL AND TRIM(kecamatan) <> ''
      AND kelompok_koperasi IS NOT NULL AND TRIM(kelompok_koperasi) <> ''
      AND status_koperasi IS NOT NULL AND TRIM(status_koperasi) <> ''
      AND alamat_lengkap IS NOT NULL AND TRIM(alamat_lengkap) <> ''
      AND kode_pos IS NOT NULL AND TRIM(kode_pos) <> ''
      AND email_koperasi IS NOT NULL AND TRIM(email_koperasi) <> ''
      AND kuk IS NOT NULL AND TRIM(kuk) <> '';
    `);

    const total_tidak_lengkap = total.total_koperasi - lengkap.total_lengkap;

    // =============================
    // 6. PER KECAMATAN
    // =============================
    const [perKecamatan] = await pool.query(`
      SELECT 
        COALESCE(NULLIF(TRIM(kecamatan), ''), 'Unknown') AS kecamatan,
        COUNT(*) AS total
      FROM data_koperasi
      GROUP BY COALESCE(NULLIF(TRIM(kecamatan), ''), 'Unknown')
      ORDER BY total DESC
    `);

    // =============================
    // 7. PER JENIS KOPERASI
    // =============================
    const [perJenis] = await pool.query(`
      SELECT 
        COALESCE(NULLIF(TRIM(jenis_koperasi), ''), 'Unknown') AS jenis,
        COUNT(*) AS total
      FROM data_koperasi
      GROUP BY jenis
      ORDER BY total DESC
    `);

    // =============================
    // 8. PER KEUANGAN (GRADE_KOPERASI)
    // =============================
    const [perKeuangan] = await pool.query(`
      SELECT
        CASE
          WHEN UPPER(TRIM(grade_koperasi)) = 'A' THEN 'Sehat'
          WHEN UPPER(TRIM(grade_koperasi)) = 'B' THEN 'Prihatin'
          WHEN UPPER(TRIM(grade_koperasi)) = 'C' THEN 'Gagal'
          ELSE 'Tidak Diketahui'
        END AS kondisi_keuangan,
        COUNT(*) AS total
      FROM data_koperasi
      GROUP BY kondisi_keuangan
      ORDER BY total DESC
    `);

    // =============================
    // 9. Response JSON
    // =============================
    res.json({
      success: true,
      message: "Koperasi summary loaded",
      data: {
        total_koperasi: total.total_koperasi,
        total_aktif: aktif.total_aktif,
        total_nonaktif: nonaktif.total_nonaktif,

        kelengkapan: {
          total_lengkap: lengkap.total_lengkap,
          total_tidak_lengkap,
        },

        nik: {
          punya: nikValid.total_punya_nik,
          tidak_punya: nikInvalid.total_tanpa_nik,
        },

        per_kecamatan: perKecamatan,
        per_jenis_koperasi: perJenis,
        per_keuangan: perKeuangan,

        analisis: {
          keterangan:
            "Analisis koperasi berdasarkan status, NIK, kecamatan, jenis, dan kelengkapan data.",
          catatan: "Kelengkapan data tidak termasuk kolom grade_koperasi.",
        },
      },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data koperasi",
      error: error.message,
    });
  }
};

/**
 * GET /dashboard/koperasi-duplikat
 */
export const getKoperasiDuplikat = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100; // default limit
    const offset = parseInt(req.query.offset, 10) || 0;

    const [rows] = await pool.query(
      `
      SELECT
        TRIM(nomor_induk_koperasi) AS nomor_induk_koperasi,
        COUNT(*) AS jumlah_duplikat
      FROM data_koperasi
      WHERE nomor_induk_koperasi IS NOT NULL
        AND TRIM(nomor_induk_koperasi) <> ''
        AND TRIM(nomor_induk_koperasi) <> '-'
        AND TRIM(nomor_induk_koperasi) <> '0'
      GROUP BY TRIM(nomor_induk_koperasi)
      HAVING COUNT(*) > 1
      ORDER BY jumlah_duplikat DESC
      LIMIT ? OFFSET ?;
      `,
      [limit, offset]
    );

    const [[{ total_duplikat }]] = await pool.query(
      `
      SELECT COUNT(*) AS total_duplikat FROM (
        SELECT TRIM(nomor_induk_koperasi) AS nomor_induk_koperasi
        FROM data_koperasi
        WHERE nomor_induk_koperasi IS NOT NULL
          AND TRIM(nomor_induk_koperasi) <> ''
          AND TRIM(nomor_induk_koperasi) <> '-'
          AND TRIM(nomor_induk_koperasi) <> '0'
        GROUP BY TRIM(nomor_induk_koperasi)
        HAVING COUNT(*) > 1
      ) x;
      `
    );

    return res.json({
      success: true,
      data: {
        total_duplikat,
        rows,
      },
    });
  } catch (error) {
    console.error("Error getKoperasiDuplikat:", error);
    return res.status(500).json({ success: false, message: "Gagal mengambil data duplikat", error: error.message });
  }
};

/**
 * GET /dashboard/koperasi-duplikat/details?nik=<nik>&page=1&limit=50
 */
export const getKoperasiDuplikatDetails = async (req, res) => {
  try {
    const nik = (req.query.nik || "").trim();
    if (!nik) {
      return res.status(400).json({ success: false, message: "Parameter 'nik' diperlukan" });
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 1000);
    const offset = (page - 1) * limit;

    const [[{ total_rows }]] = await pool.query(
      `SELECT COUNT(*) AS total_rows FROM data_koperasi WHERE TRIM(nomor_induk_koperasi) = ?`,
      [nik]
    );

    const [rows] = await pool.query(
      `SELECT * FROM data_koperasi WHERE TRIM(nomor_induk_koperasi) = ? ORDER BY kecamatan, nama_koperasi LIMIT ? OFFSET ?`,
      [nik, limit, offset]
    );

    return res.json({
      success: true,
      data: {
        nik,
        total_rows,
        page,
        limit,
        rows,
      },
    });
  } catch (error) {
    console.error("Error getKoperasiDuplikatDetails:", error);
    return res.status(500).json({ success: false, message: "Gagal mengambil detail duplikat", error: error.message });
  }
};

/**
 * GET /api/koperasi  (paginated + search)
 */
export const getKoperasiList = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 1000);
    const offset = (page - 1) * limit;
    const q = (req.query.q || "").trim();

    let whereClauses = [];
    let params = [];

    if (q) {
      whereClauses.push(`(
        LOWER(COALESCE(nama_koperasi, '')) LIKE ?
        OR LOWER(COALESCE(nomor_induk_koperasi, '')) LIKE ?
        OR LOWER(COALESCE(kecamatan, '')) LIKE ?
      )`);
      const like = `%${q.toLowerCase()}%`;
      params.push(like, like, like);
    }

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const countQuery = `SELECT COUNT(*) AS total FROM data_koperasi ${whereSQL}`;
    const [[countRow]] = await pool.query(countQuery, params);
    const total = countRow?.total ?? 0;

    // ⬇️ DI SINI DITAMBAH KOLOM2 BARU (tidak mengubah yang lama)
    const selectCols = [
      "id",                    // kolom baru primary key
      "nomor_induk_koperasi",
      "nama_koperasi",
      "nomor_badan_hukum",
      "bentuk_koperasi",
      "jenis_koperasi",
      "pola_pengelolaan",
      "status_koperasi",
      "sektor_usaha",
      "kelompok_koperasi",
      "provinsi",
      "kabupaten",
      "kecamatan",
      "kelurahan",
      "desa",
      "alamat_lengkap",
      "kode_pos",
      "email_koperasi",
      "kuk",
      "grade_koperasi"
    ].join(", ");

    const dataQuery = `
      SELECT ${selectCols}
      FROM data_koperasi
      ${whereSQL}
      ORDER BY kecamatan ASC, nama_koperasi ASC
      LIMIT ? OFFSET ?;
    `;

    const dataParams = params.concat([limit, offset]);
    const [rows] = await pool.query(dataQuery, dataParams);

    return res.json({
      success: true,
      data: {
        rows,
        total,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error getKoperasiList:", error);
    return res.status(500).json({ success: false, message: "Gagal memuat daftar koperasi", error: error.message });
  }
};
