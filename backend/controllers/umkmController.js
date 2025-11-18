// import pool from "../config/db.js";

// export const getAllData = async (req, res) => {
//   try {
//     let { page, limit, kecamatan, kelurahan, search } = req.query;

//     // default pagination
//     page = parseInt(page) || 1;
//     limit = parseInt(limit) || 100;
//     const offset = (page - 1) * limit;

//     // base query
//     let query = "SELECT * FROM data_umkm_global_kotor WHERE 1=1";
//     const params = [];

//     // optional filter
//     if (kecamatan) {
//       query += " AND kecamatan LIKE ?";
//       params.push(`%${kecamatan}%`);
//     }
//     if (kelurahan) {
//       query += " AND kelurahan_desa LIKE ?";
//       params.push(`%${kelurahan}%`);
//     }
//     if (search) {
//       query +=
//         " AND (nama_pemilik LIKE ? OR nama_usaha LIKE ? OR nama_produk LIKE ? OR alamat LIKE ?)";
//       params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
//     }

//     // count total data
//     const [countRows] = await pool.query(query, params);
//     const total = countRows.length;

//     // tambah limit & offset
//     query += " ORDER BY id ASC LIMIT ? OFFSET ?";
//     params.push(limit, offset);

//     // eksekusi query
//     const [rows] = await pool.query(query, params);

//     res.status(200).json({
//       success: true,
//       total,
//       page,
//       limit,
//       count: rows.length,
//       data: rows,
//     });
//   } catch (err) {
//     console.error("❌ Error saat ambil data:", err);
//     res.status(500).json({
//       success: false,
//       message: "Gagal mengambil data",
//       error: err.message,
//     });
//   }
// };

// export const getDataById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const [rows] = await pool.query(
//       "SELECT * FROM data_umkm_global_kotor WHERE id = ?",
//       [id]
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: `Data dengan ID ${id} tidak ditemukan`,
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: rows[0],
//     });
//   } catch (err) {
//     console.error("❌ Error ambil data by ID:", err);
//     res.status(500).json({
//       success: false,
//       message: "Gagal mengambil data berdasarkan ID",
//       error: err.message,
//     });
//   }
// };

// export const getAllDataBersih = async (req, res) => {
//   try {
//     let { page, limit, kecamatan, kelurahan, search } = req.query;

//     // 📄 Pagination default
//     page = parseInt(page) || 1;
//     limit = parseInt(limit) || 100;
//     const offset = (page - 1) * limit;

//     // 🏗️ Base query
//     let query = "SELECT * FROM data_umkm_global_bersih WHERE 1=1"; // ✅ tabel baru: "bersih"
//     const params = [];

//     // 🔍 Optional Filter
//     if (kecamatan) {
//       query += " AND kecamatan LIKE ?";
//       params.push(`%${kecamatan}%`);
//     }
//     if (kelurahan) {
//       query += " AND kelurahan_desa LIKE ?";
//       params.push(`%${kelurahan}%`);
//     }
//     if (search) {
//       query += `
//         AND (
//           nama_pemilik LIKE ? OR 
//           nama_usaha LIKE ? OR 
//           nama_produk LIKE ? OR 
//           alamat LIKE ?
//         )`;
//       params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
//     }

//     // 📊 Hitung total data (tanpa limit)
//     const [countRows] = await pool.query(query, params);
//     const total = countRows.length;

//     // 📋 Tambah limit & offset
//     query += " ORDER BY id ASC LIMIT ? OFFSET ?";
//     params.push(limit, offset);

//     // 🚀 Eksekusi query utama
//     const [rows] = await pool.query(query, params);

//     // ✅ Kirim hasil ke frontend
//     res.status(200).json({
//       success: true,
//       total,
//       page,
//       limit,
//       count: rows.length,
//       data: rows,
//     });
//   } catch (err) {
//     console.error("❌ Error saat ambil data bersih:", err);
//     res.status(500).json({
//       success: false,
//       message: "Gagal mengambil data bersih",
//       error: err.message,
//     });
//   }
// };

