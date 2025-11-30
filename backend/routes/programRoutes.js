// backend/src/routes/programRoutes.js
import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// Helper: parse rencana whether DB returns JSON object or string
function parseRencana(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// dynamic years: next 5 years starting next year
function getYears() {
  const startYear = new Date().getFullYear() + 1;
  return Array.from({ length: 5 }, (_, i) => startYear + i);
}

/**
 * GET / -> programs with nested kegiatans and subkegiatans + aggregated rencana
 */
router.get("/", async (req, res, next) => {
  try {
    const YEARS = getYears();

    const [programs] = await pool.query("SELECT * FROM programs ORDER BY id ASC");
    if (!programs || programs.length === 0) return res.json([]);

    const programIds = programs.map((p) => p.id);
    const [kegiatans] = await pool.query(
      "SELECT * FROM kegiatans WHERE program_id IN (?) ORDER BY id ASC",
      [programIds.length ? programIds : [0]]
    );

    const kegiatanIds = kegiatans.map((k) => k.id);
    const [subkegiatans] = await pool.query(
      "SELECT * FROM subkegiatans WHERE kegiatan_id IN (?) ORDER BY id ASC",
      [kegiatanIds.length ? kegiatanIds : [0]]
    );

    const subByKegiatan = {};
    for (const s of subkegiatans) {
      s.rencana = parseRencana(s.rencana);
      subByKegiatan[s.kegiatan_id] = subByKegiatan[s.kegiatan_id] || [];
      subByKegiatan[s.kegiatan_id].push(s);
    }

    const kegByProgram = {};
    for (const k of kegiatans) {
      const subs = subByKegiatan[k.id] || [];
      k.subkegiatans = subs;

      const rencanaK = {};
      for (const y of YEARS) {
        let maxTarget = null;
        let sumPagu = 0;
        for (const s of subs) {
          const r = s.rencana || {};
          const ryear = r[String(y)] || {};
          const t = Number(ryear.target ?? NaN);
          const p = Number(ryear.pagu ?? 0);
          if (!isNaN(t)) {
            if (maxTarget === null || t > maxTarget) maxTarget = t;
          }
          sumPagu += isNaN(p) ? 0 : p;
        }
        rencanaK[y] = { target: maxTarget === null ? null : maxTarget, pagu: sumPagu };
      }

      k.rencana = rencanaK;
      kegByProgram[k.program_id] = kegByProgram[k.program_id] || [];
      kegByProgram[k.program_id].push(k);
    }

    const result = programs.map((p) => {
      const ks = kegByProgram[p.id] || [];
      const rencanaP = {};
      for (const y of YEARS) {
        let maxTarget = null;
        let sumPagu = 0;
        for (const k of ks) {
          const kr = k.rencana || {};
          const kt = Number((kr[y]?.target) ?? NaN);
          const kp = Number((kr[y]?.pagu) ?? 0);
          if (!isNaN(kt)) {
            if (maxTarget === null || kt > maxTarget) maxTarget = kt;
          }
          sumPagu += isNaN(kp) ? 0 : kp;
        }
        rencanaP[y] = { target: maxTarget === null ? null : maxTarget, pagu: sumPagu };
      }

      return {
        ...p,
        kegiatans: ks,
        rencana: rencanaP,
      };
    });

    return res.json(result);
  } catch (err) {
    console.error("programs:list", err);
    return next(err);
  }
});

/**
 * POST / -> create program
 */
router.post("/", async (req, res, next) => {
  try {
    const { kodering, name, indikator, output, keterangan } = req.body;
    if (!name) return res.status(422).json({ message: "Nama Program wajib diisi." });

    const [result] = await pool.query(
      "INSERT INTO programs (kodering, name, indikator, output, keterangan, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
      [kodering || null, name, indikator || null, output || null, keterangan || null, req.user?.id ?? null]
    );
    const [rows] = await pool.query("SELECT * FROM programs WHERE id = ? LIMIT 1", [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error("programs:create", err);
    return next(err);
  }
});

/**
 * PATCH /:id -> update program
 */
router.patch("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { kodering, name, indikator, output, keterangan } = req.body;
    if (!id) return res.status(400).json({ message: "Invalid id" });

    const fields = [];
    const values = [];
    if (kodering !== undefined) { fields.push("kodering = ?"); values.push(kodering); }
    if (name !== undefined) { fields.push("name = ?"); values.push(name); }
    if (indikator !== undefined) { fields.push("indikator = ?"); values.push(indikator); }
    if (output !== undefined) { fields.push("output = ?"); values.push(output); }
    if (keterangan !== undefined) { fields.push("keterangan = ?"); values.push(keterangan); }

    if (fields.length === 0) return res.status(400).json({ message: "Tidak ada field untuk diupdate." });

    values.push(id);
    const sql = `UPDATE programs SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`;
    await pool.query(sql, values);

    const [rows] = await pool.query("SELECT * FROM programs WHERE id = ? LIMIT 1", [id]);
    return res.json(rows[0]);
  } catch (err) {
    console.error("programs:update", err);
    return next(err);
  }
});

/**
 * DELETE /:id -> delete program (cascade FK will remove kegiatans/subkegiatans)
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await pool.query("DELETE FROM programs WHERE id = ?", [id]);
    return res.json({ message: "Program dihapus." });
  } catch (err) {
    console.error("programs:delete", err);
    return next(err);
  }
});

/**
 * POST /kegiatans -> create kegiatan
 */
router.post("/kegiatans", async (req, res, next) => {
  try {
    const { program_id, kodering, name, indikator, output, keterangan } = req.body;
    if (!program_id || !name) return res.status(422).json({ message: "Program dan Nama Kegiatan wajib diisi." });

    const [result] = await pool.query(
      "INSERT INTO kegiatans (program_id, kodering, name, indikator, output, keterangan, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
      [program_id, kodering || null, name, indikator || null, output || null, keterangan || null, req.user?.id ?? null]
    );
    const [rows] = await pool.query("SELECT * FROM kegiatans WHERE id = ? LIMIT 1", [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error("kegiatans:create", err);
    return next(err);
  }
});

/**
 * PATCH /kegiatans/:id -> update kegiatan
 */
router.patch("/kegiatans/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { kodering, name, indikator, output, keterangan } = req.body;
    if (!id) return res.status(400).json({ message: "Invalid id" });

    const fields = [];
    const values = [];
    if (kodering !== undefined) { fields.push("kodering = ?"); values.push(kodering); }
    if (name !== undefined) { fields.push("name = ?"); values.push(name); }
    if (indikator !== undefined) { fields.push("indikator = ?"); values.push(indikator); }
    if (output !== undefined) { fields.push("output = ?"); values.push(output); }
    if (keterangan !== undefined) { fields.push("keterangan = ?"); values.push(keterangan); }

    if (fields.length === 0) return res.status(400).json({ message: "Tidak ada field untuk diupdate." });

    values.push(id);
    const sql = `UPDATE kegiatans SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`;
    await pool.query(sql, values);

    const [rows] = await pool.query("SELECT * FROM kegiatans WHERE id = ? LIMIT 1", [id]);
    return res.json(rows[0]);
  } catch (err) {
    console.error("kegiatans:update", err);
    return next(err);
  }
});

/**
 * DELETE /kegiatans/:id -> delete kegiatan (cascade removes subkegiatans)
 */
router.delete("/kegiatans/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await pool.query("DELETE FROM kegiatans WHERE id = ?", [id]);
    return res.json({ message: "Kegiatan dihapus." });
  } catch (err) {
    console.error("kegiatans:delete", err);
    return next(err);
  }
});

