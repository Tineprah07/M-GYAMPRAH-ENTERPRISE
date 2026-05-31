require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

async function run() {
  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  console.log('[db:init] applying schema.sql ...');
  await pool.query(sql);
  console.log('[db:init] done');
  await pool.end();
}

run().catch((err) => {
  console.error('[db:init] failed:', err);
  process.exit(1);
});
