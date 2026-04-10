import pool from "../config/db.js";

export const getSkmDashboard = async (req, res) => {
  try {
    const { tahun } = req.query;

    // 1. CARDS LAYANAN: Baca langsung dari skm_opd_detail
    const [layananRows] = await pool.query(`
      SELECT 
        jenis_layanan as id,
        jenis_layanan as nama_layanan,
        COUNT(id) as total_responden,
        ROUND(AVG((u1 + u2 + u3 + u4 + u5 + u6 + u7 + u8 + u9) / 9) * 25, 2) as nilai_skm,
        ROUND(AVG((u1 + u2 + u3 + u4 + u5 + u6 + u7 + u8 + u9) / 9), 2) as rata_rata
      FROM skm_opd_detail
      WHERE jenis_layanan IS NOT NULL AND jenis_layanan != ''
      GROUP BY jenis_layanan
    `);

    // 2. STATISTIK: Hitung total dari semua responden yang ada
    const [[statistik]] = await pool.query(`
      SELECT 
        105 as populasi, 
        83 as sampel_min, 
        COUNT(id) as total_responden,
        ROUND((COUNT(id) / 83) * 100, 1) as capaian
      FROM skm_opd_detail
    `);

    const totalResponden = statistik.total_responden || 1; // Cegah pembagian dengan nol

    // 3. DEMOGRAFI (GENDER)
    const [gender] = await pool.query(`
      SELECT 
        jenis_kelamin as label, 
        COUNT(id) as count,
        ROUND((COUNT(id) / ?) * 100, 1) as percent
      FROM skm_opd_detail
      WHERE jenis_kelamin IS NOT NULL
      GROUP BY jenis_kelamin
    `, [totalResponden]);

    // 4. DEMOGRAFI (PENDIDIKAN)
    const [pendidikan] = await pool.query(`
      SELECT 
        pendidikan as label, 
        COUNT(id) as count,
        ROUND((COUNT(id) / ?) * 100, 1) as percent
      FROM skm_opd_detail
      WHERE pendidikan IS NOT NULL
      GROUP BY pendidikan
    `, [totalResponden]);

    // 5. DEMOGRAFI (PEKERJAAN)
    const [pekerjaan] = await pool.query(`
      SELECT 
        pekerjaan as label, 
        COUNT(id) as count,
        ROUND((COUNT(id) / ?) * 100, 1) as percent
      FROM skm_opd_detail
      WHERE pekerjaan IS NOT NULL
      GROUP BY pekerjaan
    `, [totalResponden]);

    res.json({
      layanan: layananRows,
      statistik: statistik,
      demografi: [
        { category: "Jenis Kelamin", items: gender, color: "bg-sky-500" },
        { category: "Pendidikan", items: pendidikan, color: "bg-emerald-500" },
        { category: "Pekerjaan", items: pekerjaan, color: "bg-violet-500" }
      ]
    });

  } catch (error) {
    console.error("Error Dashboard SKM:", error);
    res.status(500).json({ message: error.message });
  }
};