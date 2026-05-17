import pool from "../config/db.js";

async function run() {
  try {
    console.log("Fetching all items from kib_e table...");
    const [rows] = await pool.query("SELECT id, kode_barang, nama_barang, is_checked, checked_at FROM kib_e LIMIT 10");
    console.log("KIB E data rows:");
    console.log(rows);
    process.exit(0);
  } catch (err) {
    console.error("Error reading from database:", err);
    process.exit(1);
  }
}

run();
