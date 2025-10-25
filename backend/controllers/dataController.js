import pool from "../config/db.js";

/**
 * Bersihkan data duplikat dan pindahkan data unik ke tabel baru
 */
export const cleanDuplicateData = async (req, res) => {
  const sourceTable = "data_umkm_global_kotor";
  const targetTable = "data_umkm_global_bersih";

  try {
    console.log("🧹 Memulai proses pembersihan data...");

    // 1️⃣ Cek apakah tabel sumber ada
    const [checkSource] = await pool.query(
      `SHOW TABLES LIKE '${sourceTable}'`
    );
    if (checkSource.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Tabel ${sourceTable} tidak ditemukan.`,
      });
    }

    // 2️⃣ Buat tabel baru (copy struktur)
    await pool.query(`DROP TABLE IF EXISTS ${targetTable}`);
    await pool.query(`CREATE TABLE ${targetTable} LIKE ${sourceTable}`);

    // 3️⃣ Insert data unik ke tabel baru
    const insertQuery = `
      INSERT INTO ${targetTable}
      SELECT *
      FROM ${sourceTable} AS a
      WHERE a.id IN (
        SELECT MIN(id)
        FROM ${sourceTable}
        GROUP BY TRIM(LOWER(nama_pemilik)), TRIM(no_hp)
      )
    `;
    const [insertResult] = await pool.query(insertQuery);

    // 4️⃣ Hitung hasil
    const [[countSource]] = await pool.query(
      `SELECT COUNT(*) AS total FROM ${sourceTable}`
    );
    const [[countClean]] = await pool.query(
      `SELECT COUNT(*) AS total FROM ${targetTable}`
    );
    const duplikat = countSource.total - countClean.total;

    console.log("✅ Pembersihan selesai");

    res.status(200).json({
      success: true,
      message: "Data berhasil dibersihkan",
      total_data_awal: countSource.total,
      total_data_bersih: countClean.total,
      total_duplikat: duplikat,
      target_tabel: targetTable,
    });
  } catch (err) {
    console.error("❌ Error pembersihan:", err);
    res.status(500).json({
      success: false,
      message: "Gagal membersihkan data",
      error: err.message,
    });
  }
};

export const getDuplikatDataUMKM = async (req, res) => {
  try {
    const db = global.db || req.db || pool;
    const kolomUtama = ["nama_pemilik", "nama_usaha", "no_hp"];

    const limit = req.query.limit !== undefined ? parseInt(req.query.limit) : 100;
    const useLimit = limit > 0;

    // ✅ Total data
    const [[{ total_data }]] = await db.query(
      "SELECT COUNT(*) AS total_data FROM data_umkm_global_kotor"
    );

    // ✅ Total duplikat global (berdasarkan nama_pemilik)
    const [[{ total_duplikat_global }]] = await db.query(`
      SELECT COUNT(*) AS total_duplikat_global
      FROM data_umkm_global_kotor a
      JOIN (
        SELECT nama_pemilik
        FROM data_umkm_global_kotor
        GROUP BY nama_pemilik
        HAVING COUNT(*) > 1
      ) b ON a.nama_pemilik = b.nama_pemilik
    `);

    // ✅ Cek duplikat per kolom
    let messages = [];
    for (const kolom of kolomUtama) {
      const [rows] = await db.query(`
        SELECT ${kolom} AS nilai, COUNT(*) AS jumlah
        FROM data_umkm_global_kotor
        WHERE ${kolom} IS NOT NULL AND ${kolom} <> ''
        GROUP BY ${kolom}
        HAVING COUNT(*) > 1
        ORDER BY jumlah DESC
        ${useLimit ? `LIMIT ${limit}` : ""}
      `);

      rows.forEach((r) => {
        messages.push(
          `📊 Ditemukan ${r.jumlah} data duplikat berdasarkan kolom '${kolom}' dengan nilai '${r.nilai}'`
        );
      });
    }

    const persentaseDuplikat = ((total_duplikat_global / total_data) * 100).toFixed(2);

    res.status(200).json({
      status: "success",
      summary: {
        total_data_kotor_umkm: total_data,
        total_data_umkm_duplikat: total_duplikat_global,
        persentase_duplikat: `${persentaseDuplikat}%`,
        keterangan: `Dari ${total_data.toLocaleString()} data UMKM, terdapat ${total_duplikat_global.toLocaleString()} data yang terindikasi duplikat.`,
        checked_columns: kolomUtama,
        limit_per_kolom: useLimit ? limit : "Tanpa Limit",
      },
      message: messages,
    });
  } catch (err) {
    console.error("❌ Error getDuplikatDataUMKM:", err);
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data duplikat UMKM",
      error: err.message,
    });
  }
};


export const getUMKMYangMendapatBantuan = async (req, res) => {
  try {
    const db = global.db || req.db || pool; // sesuaikan koneksi
    
    // Ambil data UMKM yang sudah mendapat bantuan
    const [umkmDapat] = await db.query(`
      SELECT 
        id,
        nama_pemilik,
        nama_usaha,
        COALESCE(jenis_bantuan, '-') AS jenis_bantuan,
        COALESCE(fasilitas_alat_bantu, '-') AS fasilitas_alat_bantu
      FROM data_umkm_global_bersih
      WHERE 
        (jenis_bantuan IS NOT NULL AND jenis_bantuan <> '')
        OR (fasilitas_alat_bantu IS NOT NULL AND fasilitas_alat_bantu <> '')
    `);

    // Hitung total UMKM keseluruhan
    const [[{ total_umkm }]] = await db.query(`
      SELECT COUNT(*) AS total_umkm FROM data_umkm_global_bersih
    `);

    // Hitung total UMKM yang sudah mendapat bantuan
    const totalDapat = umkmDapat.length;

    // Hitung yang belum mendapat bantuan
    const totalBelum = total_umkm - totalDapat;

    // Buat ringkasan
    res.status(200).json({
      status: "success",
      summary: {
        total_umkm: total_umkm,
        total_mendapat_bantuan: totalDapat,
        total_belum_mendapat_bantuan: totalBelum,
        persentase_mendapat_bantuan: ((totalDapat / total_umkm) * 100).toFixed(2) + "%"
      },
      message: `📊 ${totalDapat} dari ${total_umkm} UMKM telah mendapatkan bantuan.`,
      data: umkmDapat
    });
  } catch (err) {
    console.error("❌ Error getUMKMYangMendapatBantuan:", err);
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data UMKM yang mendapat bantuan",
      error: err.message,
    });
  }
};

export const getUMKMYangTidakMendapatBantuan = async (req, res) => {
  try {
    const db = global.db || req.db || pool; // sesuaikan koneksi

    // ✅ Ambil data UMKM yang belum mendapat bantuan
    const [umkmTidakDapat] = await db.query(`
      SELECT 
        id,
        nama_pemilik,
        nama_usaha,
        COALESCE(jenis_bantuan, '-') AS jenis_bantuan,
        COALESCE(fasilitas_alat_bantu, '-') AS fasilitas_alat_bantu
      FROM data_umkm_global_bersih
      WHERE 
        (jenis_bantuan IS NULL OR jenis_bantuan = '')
        AND (fasilitas_alat_bantu IS NULL OR fasilitas_alat_bantu = '')
    `);

    // ✅ Hitung total keseluruhan UMKM
    const [[{ total_umkm }]] = await db.query(`
      SELECT COUNT(*) AS total_umkm FROM data_umkm_global_bersih
    `);

    // ✅ Hitung total UMKM yang tidak mendapat bantuan
    const totalTidak = umkmTidakDapat.length;

    // ✅ Hitung yang mendapat bantuan
    const totalDapat = total_umkm - totalTidak;

    res.status(200).json({
      status: "success",
      summary: {
        total_umkm: total_umkm,
        total_mendapat_bantuan: totalDapat,
        total_tidak_mendapat_bantuan: totalTidak,
        persentase_tidak_mendapat_bantuan: ((totalTidak / total_umkm) * 100).toFixed(2) + "%"
      },
      message: `📊 ${totalTidak} dari ${total_umkm} UMKM belum pernah mendapatkan bantuan.`,
      data: umkmTidakDapat
    });
  } catch (err) {
    console.error("❌ Error getUMKMYangTidakMendapatBantuan:", err);
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data UMKM yang belum mendapat bantuan",
      error: err.message,
    });
  }
};

export const getUMKMYangMendapatkanBantuanGanda = async (req, res) => {
  try {
    const db = global.db || req.db || pool;

    // Ambil limit dari query param (biar gak berat)
    const limit = req.query.limit !== undefined ? parseInt(req.query.limit) : 100;
    const useLimit = limit > 0;

    // ✅ Cari nama pemilik yang dapat bantuan lebih dari 1 kali
    const [duplikat] = await db.query(`
      SELECT 
        nama_pemilik,
        COUNT(*) AS jumlah_bantuan
      FROM data_umkm_global_bersih
      WHERE 
        (jenis_bantuan IS NOT NULL AND jenis_bantuan <> '')
        OR (fasilitas_alat_bantu IS NOT NULL AND fasilitas_alat_bantu <> '')
      GROUP BY nama_pemilik
      HAVING COUNT(*) > 1
      ORDER BY jumlah_bantuan DESC
      ${useLimit ? `LIMIT ${limit}` : ""}
    `);

    // ✅ Ambil detail bantuan untuk tiap nama pemilik
    let hasil = [];
    for (const item of duplikat) {
      const [records] = await db.query(`
        SELECT 
          id,
          nama_pemilik,
          nama_usaha,
          jenis_bantuan,
          fasilitas_alat_bantu
        FROM data_umkm_global_bersih
        WHERE nama_pemilik = ?
      `, [item.nama_pemilik]);

      hasil.push({
        nama_pemilik: item.nama_pemilik,
        jumlah_bantuan: item.jumlah_bantuan,
        rincian_bantuan: records
      });
    }

    // ✅ Hitung total penerima ganda dan total penerima bantuan
    const totalGanda = duplikat.length;
    const [[{ total_penerima_bantuan }]] = await db.query(`
      SELECT COUNT(DISTINCT nama_pemilik) AS total_penerima_bantuan
      FROM data_umkm_global_bersih
      WHERE 
        (jenis_bantuan IS NOT NULL AND jenis_bantuan <> '')
        OR (fasilitas_alat_bantu IS NOT NULL AND fasilitas_alat_bantu <> '')
    `);

    res.status(200).json({
      status: "success",
      summary: {
        total_penerima_bantuan,
        total_penerima_ganda: totalGanda,
        persentase_ganda: ((totalGanda / total_penerima_bantuan) * 100).toFixed(2) + "%",
        keterangan: `${totalGanda} dari ${total_penerima_bantuan} penerima bantuan memiliki lebih dari satu data bantuan.`,
        limit_per_query: useLimit ? limit : "Tanpa Limit"
      },
      data: hasil
    });
  } catch (err) {
    console.error("❌ Error getPenerimaBantuanGanda:", err);
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data penerima bantuan ganda",
      error: err.message,
    });
  }
};





export default { 
                cleanDuplicateData, 
                getDuplikatDataUMKM, 
                getUMKMYangMendapatBantuan,
                getUMKMYangTidakMendapatBantuan,
                getUMKMYangMendapatkanBantuanGanda
              };