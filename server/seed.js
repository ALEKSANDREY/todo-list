// Seed demo content for the demo user (called once when the demo user is created).
const { now } = require('./serialize');

function localDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function seedDemo(db, userId) {
  const today = localDate(new Date());
  const tomorrow = localDate(new Date(Date.now() + 86400000));

  const seed = db.transaction(() => {
    const t = now();
    const insTask = db.prepare(
      `INSERT INTO tasks
        (userId, title, notes, completed, dueDate, remindAt, contactId, completedAt,
         status, recurrence, recurrenceDone, timeLogged, gcalEventId, gcalHash, createdAt, updatedAt)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    );
    const insContact = db.prepare(
      `INSERT INTO contacts
        (userId, name, company, email, phone, notes, tags, createdAt, updatedAt)
       VALUES (?,?,?,?,?,?,?,?,?)`
    );
    const insStage = db.prepare(
      `INSERT INTO pipeline_stages (userId, name, position) VALUES (?,?,?)`
    );
    const insCard = db.prepare(
      `INSERT INTO pipeline_cards
        (userId, title, stageId, contactId, taskId, notes, position, createdAt, updatedAt)
       VALUES (?,?,?,?,?,?,?,?,?)`
    );
    const insTime = db.prepare(
      `INSERT INTO time_entries (userId, taskId, startedAt, seconds, kind)
       VALUES (?,?,?,?,?)`
    );

    // Tasks
    insTask.run(userId, 'Review the new design', '', 0, tomorrow, null, null, null,
      'todo', null, 0, 0, null, null, t, t);
    insTask.run(userId, 'Polish the portfolio README', '', 0, null, null, null, null,
      'todo', null, 0, 0, null, null, t, t);
    insTask.run(userId, 'Prep for the recruiter call', '', 0, today, null, null, null,
      'todo', null, 0, 0, null, null, t, t);
    insTask.run(userId, 'Morning run', '', 0, today, null, null, null,
      'todo', JSON.stringify({ freq: 'daily' }), 0, 0, null, null, t, t);
    insTask.run(userId, 'Ship the redesign branch', '', 1, null, null, null, t,
      'done', null, 0, 0, null, null, t, t);

    // Contacts
    const maya = insContact.run(userId, 'Maya Chen', 'Northwind Labs',
      'maya@northwindlabs.com', '415-555-0132',
      'Interested in the new onboarding flow.',
      JSON.stringify(['prospect', 'saas']), t, t).lastInsertRowid;
    const devon = insContact.run(userId, 'Devon Park', 'Acme Co',
      'devon@acme.co', '',
      '', JSON.stringify(['networking']), t, t).lastInsertRowid;
    const priya = insContact.run(userId, 'Priya Nair', 'Brightline',
      'priya@brightline.io', '702-555-0188',
      '', JSON.stringify(['client']), t, t).lastInsertRowid;

    // Pipeline stages
    const stageNew = insStage.run(userId, 'New', 0).lastInsertRowid;
    const stageContacted = insStage.run(userId, 'Contacted', 1).lastInsertRowid;
    const stageInProgress = insStage.run(userId, 'In Progress', 2).lastInsertRowid;
    const stageDone = insStage.run(userId, 'Done', 3).lastInsertRowid;

    // Pipeline cards
    insCard.run(userId, 'Send proposal follow-up', stageContacted, maya, null, '', 0, t, t);
    insCard.run(userId, 'Schedule intro call', stageNew, devon, null, '', 0, t, t);
    insCard.run(userId, 'Draft onboarding checklist', stageInProgress, priya, null, '', 0, t, t);
    insCard.run(userId, 'Renew annual plan', stageDone, priya, null, '', 0, t, t);
    insCard.run(userId, 'Research competitor pricing', stageNew, null, null, '', 1, t, t);

    // Time entries: one pomodoro 25 min today, one manual 15 min yesterday
    insTime.run(userId, null,
      new Date(Date.now() - 25 * 60 * 1000).toISOString(), 1500, 'pomodoro');
    insTime.run(userId, null,
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), 900, 'manual');
  });

  seed();
}

module.exports = { seedDemo };
