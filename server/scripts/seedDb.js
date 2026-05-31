require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

async function run() {
  const seedPath = path.join(__dirname, '..', 'db', 'seed.sql');
  const sql = fs.readFileSync(seedPath, 'utf8');
  console.log('[db:seed] loading seed.sql ...');
  await pool.query(sql);
  console.log('[db:seed] done');
  await pool.end();
}

run().catch((err) => {
  console.error('[db:seed] failed:', err);
  process.exit(1);
});
