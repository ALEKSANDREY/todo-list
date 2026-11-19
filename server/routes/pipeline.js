const express = require('express');
const db = require('../db');
const { now, serializeStage, serializeCard } = require('../serialize');

const router = express.Router();

function getStage(userId, id) {
  return db.prepare('SELECT * FROM pipeline_stages WHERE id = ? AND userId = ?').get(id, userId);
}

function getCard(userId, id) {
  return db.prepare('SELECT * FROM pipeline_cards WHERE id = ? AND userId = ?').get(id, userId);
}

function firstStage(userId) {
  return db
    .prepare('SELECT * FROM pipeline_stages WHERE userId = ? ORDER BY position ASC, id ASC LIMIT 1')
    .get(userId);
}

// GET /api/pipeline
router.get('/', (req, res) => {
  const stages = db
    .prepare('SELECT * FROM pipeline_stages WHERE userId = ? ORDER BY position ASC, id ASC')
    .all(req.user.id)
    .map(serializeStage);
  const cards = db
    .prepare('SELECT * FROM pipeline_cards WHERE userId = ? ORDER BY position ASC, id ASC')
    .all(req.user.id)
    .map(serializeCard);
  return res.json({ stages, cards });
});

// POST /api/pipeline/stages
router.post('/stages', (req, res) => {
  const name = req.body && req.body.name;
  if (typeof name !== 'string' || name.trim() === '')
    return res.status(400).json({ error: 'Name is required' });
  const next = db
    .prepare('SELECT COALESCE(MAX(position), -1) + 1 AS pos FROM pipeline_stages WHERE userId = ?')
    .get(req.user.id).pos;
  const info = db
    .prepare('INSERT INTO pipeline_stages (userId, name, position) VALUES (?,?,?)')
    .run(req.user.id, name.trim(), next);
  return res
    .status(201)
    .json(serializeStage(db.prepare('SELECT * FROM pipeline_stages WHERE id = ?').get(info.lastInsertRowid)));
});

// PATCH /api/pipeline/stages/:id
router.patch('/stages/:id', (req, res) => {
  const existing = getStage(req.user.id, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Stage not found' });
  const data = {};
  if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'name')) {
    const v = req.body.name;
    if (typeof v !== 'string' || v.trim() === '')
      return res.status(400).json({ error: 'name must be a non-empty string' });
    data.name = v.trim();
  }
  if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'position')) {
    const v = Number(req.body.position);
    if (!Number.isInteger(v)) return res.status(400).json({ error: 'position must be an integer' });
    data.position = v;
  }
  if (Object.keys(data).length === 0)
    return res.status(400).json({ error: 'No fields to update' });
  const cols = Object.keys(data).map((k) => `${k} = ?`).join(', ');
  db.prepare(`UPDATE pipeline_stages SET ${cols} WHERE id = ?`).run(
    ...Object.values(data),
    existing.id
  );
  return res.json(
    serializeStage(db.prepare('SELECT * FROM pipeline_stages WHERE id = ?').get(existing.id))
  );
});

