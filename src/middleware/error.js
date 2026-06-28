export function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

// Centralized error handler. Wrap async handlers with asyncHandler so thrown
// errors land here instead of crashing the process.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error('[error]', err.message);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate value', fields: err.keyValue });
  }
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
}

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
