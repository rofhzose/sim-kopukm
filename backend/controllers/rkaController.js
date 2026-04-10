import pool from "../config/db.js";

// GET ALL RKA (Dikelompokkan berdasarkan Sub Kegiatan agar jadi 1 Baris Horizontal)
// GET ALL RKA
export async function getAllRka(req, res, next) {
  try {
    const { tahun } = req.query;

    let query = `
        SELECT 
          MAX(rh.id_rka) AS id, 
          
          /* KUNCI PERBAIKAN: Ambil id_rka spesifik untuk masing-masing pagu */
          MAX(CASE WHEN rh.pagu_id = 1 THEN rh.id_rka ELSE NULL END) AS id_murni,
          MAX(CASE WHEN rh.pagu_id = 2 THEN rh.id_rka ELSE NULL END) AS id_p1,
          MAX(CASE WHEN rh.pagu_id = 3 THEN rh.id_rka ELSE NULL END) AS id_p2,
          MAX(CASE WHEN rh.pagu_id = 4 THEN rh.id_rka ELSE NULL END) AS id_efs,
          MAX(CASE WHEN rh.pagu_id = 5 THEN rh.id_rka ELSE NULL END) AS id_ubah,

          rh.id_sub_kegiatan AS subkegiatan_id,
          MAX(p.nama_lengkap) AS pj_nama,
          MAX(rh.target_kinerja) AS target_angka,
          MAX(rh.satuan) AS target_satuan,
          /* TAMBAHKAN 4 BARIS INI UNTUK MENARIK DATA TRIWULAN */
          MAX(rh.tw_mulai) AS tw_mulai,
          MAX(rh.mg_mulai) AS mg_mulai,
          MAX(rh.tw_selesai) AS tw_selesai,
          MAX(rh.mg_selesai) AS mg_selesai,
          rh.id_tahun AS tahun,
          
          rk.program_id AS program_id,
          rsk.kegiatan_id AS kegiatan_id,
          
          rp.kodering AS prog_kode,
          rp.nama_program AS program_name,
          rk.kodering AS keg_kode,
          rk.nama_kegiatan AS kegiatan_name,
          rsk.kodering AS sub_kode,
          rsk.nama_sub AS subkegiatan_name,
          
          COALESCE(SUM(CASE WHEN rb.pagu_id = 1 THEN rb.total ELSE 0 END), 0) AS murni, 
          COALESCE(SUM(CASE WHEN rb.pagu_id = 2 THEN rb.total ELSE 0 END), 0) AS pergeseran_i,
          COALESCE(SUM(CASE WHEN rb.pagu_id = 3 THEN rb.total ELSE 0 END), 0) AS pergeseran_ii,
          COALESCE(SUM(CASE WHEN rb.pagu_id = 4 THEN rb.total ELSE 0 END), 0) AS efisiensi, 
          COALESCE(SUM(CASE WHEN rb.pagu_id = 5 THEN rb.total ELSE 0 END), 0) AS perubahan
        FROM rka_header rh
        LEFT JOIN pegawai p ON rh.id_pj = p.id_pegawai
        LEFT JOIN renstra_sub_kegiatan rsk ON rh.id_sub_kegiatan = rsk.id
        LEFT JOIN renstra_kegiatan rk ON rsk.kegiatan_id = rk.id
        LEFT JOIN renstra_program rp ON rk.program_id = rp.id
        LEFT JOIN rka_belanja rb ON rh.id_rka = rb.id_rka
    `;

    const queryParams = [];
    if (tahun) {
      query += ` WHERE rh.id_tahun = ? `;
      queryParams.push(tahun);
    }

    query += ` GROUP BY rh.id_sub_kegiatan, rh.id_tahun ORDER BY rp.kodering, rk.kodering, rsk.kodering ASC `;

    const [rows] = await pool.query(query, queryParams);
    res.json(rows);
  } catch (err) {
    console.error("Query Error:", err.message);
    next(err);
  }
}

