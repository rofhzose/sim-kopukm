// backend/src/controllers/dokumenSotkController.js
import fs from "fs";
import path from "path";
import pool from "../config/db.js";

// helper path ke uploads
const UPLOAD_SUBDIR = "uploads/sotk";
const UPLOAD_DIR = path.join(process.cwd(), UPLOAD_SUBDIR);

/**
 * GET /api/dokumen/sotk
 * Query params: page, perPage (opsional)
 */
export const getAll = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const perPage = Math.max(1, parseInt(req.query.perPage || "100", 10));
  const offset = (page - 1) * perPage;

  try {
    const [rows] = await pool.query(
      `SELECT id, name, filename, path, size, mime, created_at, updated_at
       FROM dokumen_sotk
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [perPage, offset]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("dokumenSotkController.getAll ->", err);
    res.status(500).json({ success: false, message: "Gagal mengambil data" });
  }
};

/**
 * POST /api/dokumen/sotk/upload
 * multipart form-data: file, title (optional), created_by (optional)
 */
export const upload = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "File tidak ditemukan" });

  const title = req.body.title || req.file.originalname;
  const created_by = req.body.created_by ? Number(req.body.created_by) : null;
  const filename = req.file.filename;
  const filepath = `/${UPLOAD_SUBDIR}/${filename}`;
  const mime = req.file.mimetype;
  const size = req.file.size;

  try {
    const [result] = await pool.execute(
      `INSERT INTO dokumen_sotk (name, filename, path, size, mime, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, filename, filepath, size, mime, created_by]
    );
    const insertId = result.insertId;
    const [[row]] = await pool.query(
      `SELECT id, name, filename, path, size, mime, created_at FROM dokumen_sotk WHERE id = ?`,
      [insertId]
    );
    res.json({ success: true, data: row });
  } catch (err) {
    console.error("dokumenSotkController.upload ->", err);
    // hapus file jika db gagal
    try { fs.unlinkSync(path.join(UPLOAD_DIR, filename)); } catch (e) {}
    res.status(500).json({ success: false, message: "Gagal menyimpan metadata" });
  }
};

/**
 * PUT /api/dokumen/sotk/:id
 * body: { name }
 */
export const update = async (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body;
  if (!name) return res.status(400).json({ success: false, message: "Nama wajib diisi" });

  try {
    const [result] = await pool.execute(
      `UPDATE dokumen_sotk SET name = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
      [name, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Data tidak ditemukan" });

    const [[row]] = await pool.query(`SELECT id, name, filename, path, size, mime, created_at, updated_at FROM dokumen_sotk WHERE id = ?`, [id]);
    res.json({ success: true, data: row });
  } catch (err) {
    console.error("dokumenSotkController.update ->", err);
    res.status(500).json({ success: false, message: "Gagal mengupdate data" });
  }
};

/**
 * DELETE /api/dokumen/sotk/:id
 * Soft delete (set deleted_at). Optionally remove physical file.
 */
export const remove = async (req, res) => {
  const id = Number(req.params.id);

  try {
    const [[row]] = await pool.query(`SELECT filename, path FROM dokumen_sotk WHERE id = ? AND deleted_at IS NULL`, [id]);
    if (!row) return res.status(404).json({ success: false, message: "Data tidak ditemukan" });

    await pool.execute(`UPDATE dokumen_sotk SET deleted_at = NOW() WHERE id = ?`, [id]);

    // hapus fisik file (opsional) — jika mau simpan file, comment baris ini
    const filepath = path.join(process.cwd(), row.path.replace(/^\//, ""));
    fs.unlink(filepath, (err) => {
      if (err) console.warn("Tidak dapat menghapus file fisik:", filepath, err.message);
    });

    res.json({ success: true });
  } catch (err) {
    console.error("dokumenSotkController.remove ->", err);
    res.status(500).json({ success: false, message: "Gagal menghapus data" });
  }
};

