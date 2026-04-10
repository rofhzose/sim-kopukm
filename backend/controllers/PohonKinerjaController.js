import pool from "../config/db.js";

export async function getPohonKinerja(req, res, next) {
  try {
    let query = `
      SELECT 
        /* Level Program (Bidang) */
        rp.id AS id_program,
        rp.nama_program,
        rp.output_program AS sasaran_program,
        rp.indikator_program,

        /* Level Kegiatan (Subkoor) */
        rk.id AS id_kegiatan,
        rk.nama_kegiatan,
        rk.output_kegiatan AS sasaran_kegiatan,
        rk.indikator_kegiatan,

        /* Level Sub Kegiatan (Pelaksana) */
        rsk.id AS id_sub,
        rsk.nama_sub,
        rsk.output_sub AS sasaran_sub,
        rsk.indikator_sub
        
      FROM renstra_program rp
      LEFT JOIN renstra_kegiatan rk ON rp.id = rk.program_id
      LEFT JOIN renstra_sub_kegiatan rsk ON rk.id = rsk.kegiatan_id
      
      /* KITA HAPUS SEMENTARA JOIN KE TABEL HIRARKI DI SINI 
         UNTUK MENCEGAH PENGGANDAAN POHON (CARTESIAN PRODUCT).
         Nantinya baru disambung jika tabel renstra_program sudah punya relasi 'id_hirarki'
      */
      
      ORDER BY rp.kodering, rk.kodering, rsk.kodering ASC
    `;
    
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error getPohonKinerja:", err);
    next(err);
  }
}