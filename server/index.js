// Server wiring: dotenv, JSON body parsing, CORS, routers, error handling.
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./db');
const { requireAuth } = require('./auth');

const app = express();

app.use(express.json({ limit: '1mb' }));

const allowedOrigins = String(process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // No Origin header (curl, server-to-server): allow.
      if (!origin) return cb(null, true);
      return allowedOrigins.includes(origin)
        ? cb(null, true)
        : cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Auth (public), everything else requires a valid session cookie.
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', requireAuth, require('./routes/tasks'));
app.use('/api/contacts', requireAuth, require('./routes/contacts'));
app.use('/api/pipeline', requireAuth, require('./routes/pipeline'));
app.use('/api/time', requireAuth, require('./routes/time'));
app.use('/api/settings', requireAuth, require('./routes/settings'));

// JSON 404 for unknown /api routes
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Error middleware — {error} shape, never leak stacks in production
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? status === 500
        ? 'Internal server error'
        : err.message || 'Request failed'
      : err.message || 'Request failed';
  res.status(status).json({ error: message });
});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`[todo-server] listening on port ${PORT} (db: ${db.dbPath})`);
});

module.exports = app;
