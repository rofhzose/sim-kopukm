import pool from "../config/db.js";

// GET ALL GUESTS
export async function getBukuTamu(req, res, next) {
  try {
    const { search, bulan, tahun, kegiatan } = req.query;
    let query = "SELECT * FROM buku_tamu WHERE 1=1";
    const params = [];

    if (search) {
      query += " AND (nama_tamu LIKE ? OR instansi LIKE ? OR jabatan LIKE ? OR kontak LIKE ?)";
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    if (bulan && bulan !== "Semua") {
      query += " AND MONTH(waktu_hadir) = ?";
      params.push(bulan);
    }

    if (tahun) {
      query += " AND YEAR(waktu_hadir) = ?";
      params.push(tahun);
    }

    if (kegiatan && kegiatan !== "Semua") {
      query += " AND kegiatan = ?";
      params.push(kegiatan);
    }

    query += " ORDER BY waktu_hadir DESC";

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET STATS
export async function getBukuTamuStats(req, res, next) {
  try {
    const [total] = await pool.query("SELECT COUNT(*) as count FROM buku_tamu");
    const [unik] = await pool.query("SELECT COUNT(DISTINCT nama_tamu) as count FROM buku_tamu");
    const [kegiatan] = await pool.query("SELECT COUNT(DISTINCT kegiatan) as count FROM buku_tamu");
    const [hadir] = await pool.query("SELECT COUNT(*) as count FROM buku_tamu WHERE status = 'Hadir'");

    res.json({
      total: total[0].count,
      unik: unik[0].count,
      kegiatan: kegiatan[0].count,
      hadir: hadir[0].count
    });
  } catch (err) {
    next(err);
  }
}

// GET UNIQUE KEGIATAN LIST
export async function getKegiatanList(req, res, next) {
  try {
    const [rows] = await pool.query("SELECT DISTINCT kegiatan FROM buku_tamu WHERE kegiatan IS NOT NULL AND kegiatan != ''");
    res.json(rows.map(r => r.kegiatan));
  } catch (err) {
    next(err);
  }
}

// POST NEW GUEST
export async function addBukuTamu(req, res, next) {
  try {
    const { nama_tamu, instansi, jabatan, kontak, kegiatan, keperluan, lokasi, kategori, metode } = req.body;
    
    const query = `
      INSERT INTO buku_tamu 
      (nama_tamu, instansi, jabatan, kontak, kegiatan, keperluan, lokasi, kategori, metode, waktu_hadir) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const [result] = await pool.query(query, [
      nama_tamu, instansi, jabatan, kontak, kegiatan, keperluan, lokasi || 'Dinas Koperasi dan UKM', kategori, metode || 'Manual'
    ]);

    res.status(201).json({ message: "Data tamu berhasil disimpan", id: result.insertId });
  } catch (err) {
    next(err);
  }
}

// DELETE GUEST
export async function deleteBukuTamu(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM buku_tamu WHERE id = ?", [id]);
    res.json({ message: "Data tamu berhasil dihapus" });
  } catch (err) {
    next(err);
  }
}
