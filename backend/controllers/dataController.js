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

export default { cleanDuplicateData };