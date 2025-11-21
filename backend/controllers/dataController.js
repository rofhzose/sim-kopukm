import pool from "../config/db.js";

/**
 * Bersihkan data duplikat dan pindahkan data unik ke tabel baru
 */
export const cleanDuplicateData = async (req, res) => {
  const sourceTable = "data_umkm_global_kotor";
  const targetTable = "data_umkm_global_bersih";
  const backupTable = `${targetTable}_backup_${Date.now()}`; // auto backup

  try {
    console.log("🧹 Memulai proses pembersihan data...");

    // 1️⃣ Cek tabel sumber
    const [checkSource] = await pool.query(`SHOW TABLES LIKE ?`, [sourceTable]);
    if (checkSource.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Tabel sumber '${sourceTable}' tidak ditemukan.`,
      });
    }

    // 2️⃣ Backup tabel lama kalau ada
    const [checkTarget] = await pool.query(`SHOW TABLES LIKE ?`, [targetTable]);
    if (checkTarget.length > 0) {
      console.log(`🗂 Membuat backup tabel lama: ${backupTable}`);
      await pool.query(`RENAME TABLE ${targetTable} TO ${backupTable}`);
    }

    // 3️⃣ Buat tabel baru dari nol (bukan LIKE)
    console.log("📦 Membuat tabel baru tanpa copy ID lama...");
    await pool.query(`
      CREATE TABLE ${targetTable} (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        no INT DEFAULT NULL,
        nama_pemilik VARCHAR(100) DEFAULT NULL,
        alamat TEXT,
        kecamatan VARCHAR(100) DEFAULT NULL,
        fasilitas_alat_bantu VARCHAR(255) DEFAULT NULL,
        keterangan TEXT,
        jenis_kelamin VARCHAR(20) DEFAULT NULL,
        no_hp VARCHAR(20) DEFAULT NULL,
        nama_usaha VARCHAR(255) DEFAULT NULL,
        jenis_usaha VARCHAR(255) DEFAULT NULL,
        pirt VARCHAR(100) DEFAULT NULL,
        sertifikat_halal VARCHAR(100) DEFAULT NULL,
        shat_tanah VARCHAR(100) DEFAULT NULL,
        haki VARCHAR(100) DEFAULT NULL,
        nik_pemilik VARCHAR(30) DEFAULT NULL,
        nama_produk VARCHAR(255) DEFAULT NULL,
        nomor_induk_berusaha VARCHAR(100) DEFAULT NULL,
        nomor_whatsapp_tlp VARCHAR(20) DEFAULT NULL,
        email VARCHAR(100) DEFAULT NULL,
        alamat_usaha TEXT,
        lama_usaha VARCHAR(100) DEFAULT NULL,
        omzet_usaha_tahunan VARCHAR(100) DEFAULT NULL,
        harapan_mengikuti_umkm_juara TEXT,
        sheet_name VARCHAR(100) DEFAULT NULL,
        kelurahan_desa VARCHAR(100) DEFAULT NULL,
        jenis_bantuan VARCHAR(255) DEFAULT NULL,
        nama_lengkap VARCHAR(100) DEFAULT NULL,
        ukuran_kemasan VARCHAR(50) DEFAULT NULL,
        longitude VARCHAR(50) DEFAULT NULL,
        latitude VARCHAR(50) DEFAULT NULL,
        status_legalitas VARCHAR(100) DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4️⃣ Masukkan data unik tanpa kolom id
    console.log("🧠 Memasukkan data unik dan buat ID baru...");
    const insertQuery = `
      INSERT INTO ${targetTable} (
        no,
        nama_pemilik,
        alamat,
        kecamatan,
        fasilitas_alat_bantu,
        keterangan,
        jenis_kelamin,
        no_hp,
        nama_usaha,
        jenis_usaha,
        pirt,
        sertifikat_halal,
        shat_tanah,
        haki,
        nik_pemilik,
        nama_produk,
        nomor_induk_berusaha,
        nomor_whatsapp_tlp,
        email,
        alamat_usaha,
        lama_usaha,
        omzet_usaha_tahunan,
        harapan_mengikuti_umkm_juara,
        sheet_name,
        kelurahan_desa,
        jenis_bantuan,
        nama_lengkap,
        ukuran_kemasan,
        longitude,
        latitude,
        status_legalitas
      )
      SELECT 
        no,
        nama_pemilik,
        alamat,
        kecamatan,
        fasilitas_alat_bantu,
        keterangan,
        jenis_kelamin,
        no_hp,
        nama_usaha,
        jenis_usaha,
        pirt,
        sertifikat_halal,
        shat_tanah,
        haki,
        nik_pemilik,
        nama_produk,
        nomor_induk_berusaha,
        nomor_whatsapp_tlp,
        email,
        alamat_usaha,
        lama_usaha,
        omzet_usaha_tahunan,
        harapan_mengikuti_umkm_juara,
        sheet_name,
        kelurahan_desa,
        jenis_bantuan,
        nama_lengkap,
        ukuran_kemasan,
        longitude,
        latitude,
        status_legalitas
      FROM ${sourceTable} AS a
      WHERE a.id IN (
        SELECT MIN(id)
        FROM ${sourceTable}
        WHERE nama_pemilik IS NOT NULL AND TRIM(nama_pemilik) != ''
        GROUP BY TRIM(LOWER(nama_pemilik)), TRIM(no_hp)
      )
    `;
    const [insertResult] = await pool.query(insertQuery);

    // 5️⃣ Hitung hasil
    const [[countSource]] = await pool.query(
      `SELECT COUNT(*) AS total FROM ${sourceTable}`
    );
    const [[countClean]] = await pool.query(
      `SELECT COUNT(*) AS total FROM ${targetTable}`
    );
    const duplikat = countSource.total - countClean.total;

    console.log("✅ Pembersihan & rebuild ID selesai!");

    res.status(200).json({
      success: true,
      message: "Data berhasil dibersihkan dan ID dibuat ulang otomatis",
      total_data_awal: countSource.total,
      total_data_bersih: countClean.total,
      total_duplikat: duplikat,
      tabel_sumber: sourceTable,
      tabel_tujuan: targetTable,
      tabel_backup: checkTarget.length > 0 ? backupTable : null,
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

export const getUMKMDashboardSummary = async (req, res) => {
  try {
    const db = global.db || req.db || pool;

    // ✅ Total UMKM bersih
    const [[{ total_umkm }]] = await db.query(`
      SELECT COUNT(*) AS total_umkm FROM data_umkm_global_bersih
    `);

    // ✅ Total data duplikat di tabel kotor
    const [[{ total_duplikat }]] = await db.query(`
      SELECT COUNT(*) AS total_duplikat
      FROM data_umkm_global_kotor a
      JOIN (
        SELECT nama_pemilik
        FROM data_umkm_global_kotor
        GROUP BY nama_pemilik
        HAVING COUNT(*) > 1
      ) b ON a.nama_pemilik = b.nama_pemilik
    `);

    // ✅ Total UMKM yang mendapat bantuan
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
      ORDER BY id ASC
      LIMIT 10
    `);

    const [[{ total_mendapat_bantuan }]] = await db.query(`
      SELECT COUNT(*) AS total_mendapat_bantuan
      FROM data_umkm_global_bersih
      WHERE 
        (jenis_bantuan IS NOT NULL AND jenis_bantuan <> '')
        OR (fasilitas_alat_bantu IS NOT NULL AND fasilitas_alat_bantu <> '')
    `);

    const total_tidak_mendapat_bantuan = total_umkm - total_mendapat_bantuan;

    // ✅ Total penerima bantuan ganda
    const [[{ total_ganda }]] = await db.query(`
      SELECT COUNT(*) AS total_ganda FROM (
        SELECT nama_pemilik
        FROM data_umkm_global_bersih
        WHERE 
          (jenis_bantuan IS NOT NULL AND jenis_bantuan <> '')
          OR (fasilitas_alat_bantu IS NOT NULL AND fasilitas_alat_bantu <> '')
        GROUP BY nama_pemilik HAVING COUNT(*) > 1
      ) AS ganda
    `);

    // ✅ Hitung persentase
    const persentase_bantuan = ((total_mendapat_bantuan / total_umkm) * 100).toFixed(2);

    // 🎯 Response lengkap
    res.status(200).json({
      success: true,
      summary: {
        total_umkm,
        total_duplikat,
        total_mendapat_bantuan,
        total_tidak_mendapat_bantuan,
        persentase_mendapat_bantuan: `${persentase_bantuan}%`,
        total_penerima_ganda: total_ganda,
      },
      message: `📊 ${total_mendapat_bantuan} dari ${total_umkm} UMKM telah mendapatkan bantuan (${persentase_bantuan}%).`,
      preview_data_bantuan: umkmDapat, // 🧩 bonus: tampilkan 10 contoh penerima
    });
  } catch (err) {
    console.error("❌ Error getUMKMDashboardSummary:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil ringkasan dashboard UMKM",
      error: err.message,
    });
  }
};

export const cleanDuplicateKoperasiData = async (req, res) => {
  try {
    console.log("🚀 Mulai proses pembersihan data koperasi_global...");

    const tabelSumberAktif = "koperasi_all_aktif";
    const tabelSumberTidakAktif = "koperasi_all_tidak_aktif";
    const tabelTujuan = "koperasi_global";
    const timestamp = Date.now();
    const tabelBackup = `${tabelTujuan}_backup_${timestamp}`;

    // 1️⃣ Hitung total data awal (dua sumber)
    const [[countAktif]] = await pool.query(
      `SELECT COUNT(*) AS total FROM ${tabelSumberAktif}`
    );
    const [[countTidakAktif]] = await pool.query(
      `SELECT COUNT(*) AS total FROM ${tabelSumberTidakAktif}`
    );
    const totalDataAwal = countAktif.total + countTidakAktif.total;

    // 2️⃣ Backup tabel tujuan (kalau ada datanya)
    await pool.query(
      `CREATE TABLE IF NOT EXISTS ${tabelTujuan} LIKE ${tabelSumberAktif}`
    );

    const [checkData] = await pool.query(
      `SELECT COUNT(*) AS total FROM ${tabelTujuan}`
    );

    if (checkData[0].total > 0) {
      await pool.query(
        `CREATE TABLE ${tabelBackup} AS SELECT * FROM ${tabelTujuan}`
      );
      console.log(`🗄️ Backup dibuat: ${tabelBackup}`);
    }

    // 3️⃣ Bersihkan tabel tujuan sebelum isi ulang
    await pool.query(`TRUNCATE TABLE ${tabelTujuan}`);

    // 4️⃣ Gabungkan dua tabel sumber dan hilangkan duplikat + perbaiki NIK
    const insertQuery = `
      INSERT IGNORE INTO ${tabelTujuan} (
        nomor_induk_koperasi, nama_koperasi, nomor_badan_hukum,
        bentuk_koperasi, jenis_koperasi, pola_pengelolaan,
        status_koperasi, sektor_usaha, kelompok_koperasi,
        provinsi, kabupaten_kota, kecamatan, kelurahan,
        desa, alamat, kode_pos, email, kuk, grade
      )
      SELECT DISTINCT
        REPLACE(nomor_induk_koperasi, "'", "") AS nomor_induk_koperasi,
        nama_koperasi, nomor_badan_hukum,
        bentuk_koperasi, jenis_koperasi, pola_pengelolaan,
        status_koperasi, sektor_usaha, kelompok_koperasi,
        provinsi, kabupaten_kota, kecamatan, kelurahan,
        desa, alamat, kode_pos, email, kuk, grade
      FROM ${tabelSumberAktif}
      UNION
      SELECT DISTINCT
        REPLACE(nomor_induk_koperasi, "'", "") AS nomor_induk_koperasi,
        nama_koperasi, nomor_badan_hukum,
        bentuk_koperasi, jenis_koperasi, pola_pengelolaan,
        status_koperasi, sektor_usaha, kelompok_koperasi,
        provinsi, kabupaten_kota, kecamatan, kelurahan,
        desa, alamat, kode_pos, email, kuk, grade
      FROM ${tabelSumberTidakAktif};
    `;

    await pool.query(insertQuery);

    // 5️⃣ Hitung hasil akhir
    const [[{ total_bersih }]] = await pool.query(
      `SELECT COUNT(DISTINCT nomor_induk_koperasi) AS total_bersih FROM ${tabelTujuan}`
    );

    const totalDuplikat = totalDataAwal - total_bersih;

    // 6️⃣ Reset ID auto increment biar urut — versi AMAN (tanpa multiple query)
    await pool.query(`SET @num := 0`);
    await pool.query(
      `UPDATE ${tabelTujuan} SET id = (@num := @num + 1) ORDER BY id`
    );
    await pool.query(`ALTER TABLE ${tabelTujuan} AUTO_INCREMENT = 1`);

    console.log("✅ Data berhasil dibersihkan dan ID direset!");

    // 7️⃣ Kirim hasil JSON seperti format kamu
    res.json({
      success: true,
      message: "Data berhasil dibersihkan dan ID dibuat ulang otomatis",
      total_data_awal: totalDataAwal,
      total_data_bersih: total_bersih,
      total_duplikat: totalDuplikat,
      tabel_sumber: `${tabelSumberAktif}, ${tabelSumberTidakAktif}`,
      tabel_tujuan: tabelTujuan,
      tabel_backup: checkData[0].total > 0 ? tabelBackup : null,
    });
  } catch (error) {
    console.error("❌ Error saat merge koperasi:", error);
    res.status(500).json({
      success: false,
      message: "Gagal membersihkan data koperasi.",
      error: error.message,
    });
  }
};

export const getKoperasiDashboardSummary = async (req, res) => {
  try {
    console.log("📊 Mengambil ringkasan detail data koperasi...");

    const tabel = "koperasi_global";

    // 1️⃣ Total keseluruhan koperasi
    const [[{ total_koperasi }]] = await pool.query(
      `SELECT COUNT(*) AS total_koperasi FROM ${tabel}`
    );

    // 2️⃣ Status aktif / tidak aktif
    const [[{ total_aktif }]] = await pool.query(
      `SELECT COUNT(*) AS total_aktif FROM ${tabel} WHERE status_koperasi = 'Aktif'`
    );
    const [[{ total_tidak_aktif }]] = await pool.query(
      `SELECT COUNT(*) AS total_tidak_aktif FROM ${tabel} WHERE status_koperasi != 'Aktif'`
    );

    const persentase_aktif =
      total_koperasi > 0
        ? ((total_aktif / total_koperasi) * 100).toFixed(2)
        : 0;

    // 3️⃣ Jenis koperasi (Produsen, Konsumen, Jasa, dll)
    const [jenisKoperasi] = await pool.query(`
      SELECT jenis_koperasi, COUNT(*) AS total
      FROM ${tabel}
      GROUP BY jenis_koperasi
      ORDER BY total DESC;
    `);
    const total_jenis_koperasi = {};
    jenisKoperasi.forEach((row) => {
      total_jenis_koperasi[row.jenis_koperasi || "Tidak diketahui"] = row.total;
    });

    // 4️⃣ Sektor usaha
    const [sektorUsaha] = await pool.query(`
      SELECT sektor_usaha, COUNT(*) AS total
      FROM ${tabel}
      GROUP BY sektor_usaha
      ORDER BY total DESC
      LIMIT 10;
    `);
    const total_sektor_usaha = {};
    sektorUsaha.forEach((row) => {
      total_sektor_usaha[row.sektor_usaha || "Tidak diketahui"] = row.total;
    });

    // 5️⃣ Pola pengelolaan (Konvensional vs Syariah)
    const [polaPengelolaan] = await pool.query(`
      SELECT pola_pengelolaan, COUNT(*) AS total
      FROM ${tabel}
      GROUP BY pola_pengelolaan;
    `);
    const total_pola_pengelolaan = {};
    polaPengelolaan.forEach((row) => {
      total_pola_pengelolaan[row.pola_pengelolaan || "Tidak diketahui"] =
        row.total;
    });

    // 6️⃣ Rekap grade (kalau field grade diisi angka)
    const [gradeData] = await pool.query(`
      SELECT grade, COUNT(*) AS total
      FROM ${tabel}
      WHERE grade IS NOT NULL AND grade != ''
      GROUP BY grade
      ORDER BY grade;
    `);
    const total_grade = {};
    gradeData.forEach((row) => {
      total_grade[row.grade || "Belum dinilai"] = row.total;
    });

    // 7️⃣ Rekap kabupaten/kecamatan (10 besar)
    const [kecamatan] = await pool.query(`
      SELECT kecamatan, COUNT(*) AS total
      FROM ${tabel}
      GROUP BY kecamatan
      ORDER BY total DESC
      LIMIT 10;
    `);
    const total_kecamatan = {};
    kecamatan.forEach((row) => {
      total_kecamatan[row.kecamatan || "Tidak diketahui"] = row.total;
    });

    const [kabupaten] = await pool.query(`
      SELECT kabupaten_kota, COUNT(*) AS total
      FROM ${tabel}
      GROUP BY kabupaten_kota
      ORDER BY total DESC
      LIMIT 10;
    `);
    const total_kabupaten = {};
    kabupaten.forEach((row) => {
      total_kabupaten[row.kabupaten_kota || "Tidak diketahui"] = row.total;
    });

    // 8️⃣ Validitas Nomor Badan Hukum
    const [[{ total_nomor_badan_hukum_valid }]] = await pool.query(`
      SELECT COUNT(*) AS total_nomor_badan_hukum_valid
      FROM ${tabel}
      WHERE nomor_badan_hukum IS NOT NULL AND nomor_badan_hukum != '' 
      AND LENGTH(nomor_badan_hukum) > 5;
    `);
    const total_nomor_badan_hukum_tidak_ada =
      total_koperasi - total_nomor_badan_hukum_valid;

    const persentase_berbadan_hukum = total_koperasi
      ? ((total_nomor_badan_hukum_valid / total_koperasi) * 100).toFixed(2)
      : 0;

    // 9️⃣ Kirim hasil summary lengkap
    res.json({
      success: true,
      summary: {
        total_koperasi,
        total_aktif,
        total_tidak_aktif,
        persentase_aktif: Number(persentase_aktif),

        total_jenis_koperasi,
        total_sektor_usaha,
        total_pola_pengelolaan,
        total_grade,
        total_kecamatan,
        total_kabupaten,

        perizinan: {
          total_nomor_badan_hukum_valid,
          total_nomor_badan_hukum_tidak_ada,
          persentase_berbadan_hukum: Number(persentase_berbadan_hukum),
        },
      },
    });
  } catch (error) {
    console.error("❌ Error saat ambil dashboard koperasi:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data koperasi dashboard.",
      error: error.message,
    });
  }
};




export default { 
                cleanDuplicateData, 
                getDuplikatDataUMKM, 
                getUMKMYangMendapatBantuan,
                getUMKMYangTidakMendapatBantuan,
                getUMKMYangMendapatkanBantuanGanda,
                getUMKMDashboardSummary,

                cleanDuplicateKoperasiData,
                getKoperasiDashboardSummary
              };