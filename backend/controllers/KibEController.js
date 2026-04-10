import pool from "../config/db.js";

// GET ALL
export async function getAll(req, res, next) {
  try {
    const query = "SELECT * FROM kib_e ORDER BY id DESC";
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET BY ID
export async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM kib_e WHERE id = ?", [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }
    
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// CREATE
export async function create(req, res, next) {
  try {
    const data = req.body;
    
    // Construct query dynamically based on keys
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    const placeholders = keys.map(() => "?").join(", ");
    const columns = keys.join(", ");
    
    const query = `INSERT INTO kib_e (${columns}) VALUES (${placeholders})`;
    
    const [result] = await pool.query(query, values);

    res.status(201).json({ 
      success: true,
      message: "Berhasil tambah data KIB E", 
      id: result.insertId 
    });
  } catch (err) {
    next(err);
  }
}

// UPDATE
export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    // Create SET clause like "column1 = ?, column2 = ?"
    const setClause = keys.map(key => `${key} = ?`).join(", ");
    
    const query = `UPDATE kib_e SET ${setClause} WHERE id = ?`;
    
    const [result] = await pool.query(query, [...values, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json({ 
      success: true,
      message: "Data KIB E berhasil diperbarui" 
    });
  } catch (err) {
    next(err);
  }
}

// DELETE
export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM kib_e WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json({ message: "Berhasil hapus data KIB E" });
  } catch (err) {
    next(err);
  }
}
