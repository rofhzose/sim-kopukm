import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// GET /api/skm/dashboard
router.get("/dashboard", async (req, res, next) => {
  try {
    const { tahun } = req.query;

    const [layanan] = await pool.query(
      `SELECT 
        nama_layanan,
        COUNT(*) AS total_responden,
        ROUND(AVG((u1+u2+u3+u4+u5+u6+u7+u8+u9)/9), 2) AS rata_rata,
        ROUND((AVG((u1+u2+u3+u4+u5+u6+u7+u8+u9)/9) * 25), 2) AS nilai_skm
       FROM skmsurvey 
       WHERE tahun = ? 
       GROUP BY nama_layanan 
       ORDER BY nama_layanan`,
      [tahun]
    );

    const [stat] = await pool.query(
      `SELECT COUNT(*) AS total_responden FROM skmsurvey WHERE tahun = ?`,
      [tahun]
    );
    const total = Number(stat[0]?.total_responden) || 0;

    const populasi = total;
    const sampelMin = populasi > 1 ? Math.ceil(
      (populasi * Math.pow(1.96, 2) * 0.5 * 0.5) /
      (Math.pow(0.05, 2) * (populasi - 1) + Math.pow(1.96, 2) * 0.5 * 0.5)
    ) : 0;
    const capaian = sampelMin > 0 ? Math.round((total / sampelMin) * 100) : 0;

    const statistik = { populasi, sampel_min: sampelMin, total_responden: total, capaian };

    const [kelaminRows] = await pool.query(
      `SELECT jenis_kelamin AS label, COUNT(*) AS count
       FROM skmsurvey WHERE tahun = ? AND jenis_kelamin IS NOT NULL
       GROUP BY jenis_kelamin
       ORDER BY FIELD(jenis_kelamin,'Laki-laki','Perempuan')`,
      [tahun]
    );

    const [pendidikanRows] = await pool.query(
      `SELECT pendidikan AS label, COUNT(*) AS count
       FROM skmsurvey WHERE tahun = ? AND pendidikan IS NOT NULL
       GROUP BY pendidikan
       ORDER BY FIELD(pendidikan,'SD','SMP','SMA','Diploma','Sarjana','Magister','Doktoral')`,
      [tahun]
    );

    const [pekerjaanRows] = await pool.query(
      `SELECT pekerjaan AS label, COUNT(*) AS count
       FROM skmsurvey WHERE tahun = ? AND pekerjaan IS NOT NULL
       GROUP BY pekerjaan
       ORDER BY FIELD(pekerjaan,'Pegawai Negeri','Swasta','Wiraswasta','Pelajar','Mahasiswa','Tidak Bekerja')`,
      [tahun]
    );

    const KELAMIN_ALL    = ['Laki-laki', 'Perempuan'];
    const PENDIDIKAN_ALL = ['SD', 'SMP', 'SMA', 'Diploma', 'Sarjana', 'Magister', 'Doktoral'];
    const PEKERJAAN_ALL  = ['Pegawai Negeri', 'Swasta', 'Wiraswasta', 'Pelajar', 'Mahasiswa', 'Tidak Bekerja'];

    const fillAll = (allLabels, rows) => {
      const map = Object.fromEntries(rows.map(r => [r.label, Number(r.count)]));
      return allLabels.map(label => ({ label, count: map[label] || 0 }));
    };

    const withPercent = (items) => {
      const tot = items.reduce((s, r) => s + r.count, 0);
      return items.map(r => ({
        ...r,
        percent: tot > 0 ? Number(((r.count / tot) * 100).toFixed(1)) : 0,
      }));
    };

    const demografi = [
      { category: "Jenis Kelamin", items: withPercent(fillAll(KELAMIN_ALL,   kelaminRows))   },
      { category: "Pendidikan",    items: withPercent(fillAll(PENDIDIKAN_ALL, pendidikanRows)) },
      { category: "Pekerjaan",     items: withPercent(fillAll(PEKERJAAN_ALL,  pekerjaanRows))  },
    ];

    res.json({ layanan, statistik, demografi });

  } catch (err) {
    console.error("SKM dashboard error:", err);
    next(err);
  }
});

// POST /api/skm/survey
router.post("/survey", async (req, res, next) => {
  try {
    const {
      nama_layanan, u1, u2, u3, u4, u5, u6, u7, u8, u9, tahun,
      jenis_kelamin, pendidikan, pekerjaan
    } = req.body;

    if (!nama_layanan || !u1 || !u9 || !tahun) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    await pool.query(
      `INSERT INTO skmsurvey 
       (nama_layanan, u1, u2, u3, u4, u5, u6, u7, u8, u9, tahun, jenis_kelamin, pendidikan, pekerjaan) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nama_layanan, u1, u2, u3, u4, u5, u6, u7, u8, u9, tahun,
       jenis_kelamin || null, pendidikan || null, pekerjaan || null]
    );

    res.json({ message: "Survey SKM berhasil disimpan" });
  } catch (err) {
    console.error("SKM create error:", err);
    next(err);
  }
});

// GET /api/skm/survey
router.get("/survey", async (req, res, next) => {
  try {
    const { tahun, nama_layanan } = req.query;

    let sql = `SELECT * FROM skmsurvey`;
    const params = [];
    const conditions = [];

    if (tahun) {
      conditions.push(`tahun = ?`);
      params.push(tahun);
    }

    if (nama_layanan) {
      conditions.push(`nama_layanan = ?`);
      params.push(nama_layanan);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(" AND ");
    }

    sql += ` ORDER BY id DESC`;

    const [rows] = await pool.query(sql, params);

    res.json({ data: rows });
  } catch (err) {
    console.error("SKM survey get error:", err);
    next(err);
  }
});

export default router;