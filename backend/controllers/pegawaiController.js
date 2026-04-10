import pool from "../config/db.js";

/**
 * 📋 Get all pegawai (dengan nama jabatan & atasan)
 */
export const getPegawai = async (req, res, next) => {
  const { id } = req.params;

  try {
    let query = `
      SELECT 
        p.id_pegawai,
        p.id_user,
        p.nama_lengkap,
        p.nip,
        p.tempat_lahir,
        p.tanggal_lahir,
        p.golongan_ruang,
        p.pendidikan_formal,
        p.nama_sekolah,
        p.jurusan,
        p.tahun_lulus,
        p.jabatan_definitif,
        p.jabatan_tambahan,
        j.nama_jabatan,
        p.level,
        p.status_pegawai,
        p.kelas_pegawai,
        ph.id_atasan
      FROM pegawai p
      LEFT JOIN jabatan j 
        ON p.jabatan_definitif = j.id_jabatan
      LEFT JOIN pegawai_hirarki ph 
        ON p.id_pegawai = ph.id_pegawai
        AND (ph.valid_sampai IS NULL OR ph.valid_sampai >= CURDATE())
    `;

    const params = [];

    if (id) {
      query += " WHERE p.id_pegawai = ?";
      params.push(id);
    }

    query += " ORDER BY p.nama_lengkap ASC";

    const [rows] = await pool.query(query, params);

    if (id) {
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Pegawai tidak ditemukan",
        });
      }
      return res.json({ success: true, data: rows[0] });
    }

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("pegawai:get", err);
    return next(err);
  }
};

/**
 * ➕ Create new pegawai
 */
export const createPegawai = async (req, res, next) => {
  const { nama_lengkap, nip, level, id_jabatan, id_atasan, tempat_lahir, tanggal_lahir, golongan_ruang, pendidikan_formal, nama_sekolah, jurusan, tahun_lulus, status_pegawai, kelas_pegawai, id_user } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO pegawai 
       (id_user, nama_lengkap, nip, tempat_lahir, tanggal_lahir, golongan_ruang,
        pendidikan_formal, nama_sekolah, jurusan, tahun_lulus,
        jabatan_definitif, level, status_pegawai, kelas_pegawai) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_user || null,
        nama_lengkap,
        nip || null,
        tempat_lahir || null,
        tanggal_lahir || null,
        golongan_ruang || null,
        pendidikan_formal || null,
        nama_sekolah || null,
        jurusan || null,
        tahun_lulus || null,
        id_jabatan || null,
        level || 0,
        status_pegawai || null,
        kelas_pegawai || null,
      ],
    );

    const pegawaiId = result.insertId;

    if (id_atasan && id_atasan !== "0") {
      await connection.query(`INSERT INTO pegawai_hirarki (id_pegawai, id_atasan) VALUES (?, ?)`, [pegawaiId, id_atasan]);
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Pegawai berhasil ditambahkan",
      id: pegawaiId,
    });
  } catch (err) {
    await connection.rollback();
    console.error("pegawai:create", err);
    return next(err);
  } finally {
    connection.release();
  }
};

/**
 * ✏️ Update pegawai
 */
export const updatePegawai = async (req, res, next) => {
  const { id } = req.params;
  const { nama_lengkap, nip, level, id_jabatan, id_atasan, tempat_lahir, tanggal_lahir, golongan_ruang, pendidikan_formal, nama_sekolah, jurusan, tahun_lulus, status_pegawai, kelas_pegawai, id_user } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `UPDATE pegawai 
       SET id_user = ?, nama_lengkap = ?, nip = ?, tempat_lahir = ?, tanggal_lahir = ?,
           golongan_ruang = ?, pendidikan_formal = ?, nama_sekolah = ?, jurusan = ?,
           tahun_lulus = ?, jabatan_definitif = ?, level = ?, status_pegawai = ?, kelas_pegawai = ?
       WHERE id_pegawai = ?`,
      [
        id_user || null,
        nama_lengkap,
        nip || null,
        tempat_lahir || null,
        tanggal_lahir || null,
        golongan_ruang || null,
        pendidikan_formal || null,
        nama_sekolah || null,
        jurusan || null,
        tahun_lulus || null,
        id_jabatan || null,
        level || 0,
        status_pegawai || null,
        kelas_pegawai || null,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Pegawai tidak ditemukan" });
    }

    if (id_atasan && id_atasan !== "0") {
      const [existing] = await connection.query("SELECT * FROM pegawai_hirarki WHERE id_pegawai = ?", [id]);
      if (existing.length > 0) {
        await connection.query("UPDATE pegawai_hirarki SET id_atasan = ? WHERE id_pegawai = ?", [id_atasan, id]);
      } else {
        await connection.query("INSERT INTO pegawai_hirarki (id_pegawai, id_atasan) VALUES (?, ?)", [id, id_atasan]);
      }
    } else {
      await connection.query("DELETE FROM pegawai_hirarki WHERE id_pegawai = ?", [id]);
    }

    await connection.commit();

    return res.json({ success: true, message: "Data pegawai berhasil diperbarui" });
  } catch (err) {
    await connection.rollback();
    console.error("pegawai:update", err);
    return next(err);
  } finally {
    connection.release();
  }
};

/**
 * 🗑️ Delete pegawai
 */
export const deletePegawai = async (req, res, next) => {
  const { id } = req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query("DELETE FROM pegawai_hirarki WHERE id_pegawai = ?", [id]);

    const [result] = await connection.query("DELETE FROM pegawai WHERE id_pegawai = ?", [id]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Pegawai tidak ditemukan" });
    }

    await connection.commit();

    return res.json({ success: true, message: "Pegawai berhasil dihapus" });
  } catch (err) {
    await connection.rollback();
    console.error("pegawai:delete", err);
    return next(err);
  } finally {
    connection.release();
  }
};