/**
 * POST /subkegiatans -> create subkegiatan with rencana
 */
router.post("/subkegiatans", async (req, res, next) => {
  try {
    const { kegiatan_id, kodering, name, output, indikator, satuan, keterangan, rencana } = req.body;
    if (!kegiatan_id || !name) return res.status(422).json({ message: "Kegiatan dan Nama SubKegiatan wajib diisi." });

    const rencanaStr = rencana ? JSON.stringify(rencana) : null;

    const [result] = await pool.query(
      "INSERT INTO subkegiatans (kegiatan_id, kodering, name, output, indikator, satuan, keterangan, rencana, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
      [kegiatan_id, kodering || null, name, output || null, indikator || null, satuan || null, keterangan || null, rencanaStr, req.user?.id ?? null]
    );

    const [rows] = await pool.query("SELECT * FROM subkegiatans WHERE id = ? LIMIT 1", [result.insertId]);
    const inserted = rows[0];
    inserted.rencana = parseRencana(inserted.rencana);

    return res.status(201).json(inserted);
  } catch (err) {
    console.error("subkegiatans:create", err);
    return next(err);
  }
});

/**
 * PATCH /subkegiatans/:id -> update subkegiatan (including rencana)
 */
router.patch("/subkegiatans/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { kodering, name, output, indikator, satuan, keterangan, rencana } = req.body;
    if (!id) return res.status(400).json({ message: "Invalid id" });

    const fields = [];
    const values = [];
    if (kodering !== undefined) { fields.push("kodering = ?"); values.push(kodering); }
    if (name !== undefined) { fields.push("name = ?"); values.push(name); }
    if (output !== undefined) { fields.push("output = ?"); values.push(output); }
    if (indikator !== undefined) { fields.push("indikator = ?"); values.push(indikator); }
    if (satuan !== undefined) { fields.push("satuan = ?"); values.push(satuan); }
    if (keterangan !== undefined) { fields.push("keterangan = ?"); values.push(keterangan); }
    if (rencana !== undefined) { fields.push("rencana = ?"); values.push(JSON.stringify(rencana)); }

    if (fields.length === 0) return res.status(400).json({ message: "Tidak ada field untuk diupdate." });

    values.push(id);
    const sql = `UPDATE subkegiatans SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`;
    await pool.query(sql, values);

    const [rows] = await pool.query("SELECT * FROM subkegiatans WHERE id = ? LIMIT 1", [id]);
    const updated = rows[0];
    updated.rencana = parseRencana(updated.rencana);

    return res.json(updated);
  } catch (err) {
    console.error("subkegiatans:update", err);
    return next(err);
  }
});

/**
 * DELETE /subkegiatans/:id -> delete subkegiatan
 */
router.delete("/subkegiatans/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await pool.query("DELETE FROM subkegiatans WHERE id = ?", [id]);
    return res.json({ message: "SubKegiatan dihapus." });
  } catch (err) {
    console.error("subkegiatans:delete", err);
    return next(err);
  }
});

export default router;
