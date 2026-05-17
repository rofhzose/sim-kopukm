import pool from "../config/db.js";

async function addColumns() {
  try {
    console.log("Adding columns to kib_e...");
    await pool.query("ALTER TABLE kib_e ADD COLUMN is_checked TINYINT(1) DEFAULT 0, ADD COLUMN checked_at DATETIME NULL");
    console.log("Columns added successfully!");
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log("Columns already exist.");
    } else {
      console.error("Error adding columns:", error);
    }
  } finally {
    process.exit(0);
  }
}

addColumns();
