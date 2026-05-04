import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.post("/survey", async (req, res) => {
  try {
    const {
      jenis_kelamin,
      pendidikan,
      pekerjaan,
      tahun,
      u1, u2, u3, u4, u5, u6, u7, u8, u9
    } = req.body;

    const [responden] = await pool.query(
      `INSERT INTO skm_responden (jenis_kelamin, pendidikan, pekerjaan)
       VALUES (?, ?, ?)`,
      [jenis_kelamin, pendidikan, pekerjaan]
    );

    const responden_id = responden.insertId;

    await pool.query(
      `INSERT INTO skm_jawaban 
      (responden_id, u1,u2,u3,u4,u5,u6,u7,u8,u9,tahun)
      VALUES (?, ?,?,?,?,?,?,?,?,?,?)`,
      [responden_id, u1,u2,u3,u4,u5,u6,u7,u8,u9,tahun]
    );

    res.json({ message: "Survey berhasil dikirim" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal submit survey" });
  }
});

router.get("/hasil", async (req, res) => {
  try {
    const { tahun } = req.query;

    const [[data]] = await pool.query(`
      SELECT 
        COUNT(*) as total_responden,
        ROUND(AVG(u1),2) u1,
        ROUND(AVG(u2),2) u2,
        ROUND(AVG(u3),2) u3,
        ROUND(AVG(u4),2) u4,
        ROUND(AVG(u5),2) u5,
        ROUND(AVG(u6),2) u6,
        ROUND(AVG(u7),2) u7,
        ROUND(AVG(u8),2) u8,
        ROUND(AVG(u9),2) u9,
        ROUND(((AVG(u1)+AVG(u2)+AVG(u3)+AVG(u4)+AVG(u5)+AVG(u6)+AVG(u7)+AVG(u8)+AVG(u9))/9)*25,2) as nilai_ikm
      FROM skm_jawaban
      WHERE tahun = ?
    `, [tahun]);

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal ambil hasil" });
  }
});

export default router;