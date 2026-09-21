const express = require('express');
const db = require('../db');
const { now, serializeContact } = require('../serialize');

const router = express.Router();

function getContact(userId, id) {
  return db.prepare('SELECT * FROM contacts WHERE id = ? AND userId = ?').get(id, userId);
}

function validateInput(body, { requireName }) {
  const errors = [];
  const out = {};
  const has = (k) => body && Object.prototype.hasOwnProperty.call(body, k);

  if (requireName && (!has('name') || String(body.name).trim() === '')) {
    return { error: 'Name is required' };
  }

  for (const key of ['name', 'company', 'email', 'phone', 'notes']) {
    if (!has(key)) continue;
    const v = body[key];
    if (key === 'name') {
      if (typeof v !== 'string' || v.trim() === '') errors.push('name must be a non-empty string');
      else out.name = v.trim();
    } else if (v !== null && v !== undefined && typeof v !== 'string') {
      errors.push(`${key} must be a string`);
    } else {
      out[key] = v == null ? '' : v;
    }
  }

  if (has('tags')) {
    const v = body.tags;
    if (Array.isArray(v)) {
      try { out.tags = JSON.stringify(v); }
      catch { errors.push('tags must be JSON-serializable'); }
    } else if (typeof v === 'string') {
      try { JSON.parse(v); out.tags = v; }
      catch { errors.push('tags must be a valid JSON array or an array'); }
    } else {
      errors.push('tags must be an array');
    }
  }

  if (errors.length) return { error: errors.join('; ') };
  return { data: out };
}

// GET /api/contacts
router.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM contacts WHERE userId = ? ORDER BY id DESC')
    .all(req.user.id);
  return res.json({ contacts: rows.map(serializeContact) });
});

// POST /api/contacts
router.post('/', (req, res) => {
  const { error, data } = validateInput(req.body, { requireName: true });
  if (error) return res.status(400).json({ error });
  const t = now();
  const info = db
    .prepare(
      `INSERT INTO contacts
        (userId, name, company, email, phone, notes, tags, createdAt, updatedAt)
       VALUES (?,?,?,?,?,?,?,?,?)`
    )
    .run(
      req.user.id,
      data.name,
      data.company || '',
      data.email || '',
      data.phone || '',
      data.notes || '',
      data.tags || '[]',
      t,
      t
    );
  return res
    .status(201)
    .json(serializeContact(db.prepare('SELECT * FROM contacts WHERE id = ?').get(info.lastInsertRowid)));
});

// PATCH /api/contacts/:id
router.patch('/:id', (req, res) => {
  const existing = getContact(req.user.id, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Contact not found' });
  const { error, data } = validateInput(req.body, { requireName: false });
  if (error) return res.status(400).json({ error });
  if (Object.keys(data).length === 0)
    return res.status(400).json({ error: 'No fields to update' });
  const t = now();
  const cols = Object.keys(data).map((k) => `${k} = ?`).join(', ');
  db.prepare(`UPDATE contacts SET ${cols}, updatedAt = ? WHERE id = ?`).run(
    ...Object.values(data),
    t,
    existing.id
  );
  return res.json(
    serializeContact(db.prepare('SELECT * FROM contacts WHERE id = ?').get(existing.id))
  );
});

// DELETE /api/contacts/:id — also nulls contactId on referencing tasks/cards.
router.delete('/:id', (req, res) => {
  const existing = getContact(req.user.id, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Contact not found' });
  const del = db.transaction(() => {
    db.prepare('UPDATE tasks SET contactId = NULL WHERE userId = ? AND contactId = ?')
      .run(req.user.id, existing.id);
    db.prepare('UPDATE pipeline_cards SET contactId = NULL WHERE userId = ? AND contactId = ?')
      .run(req.user.id, existing.id);
    db.prepare('DELETE FROM contacts WHERE id = ?').run(existing.id);
  });
  del();
  return res.json({ ok: true });
});

module.exports = router;
