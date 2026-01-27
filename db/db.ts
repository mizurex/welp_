import "dotenv/config";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

async function run() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const schemaPath = path.join(__dirname, "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf-8");

  console.log("Running schema.sql...\n");

  try {
    await pool.query(sql);
    console.log("Done! Tables created successfully.");
  } catch (err) {
    console.error("Failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
