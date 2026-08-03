const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Order'");
  console.log('Order columns:', res.rows);
  await pool.end();
})();