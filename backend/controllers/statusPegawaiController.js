import pool from "../config/db.js";

export const getAllStatus = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM status_pegawai_options ORDER BY urutan ASC, label ASC"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createStatus = async (req, res) => {
  const { label } = req.body;
  if (!label?.trim())
    return res.status(400).json({ success: false, message: "Label wajib diisi" });
  try {
    const [result] = await pool.query(
      "INSERT INTO status_pegawai_options (label) VALUES (?)", [label.trim()]
    );
    res.status(201).json({ success: true, id: result.insertId, label: label.trim() });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ success: false, message: "Status sudah ada" });
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      "DELETE FROM status_pegawai_options WHERE id = ?", [id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "Status tidak ditemukan" });
    res.json({ success: true, message: "Status berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};