function notFound(req, res, next) {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
}

function errorHandler(err, req, res, next) {
  console.error('[error]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.publicMessage || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { detail: err.message }),
  });
}

module.exports = { notFound, errorHandler };
