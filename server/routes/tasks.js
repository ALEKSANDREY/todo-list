const express = require('express');
const db = require('../db');
const { now, serializeTask } = require('../serialize');

const router = express.Router();

const UPDATABLE = [
  'title', 'notes', 'completed', 'dueDate', 'remindAt', 'contactId',
  'completedAt', 'status', 'recurrence', 'recurrenceDone', 'timeLogged',
  'gcalEventId', 'gcalHash',
];

function getTask(userId, id) {
  return db.prepare('SELECT * FROM tasks WHERE id = ? AND userId = ?').get(id, userId);
}

function validateInput(body, { requireTitle }) {
  const out = {};
  const errors = [];
  const has = (k) => body && Object.prototype.hasOwnProperty.call(body, k);

  if (requireTitle && (!has('title') || String(body.title).trim() === '')) {
    return { error: 'Title is required' };
  }

  for (const key of UPDATABLE) {
    if (!has(key)) continue;
    const v = body[key];
    switch (key) {
      case 'title':
        if (typeof v !== 'string' || v.trim() === '') errors.push('title must be a non-empty string');
        else out.title = v.trim();
        break;
      case 'notes':
      case 'status':
        if (typeof v !== 'string') errors.push(`${key} must be a string`);
        else out[key] = v;
        break;
      case 'dueDate':
      case 'remindAt':
      case 'completedAt':
      case 'gcalEventId':
      case 'gcalHash':
        if (v !== null && v !== undefined && typeof v !== 'string')
          errors.push(`${key} must be a string or null`);
        else out[key] = v === undefined ? null : v;
        break;
      case 'completed':
      case 'recurrenceDone':
        out[key] = v ? 1 : 0;
        break;
      case 'contactId':
        if (v !== null && v !== undefined && !Number.isInteger(Number(v)))
          errors.push('contactId must be an integer or null');
        else out.contactId = v == null ? null : Number(v);
        break;
      case 'timeLogged':
        if (!Number.isInteger(Number(v)) || Number(v) < 0)
          errors.push('timeLogged must be a non-negative integer');
        else out.timeLogged = Number(v);
        break;
      case 'recurrence':
        if (v === null || v === undefined || v === '') out.recurrence = null;
        else if (typeof v === 'object') {
          try { out.recurrence = JSON.stringify(v); }
          catch { errors.push('recurrence must be JSON-serializable'); }
        } else if (typeof v === 'string') {
          try { JSON.parse(v); out.recurrence = v; }
          catch { errors.push('recurrence must be valid JSON or an object'); }
        } else errors.push('recurrence must be an object or JSON string');
        break;
      default:
        break;
    }
  }
  if (errors.length) return { error: errors.join('; ') };
  return { data: out };
}

// GET /api/tasks — newest first
router.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM tasks WHERE userId = ? ORDER BY id DESC')
    .all(req.user.id);
  return res.json({ tasks: rows.map(serializeTask) });
});

// POST /api/tasks
router.post('/', (req, res) => {
  const { error, data } = validateInput(req.body, { requireTitle: true });
  if (error) return res.status(400).json({ error });
  const t = now();
  const info = db
    .prepare(
      `INSERT INTO tasks
        (userId, title, notes, completed, dueDate, remindAt, contactId, completedAt,
         status, recurrence, recurrenceDone, timeLogged, gcalEventId, gcalHash, createdAt, updatedAt)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    )
    .run(
      req.user.id,
      data.title,
      data.notes || '',
      data.completed || 0,
      data.dueDate ?? null,
      data.remindAt ?? null,
      data.contactId ?? null,
      data.completedAt ?? null,
      data.status || 'todo',
      data.recurrence ?? null,
      data.recurrenceDone || 0,
      data.timeLogged || 0,
      data.gcalEventId ?? null,
      data.gcalHash ?? null,
      t,
      t
    );
  const task = serializeTask(
    db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid)
  );
  return res.status(201).json(task);
});

// PATCH /api/tasks/:id
router.patch('/:id', (req, res) => {
  const existing = getTask(req.user.id, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Task not found' });
  const { error, data } = validateInput(req.body, { requireTitle: false });
  if (error) return res.status(400).json({ error });
  if (Object.keys(data).length === 0)
    return res.status(400).json({ error: 'No fields to update' });
  const t = now();
  const cols = Object.keys(data).map((k) => `${k} = ?`).join(', ');
  db.prepare(`UPDATE tasks SET ${cols}, updatedAt = ? WHERE id = ?`).run(
    ...Object.values(data),
    t,
    existing.id
  );
  return res.json(
    serializeTask(db.prepare('SELECT * FROM tasks WHERE id = ?').get(existing.id))
  );
});

// DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  const existing = getTask(req.user.id, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Task not found' });
  db.prepare('DELETE FROM tasks WHERE id = ?').run(existing.id);
  return res.json({ ok: true });
});

module.exports = router;