// export const getDataBersihById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const [rows] = await pool.query(
//       "SELECT * FROM data_umkm_global_bersih WHERE id = ?",
//       [id]
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Data dengan ID bersih tidak ditemukan",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: rows[0],
//     });
//   } catch (err) {
//     console.error("❌ Error getDataBersihById:", err);
//     res.status(500).json({
//       success: false,
//       message: "Gagal mengambil data by ID",
//       error: err.message,
//     });
//   }
// };


// export default { getAllData, getDataById, getAllDataBersih, getDataBersihById };

import pool from "../config/db.js";

export const getUMKMList = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      search = "",
      kecamatan = "",
      desa = "",
      jenis_ukm = "",
    } = req.query;

    const offset = (page - 1) * limit;
    const params = [];

    // 🧩 Base Query
    let sql = `
      SELECT 
        id,
        nama,
        jenis_kelamin,
        nama_usaha,
        alamat,
        kecamatan,
        desa,
        longitude,
        latitude,
        jenis_ukm,
        nib
      FROM data_umkm
      WHERE 1=1
    `;

    // 🔎 CASE INSENSITIVE SEARCH FIX
    if (search) {
      sql += `
        AND (
          LOWER(nama) LIKE ? OR
          LOWER(nama_usaha) LIKE ? OR
          LOWER(nib) LIKE ? OR
          LOWER(alamat) LIKE ? OR
          LOWER(kecamatan) LIKE ? OR
          LOWER(desa) LIKE ? OR
          LOWER(jenis_ukm) LIKE ?
        )
      `;
      const s = `%${search.toLowerCase()}%`;
      for (let i = 0; i < 7; i++) params.push(s);
    }

    // 🔍 Filter tambahan
    if (kecamatan) {
      sql += ` AND LOWER(kecamatan) = ?`;
      params.push(kecamatan.toLowerCase());
    }

    if (desa) {
      sql += ` AND LOWER(desa) = ?`;
      params.push(desa.toLowerCase());
    }

    if (jenis_ukm) {
      sql += ` AND LOWER(jenis_ukm) = ?`;
      params.push(jenis_ukm.toLowerCase());
    }

    // 🔢 Order & Limit
    sql += ` ORDER BY id ASC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(sql, params);

    // 🧮 Hitung total hasil
    let countQuery = `
      SELECT COUNT(*) AS total
      FROM data_umkm
      WHERE 1=1
    `;
    const countParams = [];

    if (search) {
      countQuery += `
        AND (
          LOWER(nama) LIKE ? OR
          LOWER(nama_usaha) LIKE ? OR
          LOWER(nib) LIKE ? OR
          LOWER(alamat) LIKE ? OR
          LOWER(kecamatan) LIKE ? OR
          LOWER(desa) LIKE ? OR
          LOWER(jenis_ukm) LIKE ?
        )
      `;
      const s = `%${search.toLowerCase()}%`;
      for (let i = 0; i < 7; i++) countParams.push(s);
    }

    if (kecamatan) {
      countQuery += ` AND LOWER(kecamatan) = ?`;
      countParams.push(kecamatan.toLowerCase());
    }

    if (desa) {
      countQuery += ` AND LOWER(desa) = ?`;
      countParams.push(desa.toLowerCase());
    }

    if (jenis_ukm) {
      countQuery += ` AND LOWER(jenis_ukm) = ?`;
      countParams.push(jenis_ukm.toLowerCase());
    }

    const [[{ total }]] = await pool.query(countQuery, countParams);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
      },
    });
  } catch (err) {
    console.error("❌ getUMKMList Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat mengambil data UMKM.",
    });
  }
};

/* ============================================================
   📌 1. CREATE DATA UMKM
============================================================ */
export const createUMKM = async (req, res) => {
  try {
    const {
      nama,
      jenis_kelamin,
      nama_usaha,
      alamat,
      kecamatan,
      desa,
      longitude,
      latitude,
      jenis_ukm,
      nib,
    } = req.body;

    const userId = req.user?.id || null; // ID user dari token

    // ============================
    // 1. Validasi wajib isi
    // ============================
    if (!nama || !nama_usaha || !alamat || !kecamatan || !desa) {
      return res.status(400).json({
        success: false,
        message: "Nama, Nama Usaha, Alamat, Kecamatan, dan Desa wajib diisi.",
      });
    }

    // ============================
    // 2. Validasi Nama
    // ============================
    const nameRegex = /^[a-zA-Z\s.'-]+$/;

    if (!nameRegex.test(nama)) {
      return res.status(400).json({
        success: false,
        message: "Format nama tidak valid! Hanya huruf dan spasi.",
      });
    }

    if (!nameRegex.test(nama_usaha)) {
      return res.status(400).json({
        success: false,
        message: "Format nama usaha tidak valid! Hanya huruf dan spasi.",
      });
    }

    // ============================
    // 3. Validasi Longitude & Latitude
    // ============================
    const lon = parseFloat(longitude);
    const lat = parseFloat(latitude);

    if (isNaN(lon) || isNaN(lat)) {
      return res.status(400).json({
        success: false,
        message: "Longitude & Latitude harus berupa angka.",
      });
    }

    if (lon < -180 || lon > 180) {
      return res.status(400).json({
        success: false,
        message: "Longitude tidak valid (range: -180 sampai 180).",
      });
    }

    if (lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: "Latitude tidak valid (range: -90 sampai 90).",
      });
    }

    // CEK lokasi duplikat
    const [[gpsExists]] = await pool.query(
      `SELECT id FROM data_umkm WHERE longitude = ? AND latitude = ?`,
      [longitude, latitude]
    );

    if (gpsExists) {
      return res.status(400).json({
        success: false,
        message:
          "Lokasi (longitude & latitude) sudah pernah digunakan oleh UMKM lain!",
      });
    }

    // ============================
    // 4. Validasi NIB
    // ============================
    if (nib && nib !== "") {
      const nibRegex = /^[0-9]{13}$/;

      if (!nibRegex.test(nib)) {
        return res.status(400).json({
          success: false,
          message:
            "Format NIB tidak valid! Harus 13 digit angka (contoh: 9120307492738).",
        });
      }

      const [[nibExists]] = await pool.query(
        `SELECT id FROM data_umkm WHERE nib = ?`,
        [nib]
      );

      if (nibExists) {
        return res.status(400).json({
          success: false,
          message: "NIB sudah terdaftar! Tidak boleh duplikat.",
        });
      }
    }

    // ============================
    // 5. Cek Duplikasi Nama + Usaha
    // ============================
    const [[duplicateName]] = await pool.query(
      `SELECT id FROM data_umkm 
       WHERE LOWER(nama) = ? AND LOWER(nama_usaha) = ?`,
      [nama.toLowerCase(), nama_usaha.toLowerCase()]
    );

    if (duplicateName) {
      return res.status(400).json({
        success: false,
        message: "Nama + Nama Usaha sudah ada di database.",
      });
    }

    // ============================
    // 6. Insert Data UMKM
    // ============================
    const sql = `
      INSERT INTO data_umkm 
      (nama, jenis_kelamin, nama_usaha, alamat, kecamatan, desa, longitude, latitude, jenis_ukm, nib)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      nama,
      jenis_kelamin,
      nama_usaha,
      alamat,
      kecamatan,
      desa,
      longitude,
      latitude,
      jenis_ukm,
      nib || null,
    ]);

    const newId = result.insertId;

    // ============================
    // 7. Simpan Log User
    // ============================
    await pool.query(
      `INSERT INTO user_logs (user_id, action, description, ip_address, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [
        userId,
        "CREATE UMKM",
        `Menambahkan UMKM ID: ${newId}, Nama: ${nama}`,
        req.ip || "-",
      ]
    );

    // ============================
    // 8. Response OK
    // ============================
    res.json({
      success: true,
      message: "Data UMKM berhasil ditambahkan.",
      id: newId,
    });

  } catch (err) {
    console.error("❌ createUMKM Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Gagal menambahkan data UMKM.",
    });
  }
};




/* ============================================================
   📌 2. GET DETAIL BY ID
============================================================ */
export const getUMKMDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT * FROM data_umkm WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data UMKM tidak ditemukan.",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });

  } catch (err) {
    console.error("❌ getUMKMDetail Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail UMKM.",
    });
  }
};


/* ============================================================
   📌 3. UPDATE DATA UMKM
============================================================ */
export const updateUMKM = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nama,
      jenis_kelamin,
      nama_usaha,
      alamat,
      kecamatan,
      desa,
      longitude,
      latitude,
      jenis_ukm,
      nib,
    } = req.body;

    const userId = req.user?.id || null;

    // ============================
    // Ambil data lama untuk log
    // ============================
    const [[oldData]] = await pool.query(
      `SELECT * FROM data_umkm WHERE id = ?`,
      [id]
    );

    if (!oldData) {
      return res.status(404).json({
        success: false,
        message: "Data UMKM tidak ditemukan.",
      });
    }

    // ============================
    // Validasi wajib isi
    // ============================
    if (!nama || !nama_usaha || !alamat || !kecamatan || !desa) {
      return res.status(400).json({
        success: false,
        message: "Nama, Nama Usaha, Alamat, Kecamatan, dan Desa wajib diisi.",
      });
    }

    // ============================
    // Update Data
    // ============================
    await pool.query(
      `
      UPDATE data_umkm SET
      nama=?, jenis_kelamin=?, nama_usaha=?, alamat=?, kecamatan=?, desa=?,
      longitude=?, latitude=?, jenis_ukm=?, nib=?
      WHERE id=?
      `,
      [
        nama,
        jenis_kelamin,
        nama_usaha,
        alamat,
        kecamatan,
        desa,
        longitude,
        latitude,
        jenis_ukm,
        nib || null,
        id,
      ]
    );

    // ============================
    // Simpan Log Update
    // ============================
    await pool.query(
      `INSERT INTO user_logs (user_id, action, description, ip_address, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [
        userId,
        "UPDATE UMKM",
        `Mengubah UMKM ID: ${id}, Nama: ${oldData.nama} → ${nama}`,
        req.ip || "-",
      ]
    );

    res.json({
      success: true,
      message: "Data UMKM berhasil diperbarui.",
    });

  } catch (err) {
    console.error("❌ updateUMKM Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui data UMKM.",
    });
  }
};