// ===========================================================================
// 1. CREATE RKA (DENGAN 4 FIELD PERIODE PELAKSANAAN)
// ===========================================================================
export async function createRka(req, res, next) {
  try {
    const {
      subkegiatan_id,
      penanggungjawab_id,
      pelaksana_id,
      tanggal_mulai,
      tanggal_selesai,
      tw_mulai,
      mg_mulai,
      tw_selesai,
      mg_selesai,
      target_sub,
      satuan,
      jenis_pagu,
      tahun 
    } = req.body;

    const id_tahun = tahun || new Date().getFullYear().toString();

    const checkQuery = `SELECT id_rka FROM rka_header WHERE id_sub_kegiatan = ? AND pagu_id = ? AND id_tahun = ?`;
    const [existing] = await pool.query(checkQuery, [subkegiatan_id, jenis_pagu, id_tahun]);

    if (existing.length > 0) {
        const existingId = existing[0].id_rka;
        const updateQuery = `
          UPDATE rka_header 
          SET id_pj = ?, id_pelaksana = ?, tgl_mulai = ?, tgl_selesai = ?, tw_mulai = ?, mg_mulai = ?, tw_selesai = ?, mg_selesai = ?, target_kinerja = ?, satuan = ?
          WHERE id_rka = ?
        `;
        await pool.query(updateQuery, [
          penanggungjawab_id || null, pelaksana_id || null, tanggal_mulai || null, tanggal_selesai || null, tw_mulai || null, mg_mulai || null, tw_selesai || null, mg_selesai || null, target_sub || null, satuan || null, existingId
        ]);
        
        return res.status(200).json({
          message: "Header RKA sudah ada, berhasil menggunakan header yang ada",
          id_rka: existingId,
        });
    }

    // 13 Kolom = 13 Tanda Tanya
    const insertQuery = `
        INSERT INTO rka_header 
        (id_sub_kegiatan, id_tahun, pagu_id, id_pj, id_pelaksana, tgl_mulai, tgl_selesai, tw_mulai, mg_mulai, tw_selesai, mg_selesai, target_kinerja, satuan) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
    
    const values = [
      subkegiatan_id || null, 
      id_tahun, 
      jenis_pagu || null, 
      penanggungjawab_id || null, 
      pelaksana_id || null, 
      tanggal_mulai || null, 
      tanggal_selesai || null, 
      tw_mulai || null, 
      mg_mulai || null, 
      tw_selesai || null, 
      mg_selesai || null, 
      target_sub || null, 
      satuan || null
    ];

    const [result] = await pool.query(insertQuery, values);

    res.status(201).json({
      message: "Data RKA berhasil ditambahkan",
      id_rka: result.insertId,
    });
  } catch (err) {
    console.error("DATABASE ERROR:", err.sqlMessage);
    next(err); 
  }
}

// ===========================================================================
// 2. UPDATE RKA (DENGAN 4 FIELD PERIODE PELAKSANAAN)
// ===========================================================================
export async function updateRka(req, res, next) {
  try {
    const { id } = req.params;
    const {
      subkegiatan_id,
      penanggungjawab_id,
      pelaksana_id,
      tanggal_mulai,
      tanggal_selesai,
      tw_mulai,
      mg_mulai,
      tw_selesai,
      mg_selesai,
      target_sub,
      satuan,
      jenis_pagu,
      tahun
    } = req.body;

    const query = `
      UPDATE rka_header 
      SET 
        id_sub_kegiatan = ?, 
        pagu_id = ?, 
        id_pj = ?, 
        id_pelaksana = ?, 
        tgl_mulai = ?, 
        tgl_selesai = ?, 
        tw_mulai = ?, 
        mg_mulai = ?, 
        tw_selesai = ?, 
        mg_selesai = ?,
        target_kinerja = ?,
        satuan = ?,
        id_tahun = ?
      WHERE id_rka = ?
    `;

    const values = [
      subkegiatan_id || null,
      jenis_pagu || null,
      penanggungjawab_id || null,
      pelaksana_id || null,
      tanggal_mulai || null,
      tanggal_selesai || null,
      tw_mulai || null,
      mg_mulai || null,
      tw_selesai || null,
      mg_selesai || null,
      target_sub || null,
      satuan || null,
      tahun || null, 
      id             
    ];

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Data RKA tidak ditemukan di database" });
    }

    res.json({ message: "Data RKA berhasil diperbarui" });
  } catch (err) {
    res.status(500).json({ message: "Gagal update database", error: err.sqlMessage || err.message });
  }
}

// ===========================================================================
// 2. SAVE BELANJA (DENGAN LOGIKA AUTO-CLEANUP HEADER KOSONG)
// ===========================================================================
export async function saveBelanja(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { items, jenis_pagu } = req.body; 

    await connection.beginTransaction();

    // 1. Hapus semua rincian belanja lama untuk menggantinya dengan yang baru
    await connection.execute("DELETE FROM rka_belanja WHERE id_rka = ?", [id]);

    // 2. AUTO-CLEANUP: Jika user menghapus semua daftar belanja (tabel kosong),
    // hapus juga Headernya sekalian agar database tidak dipenuhi cangkang kosong!
    if (!items || items.length === 0) {
        await connection.execute("DELETE FROM rka_header WHERE id_rka = ?", [id]);
        await connection.commit();
        return res.status(200).json({ message: "Semua belanja dihapus. Header RKA otomatis dibersihkan!" });
    }

    // 3. Jika items ada isinya, simpan rincian belanja baru
    const query = `
        INSERT INTO rka_belanja 
        (id_rka, pagu_id, uraian_belanja, koefisien, volume, harga_satuan) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;

    for (const item of items) {
      await connection.execute(query, [
        id,
        jenis_pagu || null,          
        item.belanja,                
        item.koef || "",             
        item.perhitungan || 0,       
        item.harga_satuan || 0       
      ]);
    }

    await connection.commit();
    res.status(201).json({ message: "Rincian Belanja berhasil disimpan!" });
  } catch (err) {
    await connection.rollback();
    console.error("Error Detail:", err.message);
    next(err);
  } finally {
    connection.release();
  }
}

// GET BELANJA BY RKA ID (Dan filter by Pagu ID jika ada)
export async function getBelanjaByRka(req, res, next) {
  try {
    const { id } = req.params;
    const { pagu_id } = req.query; // Menangkap filter pagu_id dari frontend

    let query = `
      SELECT 
        id_belanja AS id,
        pagu_id,
        uraian_belanja AS belanja,
        koefisien AS koef,
        volume AS perhitungan,
        harga_satuan,
        total
      FROM rka_belanja 
      WHERE id_rka = ?
    `;

    const queryParams = [id];

    // Jika frontend mengirimkan spesifik pagu_id (Murni, Pergeseran, dll), filter datanya
    if (pagu_id) {
      query += ` AND pagu_id = ?`;
      queryParams.push(pagu_id);
    }

    const [rows] = await pool.query(query, queryParams);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// DELETE RKA
export async function deleteRka(req, res, next) {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM rka_header WHERE id_rka = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Data RKA tidak ditemukan" });
    }

    res.json({ message: "Data RKA berhasil dihapus" });
  } catch (err) {
    next(err);
  }
}