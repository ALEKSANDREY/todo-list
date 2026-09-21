const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const {
  signToken,
  setSessionCookie,
  clearSessionCookie,
  requireAuth,
  randomPassword,
} = require('../auth');
const { now, serializeUser } = require('../serialize');
const { seedDemo } = require('../seed');

const router = express.Router();

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function findUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

function issueSession(res, user) {
  setSessionCookie(res, signToken(user));
}

// POST /api/auth/register
router.post('/register', (req, res) => {
  const email = normalizeEmail(req.body && req.body.email);
  const password = req.body && req.body.password;
  const name = String((req.body && req.body.name) || '').trim();

  if (!email) return res.status(400).json({ error: 'Email is required' });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return res.status(400).json({ error: 'Invalid email address' });
  if (typeof password !== 'string' || password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  if (findUserByEmail(email))
    return res.status(400).json({ error: 'Email is already registered' });

  const passwordHash = bcrypt.hashSync(password, 10);
  const t = now();
  const info = db
    .prepare('INSERT INTO users (email, passwordHash, name, createdAt) VALUES (?,?,?,?)')
    .run(email, passwordHash, name, t);
  const user = serializeUser(
    db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid)
  );
  issueSession(res, user);
  return res.status(201).json({ user });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const email = normalizeEmail(req.body && req.body.email);
  const password = req.body && req.body.password;
  const user = findUserByEmail(email);
  if (!user || typeof password !== 'string' || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const out = serializeUser(user);
  issueSession(res, out);
  return res.status(200).json({ user: out });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  clearSessionCookie(res);
  return res.status(200).json({ ok: true });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const user = serializeUser(
    db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  );
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  return res.status(200).json({ user });
});

// POST /api/auth/demo — find-or-create demo user, seed on first creation.
router.post('/demo', (req, res) => {
  const email = 'demo@todo.local';
  let user = findUserByEmail(email);
  if (!user) {
    const passwordHash = bcrypt.hashSync(randomPassword(), 10);
    const t = now();
    const info = db
      .prepare('INSERT INTO users (email, passwordHash, name, createdAt) VALUES (?,?,?,?)')
      .run(email, passwordHash, 'Demo User', t);
    const userId = info.lastInsertRowid;
    seedDemo(db, userId);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  }
  const out = serializeUser(user);
  issueSession(res, out);
  return res.status(200).json({ user: out });
});

module.exports = router;
