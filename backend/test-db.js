import "dotenv/config";
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

try {
  await client.connect();
  const res = await client.query("SELECT NOW()");
  console.log("✅ Connected successfully:", res.rows[0]);
} catch (err) {
  console.error("❌ Connection failed:", err.message);
} finally {
  await client.end();
}
