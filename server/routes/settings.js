const express = require('express');
const db = require('../db');
const { serializeSettings } = require('../serialize');

const router = express.Router();

const FIELDS = ['pomoFocusMin', 'pomoBreakMin', 'pomoLongBreakMin', 'pomoCycles', 'notifEnabled'];

function getOrCreate(userId) {
  let row = db.prepare('SELECT * FROM settings WHERE userId = ?').get(userId);
  if (!row) {
    db.prepare('INSERT INTO settings (userId) VALUES (?)').run(userId);
    row = db.prepare('SELECT * FROM settings WHERE userId = ?').get(userId);
  }
  return row;
}

// GET /api/settings — creates the row with defaults on first read
router.get('/', (req, res) => {
  return res.json(serializeSettings(getOrCreate(req.user.id)));
});

// PATCH /api/settings — any subset of fields
router.patch('/', (req, res) => {
  const body = req.body || {};
  const data = {};
  for (const key of FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(body, key)) continue;
    const v = body[key];
    if (key === 'notifEnabled') {
      data[key] = v ? 1 : 0;
    } else {
      if (!Number.isInteger(Number(v)) || Number(v) <= 0)
        return res.status(400).json({ error: `${key} must be a positive integer` });
      data[key] = Number(v);
    }
  }
  if (Object.keys(data).length === 0)
    return res.status(400).json({ error: 'No fields to update' });
  getOrCreate(req.user.id);
  const cols = Object.keys(data).map((k) => `${k} = ?`).join(', ');
  db.prepare(`UPDATE settings SET ${cols} WHERE userId = ?`).run(
    ...Object.values(data),
    req.user.id
  );
  return res.json(serializeSettings(getOrCreate(req.user.id)));
});

module.exports = router;
