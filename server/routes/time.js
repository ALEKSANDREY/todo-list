const express = require('express');
const db = require('../db');
const { serializeTimeEntry } = require('../serialize');

const router = express.Router();

// GET /api/time/entries — newest first
router.get('/entries', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM time_entries WHERE userId = ? ORDER BY id DESC')
    .all(req.user.id);
  return res.json({ entries: rows.map(serializeTimeEntry) });
});

// POST /api/time/entries
router.post('/entries', (req, res) => {
  const body = req.body || {};
  const { taskId, startedAt, seconds, kind } = body;

  if (typeof startedAt !== 'string' || startedAt.trim() === '')
    return res.status(400).json({ error: 'startedAt is required' });
  if (!Number.isInteger(Number(seconds)) || Number(seconds) < 0)
    return res.status(400).json({ error: 'seconds must be a non-negative integer' });
  if (kind !== 'manual' && kind !== 'pomodoro')
    return res.status(400).json({ error: "kind must be 'manual' or 'pomodoro'" });

  let taskRef = null;
  if (taskId !== undefined && taskId !== null) {
    if (!Number.isInteger(Number(taskId)))
      return res.status(400).json({ error: 'taskId must be an integer or null' });
    const task = db
      .prepare('SELECT id FROM tasks WHERE id = ? AND userId = ?')
      .get(Number(taskId), req.user.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    taskRef = Number(taskId);
  }

  const info = db
    .prepare(
      'INSERT INTO time_entries (userId, taskId, startedAt, seconds, kind) VALUES (?,?,?,?,?)'
    )
    .run(req.user.id, taskRef, startedAt, Number(seconds), kind);
  return res
    .status(201)
    .json(serializeTimeEntry(db.prepare('SELECT * FROM time_entries WHERE id = ?').get(info.lastInsertRowid)));
});

module.exports = router;
