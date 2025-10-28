import pool from "../config/db.js";

export const getAllData = async (req, res) => {
  try {
    let { page, limit, kecamatan, kelurahan, search } = req.query;

    // default pagination
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 100;
    const offset = (page - 1) * limit;

    // base query
    let query = "SELECT * FROM data_umkm_global_kotor WHERE 1=1";
    const params = [];

    // optional filter
    if (kecamatan) {
      query += " AND kecamatan LIKE ?";
      params.push(`%${kecamatan}%`);
    }
    if (kelurahan) {
      query += " AND kelurahan_desa LIKE ?";
      params.push(`%${kelurahan}%`);
    }
    if (search) {
      query +=
        " AND (nama_pemilik LIKE ? OR nama_usaha LIKE ? OR nama_produk LIKE ? OR alamat LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    // count total data
    const [countRows] = await pool.query(query, params);
    const total = countRows.length;

    // tambah limit & offset
    query += " ORDER BY id ASC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    // eksekusi query
    const [rows] = await pool.query(query, params);

    res.status(200).json({
      success: true,
      total,
      page,
      limit,
      count: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("❌ Error saat ambil data:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data",
      error: err.message,
    });
  }
};

export const getDataById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM data_umkm_global_kotor WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data dengan ID ${id} tidak ditemukan`,
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    console.error("❌ Error ambil data by ID:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data berdasarkan ID",
      error: err.message,
    });
  }
};

export const getAllDataBersih = async (req, res) => {
  try {
    let { page, limit, kecamatan, kelurahan, search } = req.query;

    // 📄 Pagination default
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 100;
    const offset = (page - 1) * limit;

    // 🏗️ Base query
    let query = "SELECT * FROM data_umkm_global_bersih WHERE 1=1"; // ✅ tabel baru: "bersih"
    const params = [];

    // 🔍 Optional Filter
    if (kecamatan) {
      query += " AND kecamatan LIKE ?";
      params.push(`%${kecamatan}%`);
    }
    if (kelurahan) {
      query += " AND kelurahan_desa LIKE ?";
      params.push(`%${kelurahan}%`);
    }
    if (search) {
      query += `
        AND (
          nama_pemilik LIKE ? OR 
          nama_usaha LIKE ? OR 
          nama_produk LIKE ? OR 
          alamat LIKE ?
        )`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    // 📊 Hitung total data (tanpa limit)
    const [countRows] = await pool.query(query, params);
    const total = countRows.length;

    // 📋 Tambah limit & offset
    query += " ORDER BY id ASC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    // 🚀 Eksekusi query utama
    const [rows] = await pool.query(query, params);

    // ✅ Kirim hasil ke frontend
    res.status(200).json({
      success: true,
      total,
      page,
      limit,
      count: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("❌ Error saat ambil data bersih:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data bersih",
      error: err.message,
    });
  }
};

export const getDataBersihById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM data_umkm_global_bersih WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data dengan ID bersih tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    console.error("❌ Error getDataBersihById:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data by ID",
      error: err.message,
    });
  }
};


export default { getAllData, getDataById, getAllDataBersih, getDataBersihById };