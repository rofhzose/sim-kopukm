// backend/src/controllers/hirarkiController.js
import pool from "../config/db.js";

/**
 * Helper: pastikan field data adalah objek, atau parse jika string.
 * Mengembalikan { ok: true, data: object } atau { ok: false, message }
 */
function normalizeDataField(raw) {
  if (raw === null || raw === undefined) {
    return { ok: false, message: "Field 'data' wajib diisi." };
  }
  // jika sudah object (mysql2 dengan JSON kolom biasanya mengembalikan object)
  if (typeof raw === "object") return { ok: true, data: raw };

  // jika string, coba parse
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object") return { ok: true, data: parsed };
      return { ok: false, message: "Field 'data' harus berisi JSON/object." };
    } catch (err) {
      return { ok: false, message: "Field 'data' bukan JSON valid." };
    }
  }

  return { ok: false, message: "Field 'data' harus berbentuk object/JSON." };
}

export default {
  // GET /hirarki
  async index(req, res, next) {
    try {
      const [rows] = await pool.query("SELECT * FROM hirarki ORDER BY id DESC");
      // normalisasi tiap row agar `data` selalu object di response
      const normalized = rows.map((r) => {
        const n = normalizeDataField(r.data);
        return { ...r, data: n.ok ? n.data : r.data };
      });
      return res.json(normalized);
    } catch (err) {
      console.error("hirarki:index", err);
      return next(err);
    }
  },

  // GET /hirarki/:id
  async show(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ message: "ID tidak valid." });

      const [rows] = await pool.query("SELECT * FROM hirarki WHERE id = ? LIMIT 1", [id]);
      if (!rows || rows.length === 0) return res.status(404).json({ message: "Data tidak ditemukan." });

      const row = rows[0];
      const n = normalizeDataField(row.data);
      row.data = n.ok ? n.data : row.data;

      return res.json(row);
    } catch (err) {
      console.error("hirarki:show", err);
      return next(err);
    }
  },

  // POST /hirarki
  async store(req, res, next) {
    try {
      const { title } = req.body;
      const dataRaw = req.body.data;

      // validasi minimal: data harus object / json
      const n = normalizeDataField(dataRaw);
      if (!n.ok) return res.status(422).json({ message: n.message });

      const dataStr = JSON.stringify(n.data);
      const createdBy = req.user?.id ?? null;

      const [result] = await pool.query(
        "INSERT INTO hirarki (title, data, created_by, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
        [title ?? null, dataStr, createdBy]
      );

      const insertedId = result.insertId;
      const [rows] = await pool.query("SELECT * FROM hirarki WHERE id = ? LIMIT 1", [insertedId]);
      if (!rows || rows.length === 0) return res.status(500).json({ message: "Gagal mengambil data terbaru." });

      const created = rows[0];
      const nn = normalizeDataField(created.data);
      created.data = nn.ok ? nn.data : created.data;

      return res.status(201).json(created);
    } catch (err) {
      console.error("hirarki:store", err);
      return next(err);
    }
  },

  // PUT /hirarki/:id
  async update(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ message: "ID tidak valid." });

      const [existingRows] = await pool.query("SELECT * FROM hirarki WHERE id = ? LIMIT 1", [id]);
      if (!existingRows || existingRows.length === 0) return res.status(404).json({ message: "Data tidak ditemukan." });

      const existing = existingRows[0];

      const title = req.body.title ?? existing.title;
      // jika user mengirim `data`, kita validasi; kalau tidak, pakai existing.data
      let dataToSave;
      if (req.body.data !== undefined) {
        const n = normalizeDataField(req.body.data);
        if (!n.ok) return res.status(422).json({ message: n.message });
        dataToSave = n.data;
      } else {
        // gunakan existing.data (normalize kalau perlu)
        const n = normalizeDataField(existing.data);
        dataToSave = n.ok ? n.data : existing.data;
      }

      const dataStr = JSON.stringify(dataToSave);

      await pool.query(
        "UPDATE hirarki SET title = ?, data = ?, updated_at = NOW() WHERE id = ?",
        [title, dataStr, id]
      );

      const [rows] = await pool.query("SELECT * FROM hirarki WHERE id = ? LIMIT 1", [id]);
      const updated = rows[0];
      const nn = normalizeDataField(updated.data);
      updated.data = nn.ok ? nn.data : updated.data;

      return res.json(updated);
    } catch (err) {
      console.error("hirarki:update", err);
      return next(err);
    }
  },

  // DELETE /hirarki/:id
  async destroy(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ message: "ID tidak valid." });

      const [existingRows] = await pool.query("SELECT id FROM hirarki WHERE id = ? LIMIT 1", [id]);
      if (!existingRows || existingRows.length === 0) return res.status(404).json({ message: "Data tidak ditemukan." });

      await pool.query("DELETE FROM hirarki WHERE id = ?", [id]);
      return res.json({ message: "Data berhasil dihapus." });
    } catch (err) {
      console.error("hirarki:destroy", err);
      return next(err);
    }
  },
};
