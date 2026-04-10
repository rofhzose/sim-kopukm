import pool from "../config/db.js";

export async function getRencanaAksi(req, res, next) {
  try {
    const { tahun } = req.query;

    let query = `
      SELECT 
        /* Hirarki (Sasaran & Indikator Sasaran) */
        MAX(h_sasaran.uraian) AS sasaran_nama,
        MAX(h_indikator.uraian) AS indikator_sasaran_nama,

        /* Program */
        MAX(rp.id) AS program_id,
        MAX(rp.kodering) AS prog_kode,
        MAX(rp.nama_program) AS program_nama,

        /* Kegiatan */
        MAX(rk.id) AS kegiatan_id,
        MAX(rk.kodering) AS keg_kode,
        MAX(rk.nama_kegiatan) AS kegiatan_nama,

        /* Sub Kegiatan */
        rh.id_sub_kegiatan AS subkegiatan_id,
        MAX(rsk.kodering) AS sub_kode,
        MAX(rsk.nama_sub) AS subkegiatan_nama,
        
        /* ✅ PERBAIKAN DI SINI:
           Kolom di DB bernama "indikator_sub", BUKAN "indikator" 
        */
        MAX(rsk.indikator_sub) AS indikator_sub,

        /* RKA Detail (Target & Pelaksanaan) */
        MAX(rh.target_kinerja) AS target_sub,
        MAX(rh.satuan) AS satuan_sub,
        MAX(rh.tw_mulai) AS tw_mulai,
        MAX(rh.mg_mulai) AS mg_mulai,
        MAX(rh.tw_selesai) AS tw_selesai,
        MAX(rh.mg_selesai) AS mg_selesai,

        /* Pagu Anggaran */
        COALESCE(SUM(CASE WHEN rb.pagu_id = 1 THEN rb.total ELSE 0 END), 0) AS murni, 
        COALESCE(SUM(CASE WHEN rb.pagu_id = 2 THEN rb.total ELSE 0 END), 0) AS p1,
        COALESCE(SUM(CASE WHEN rb.pagu_id = 3 THEN rb.total ELSE 0 END), 0) AS p2,
        COALESCE(SUM(CASE WHEN rb.pagu_id = 4 THEN rb.total ELSE 0 END), 0) AS efs, 
        COALESCE(SUM(CASE WHEN rb.pagu_id = 5 THEN rb.total ELSE 0 END), 0) AS ubah

      FROM rka_header rh
      LEFT JOIN renstra_sub_kegiatan rsk ON rh.id_sub_kegiatan = rsk.id
      LEFT JOIN renstra_kegiatan rk ON rsk.kegiatan_id = rk.id
      LEFT JOIN renstra_program rp ON rk.program_id = rp.id
      
      /* ⚠️ CATATAN JOIN HIRARKI: 
         Saat ini saya biarkan bergabung dengan kondisi "1=1" agar tabel Anda bisa dirender 
         tanpa error meskipun Anda belum membuat relasi ID antara renstra_program dan hirarki.
         
         Jika nanti Anda sudah punya kolom penghubungnya di tabel "renstra_program" (Misal: id_indikator_sasaran),
         Ubah "ON 1=1" menjadi "ON rp.id_indikator_sasaran = h_indikator.id"
      */
      LEFT JOIN hirarki h_indikator ON 1=1 
      LEFT JOIN hirarki h_sasaran ON h_indikator.parent_id = h_sasaran.id

      LEFT JOIN rka_belanja rb ON rh.id_rka = rb.id_rka
    `;

    const queryParams = [];
    if (tahun) {
      query += ` WHERE rh.id_tahun = ? `;
      queryParams.push(tahun);
    }

    query += ` GROUP BY rh.id_sub_kegiatan, rh.id_tahun ORDER BY MAX(rp.kodering), MAX(rk.kodering), MAX(rsk.kodering) ASC `;

    const [rows] = await pool.query(query, queryParams);
    res.json(rows);

  } catch (err) {
    console.error("Query Error Rencana Aksi:", err.message);
    next(err);
  }
}