/* ============================================================
   📌 4. DELETE DATA UMKM
============================================================ */
export const deleteUMKM = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // dari token

  try {
    // 1. Ambil data UMKM
    const [rows] = await pool.query(
      "SELECT * FROM data_umkm WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data UMKM tidak ditemukan."
      });
    }

    const umkm = rows[0];

    // 2. Masukkan ke tabel deleted
    await pool.query(
      `INSERT INTO data_umkm_deleted
      (umkm_id, nama, jenis_kelamin, nama_usaha, alamat, kecamatan, desa,
       longitude, latitude, jenis_ukm, nib, deleted_by, deleted_at, original_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
      `,
      [
        umkm.id,
        umkm.nama,
        umkm.jenis_kelamin,
        umkm.nama_usaha,
        umkm.alamat,
        umkm.kecamatan,
        umkm.desa,
        umkm.longitude,
        umkm.latitude,
        umkm.jenis_ukm,
        umkm.nib,
        userId,
        JSON.stringify(umkm)
      ]
    );

    // 3. Hapus dari tabel utama
    await pool.query("DELETE FROM data_umkm WHERE id = ?", [id]);

    // 4. Simpan ke log user
    await pool.query(
      `INSERT INTO user_logs (user_id, action, description, ip_address, created_at)
       VALUES (?, 'DELETE UMKM', ?, ?, NOW())`,
      [
        userId,
        `Menghapus UMKM dengan ID: ${id}, Nama: ${umkm.nama}`,
        req.ip || "-"
      ]
    );

    res.json({
      success: true,
      message: "Data UMKM berhasil dihapus (dipindahkan ke arsip)"
    });

  } catch (err) {
    console.error("❌ deleteUMKM Error:", err.message);

    res.status(500).json({
      success: false,
      message: "Gagal menghapus data UMKM."
    });
  }
};

