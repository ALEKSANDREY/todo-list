// Serializers: DB rows -> JSON API shapes.
const now = () => new Date().toISOString();

function parseJson(text, fallback) {
  if (text === null || text === undefined || text === '') return fallback;
  try {
    const v = JSON.parse(text);
    return v === null || v === undefined ? fallback : v;
  } catch {
    return fallback;
  }
}

function fk(v) {
  return v === null || v === undefined ? null : Number(v);
}

function str(v) {
  return v === null || v === undefined ? null : String(v);
}

function serializeUser(u) {
  if (!u) return null;
  return { id: u.id, email: u.email, name: u.name || '' };
}

function serializeTask(t) {
  if (!t) return null;
  return {
    id: t.id,
    userId: t.userId,
    title: t.title,
    notes: t.notes || '',
    completed: !!t.completed,
    dueDate: str(t.dueDate),
    remindAt: str(t.remindAt),
    contactId: fk(t.contactId),
    completedAt: str(t.completedAt),
    status: t.status || 'todo',
    recurrence: parseJson(t.recurrence, null),
    recurrenceDone: !!t.recurrenceDone,
    timeLogged: Number(t.timeLogged) || 0,
    gcalEventId: str(t.gcalEventId),
    gcalHash: str(t.gcalHash),
    createdAt: str(t.createdAt),
    updatedAt: str(t.updatedAt),
  };
}

function serializeContact(c) {
  if (!c) return null;
  return {
    id: c.id,
    userId: c.userId,
    name: c.name || '',
    company: c.company || '',
    email: c.email || '',
    phone: c.phone || '',
    notes: c.notes || '',
    tags: parseJson(c.tags, []),
    createdAt: str(c.createdAt),
    updatedAt: str(c.updatedAt),
  };
}

function serializeStage(s) {
  if (!s) return null;
  return { id: s.id, name: s.name, position: Number(s.position) || 0 };
}

function serializeCard(c) {
  if (!c) return null;
  return {
    id: c.id,
    title: c.title,
    stageId: fk(c.stageId),
    contactId: fk(c.contactId),
    taskId: fk(c.taskId),
    notes: c.notes || '',
    position: Number(c.position) || 0,
  };
}

function serializeTimeEntry(e) {
  if (!e) return null;
  return {
    id: e.id,
    taskId: fk(e.taskId),
    startedAt: str(e.startedAt),
    seconds: Number(e.seconds) || 0,
    kind: e.kind,
  };
}

function serializeSettings(s) {
  if (!s) return null;
  return {
    userId: s.userId,
    pomoFocusMin: Number(s.pomoFocusMin),
    pomoBreakMin: Number(s.pomoBreakMin),
    pomoLongBreakMin: Number(s.pomoLongBreakMin),
    pomoCycles: Number(s.pomoCycles),
    notifEnabled: !!s.notifEnabled,
  };
}

module.exports = {
  now,
  parseJson,
  serializeUser,
  serializeTask,
  serializeContact,
  serializeStage,
  serializeCard,
  serializeTimeEntry,
  serializeSettings,
};
