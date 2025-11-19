// // lib/db.js
// import { Pool } from 'pg';

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL is missing in environment variables");
// }

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

// const db = {
//   query: (text, params) => pool.query(text, params),
//   pool,
// };

// export default db;

// lib/db.js
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("❌ DATABASE_URL is missing in environment variables");
}

// Create a single shared connection pool
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // required for many hosting providers
  },
});

// Simple query wrapper
export async function query(text, params) {
  try {
    return await pool.query(text, params);
  } catch (err) {
    console.error("❌ Database query error:", err);
    throw err;
  }
}

// Export the pool if needed
export { pool };
