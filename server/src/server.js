require('dotenv').config();
const app = require('./app');
const { pool } = require('./config/db');

const PORT = Number(process.env.PORT) || 4000;

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('[db] connected');
  } catch (err) {
    console.warn('[db] could not connect at startup:', err.message);
    console.warn('[db] server will still start; check your .env and run npm run db:init');
  }

  const server = app.listen(PORT, () => {
    console.log(`[mge-api] listening on http://localhost:${PORT}`);
  });

  const shutdown = (signal) => {
    console.log(`\n[mge-api] ${signal} received, shutting down`);
    server.close(() => {
      pool.end().finally(() => process.exit(0));
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
