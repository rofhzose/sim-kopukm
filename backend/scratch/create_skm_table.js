import pool from "../config/db.js";

async function createSkmTable() {
  try {
    console.log("Creating skmsurvey table...");
    const sql = `
      CREATE TABLE IF NOT EXISTS skmsurvey (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_layanan VARCHAR(255) NOT NULL,
        u1 INT NOT NULL,
        u2 INT NOT NULL,
        u3 INT NOT NULL,
        u4 INT NOT NULL,
        u5 INT NOT NULL,
        u6 INT NOT NULL,
        u7 INT NOT NULL,
        u8 INT NOT NULL,
        u9 INT NOT NULL,
        tahun VARCHAR(4) NOT NULL,
        jenis_kelamin VARCHAR(50),
        pendidikan VARCHAR(100),
        pekerjaan VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;
    await pool.query(sql);
    console.log("Table created successfully!");
  } catch (error) {
    console.error("Error creating table:", error);
  } finally {
    process.exit(0);
  }
}

createSkmTable();
