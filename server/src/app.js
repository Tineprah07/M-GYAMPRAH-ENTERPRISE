const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const productsRouter = require('./routes/products');
const enquiriesRouter = require('./routes/enquiries');
const ordersRouter = require('./routes/orders');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      return cb(new Error('CORS not allowed'), false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'mge-api', time: new Date().toISOString() });
});

app.use('/api/products', productsRouter);
app.use('/api/enquiries', writeLimiter, enquiriesRouter);
app.use('/api/orders', writeLimiter, ordersRouter);

const clientDir = path.join(__dirname, '..', '..', 'client');
app.use(express.static(clientDir));
app.get('/', (req, res) => res.sendFile(path.join(clientDir, 'index.html')));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
