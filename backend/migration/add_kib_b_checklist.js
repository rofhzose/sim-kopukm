import pool from "../config/db.js";

async function run() {
  try {
    console.log("Checking database columns for kib_b...");
    const [columns] = await pool.query("SHOW COLUMNS FROM kib_b");
    const colNames = columns.map(c => c.Field);
    
    if (!colNames.includes("is_checked")) {
      await pool.query("ALTER TABLE kib_b ADD COLUMN is_checked TINYINT(1) DEFAULT 0");
      console.log("✅ Added column 'is_checked' to kib_b table");
    } else {
      console.log("ℹ️ Column 'is_checked' already exists");
    }
    
    if (!colNames.includes("checked_at")) {
      await pool.query("ALTER TABLE kib_b ADD COLUMN checked_at DATETIME DEFAULT NULL");
      console.log("✅ Added column 'checked_at' to kib_b table");
    } else {
      console.log("ℹ️ Column 'checked_at' already exists");
    }
    
    console.log("🎉 Database migration completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Database migration failed:", err);
    process.exit(1);
  }
}

run();