// DELETE /api/pipeline/stages/:id
router.delete('/stages/:id', (req, res) => {
  const existing = getStage(req.user.id, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Stage not found' });
  const count = db
    .prepare('SELECT COUNT(*) AS n FROM pipeline_stages WHERE userId = ?')
    .get(req.user.id).n;
  if (count <= 1)
    return res.status(400).json({ error: 'Cannot delete the last stage' });
  const move = db.transaction(() => {
    const target = firstStage(req.user.id);
    // If the deleted stage is the first one, use the next remaining stage.
    const remaining = db
      .prepare(
        'SELECT * FROM pipeline_stages WHERE userId = ? AND id != ? ORDER BY position ASC, id ASC LIMIT 1'
      )
      .get(req.user.id, existing.id);
    const dest = target.id === existing.id ? remaining : target;
    db.prepare('UPDATE pipeline_cards SET stageId = ? WHERE userId = ? AND stageId = ?')
      .run(dest.id, req.user.id, existing.id);
    db.prepare('DELETE FROM pipeline_stages WHERE id = ?').run(existing.id);
  });
  move();
  return res.json({ ok: true });
});

// POST /api/pipeline/cards
router.post('/cards', (req, res) => {
  const body = req.body || {};
  if (typeof body.title !== 'string' || body.title.trim() === '')
    return res.status(400).json({ error: 'Title is required' });

  let stageId = body.stageId;
  if (stageId === undefined || stageId === null) {
    const stage = firstStage(req.user.id);
    if (!stage)
      return res.status(400).json({ error: 'No pipeline stages exist; create a stage first' });
    stageId = stage.id;
  } else if (!getStage(req.user.id, stageId)) {
    return res.status(400).json({ error: 'stageId does not belong to this user' });
  }

  const contactId = body.contactId == null ? null : Number(body.contactId);
  if (contactId !== null && !Number.isInteger(contactId))
    return res.status(400).json({ error: 'contactId must be an integer or null' });
  const taskId = body.taskId == null ? null : Number(body.taskId);
  if (taskId !== null && !Number.isInteger(taskId))
    return res.status(400).json({ error: 'taskId must be an integer or null' });
  if (body.notes !== undefined && body.notes !== null && typeof body.notes !== 'string')
    return res.status(400).json({ error: 'notes must be a string' });

  const next = db
    .prepare(
      'SELECT COALESCE(MAX(position), -1) + 1 AS pos FROM pipeline_cards WHERE userId = ? AND stageId = ?'
    )
    .get(req.user.id, stageId).pos;
  const t = now();
  const info = db
    .prepare(
      `INSERT INTO pipeline_cards
        (userId, title, stageId, contactId, taskId, notes, position, createdAt, updatedAt)
       VALUES (?,?,?,?,?,?,?,?,?)`
    )
    .run(req.user.id, body.title.trim(), stageId, contactId, taskId, body.notes || '', next, t, t);
  return res
    .status(201)
    .json(serializeCard(db.prepare('SELECT * FROM pipeline_cards WHERE id = ?').get(info.lastInsertRowid)));
});

// PATCH /api/pipeline/cards/:id
router.patch('/cards/:id', (req, res) => {
  const existing = getCard(req.user.id, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Card not found' });
  const body = req.body || {};
  const data = {};
  const errors = [];
  const has = (k) => Object.prototype.hasOwnProperty.call(body, k);

  if (has('title')) {
    if (typeof body.title !== 'string' || body.title.trim() === '')
      errors.push('title must be a non-empty string');
    else data.title = body.title.trim();
  }
  if (has('stageId')) {
    if (body.stageId === null || body.stageId === undefined) data.stageId = null;
    else if (!getStage(req.user.id, body.stageId))
      errors.push('stageId does not belong to this user');
    else data.stageId = Number(body.stageId);
  }
  for (const key of ['contactId', 'taskId']) {
    if (has(key)) {
      const v = body[key];
      if (v === null || v === undefined) data[key] = null;
      else if (!Number.isInteger(Number(v))) errors.push(`${key} must be an integer or null`);
      else data[key] = Number(v);
    }
  }
  if (has('notes')) {
    if (typeof body.notes !== 'string') errors.push('notes must be a string');
    else data.notes = body.notes;
  }
  if (has('position')) {
    if (!Number.isInteger(Number(body.position))) errors.push('position must be an integer');
    else data.position = Number(body.position);
  }
  if (errors.length) return res.status(400).json({ error: errors.join('; ') });
  if (Object.keys(data).length === 0)
    return res.status(400).json({ error: 'No fields to update' });

  const t = now();
  const cols = Object.keys(data).map((k) => `${k} = ?`).join(', ');
  db.prepare(`UPDATE pipeline_cards SET ${cols}, updatedAt = ? WHERE id = ?`).run(
    ...Object.values(data),
    t,
    existing.id
  );
  return res.json(
    serializeCard(db.prepare('SELECT * FROM pipeline_cards WHERE id = ?').get(existing.id))
  );
});

// DELETE /api/pipeline/cards/:id
router.delete('/cards/:id', (req, res) => {
  const existing = getCard(req.user.id, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Card not found' });
  db.prepare('DELETE FROM pipeline_cards WHERE id = ?').run(existing.id);
  return res.json({ ok: true });
});

module.exports = router;
