# todo-list server

Express + SQLite REST API backend for the todo-list app.

## Run locally

```bash
cd server
npm install
cp .env.example .env
node index.js
```

The server listens on `PORT` (default `3001`) and creates `./data/app.db`
automatically on first boot (WAL mode). Database tables are created on boot —
no migrations needed.

## Environment variables

| Variable        | Default                  | Description |
|-----------------|--------------------------|-------------|
| `PORT`          | `3001`                   | Port to listen on |
| `JWT_SECRET`    | `dev-secret-change-me`   | Secret for signing session JWTs. **Set a strong random value in production.** A console warning is printed when the default is used. |
| `FRONTEND_URL`  | `http://localhost:5173`  | Allowed CORS origin(s); comma-separated list supported. Requests from other origins are rejected. |
| `DB_PATH`       | `./data/app.db`          | Path to the SQLite file (relative paths resolve from `server/`). |
| `COOKIE_SECURE` | `false`                  | Set to `true` when serving over HTTPS so the `todo_session` cookie is marked `Secure`. |
| `NODE_ENV`      | —                        | Set to `production` to hide internal error details in `{error}` responses. |

Sessions are stored in an `httpOnly`, `SameSite=Lax` cookie named `todo_session`
(valid 30 days).

## Endpoints

All routes below are under `/api` and require auth (`401 {error}` when the
session cookie is missing/invalid), except the auth public routes and health.

**Health**
- `GET /api/health` → `{ok:true}`

**Auth**
- `POST /api/auth/register` `{email*, password*, name?}` → `201 {user:{id,email,name}}`
- `POST /api/auth/login` `{email*, password*}` → `200 {user:{id,email,name}}` (sets cookie)
- `POST /api/auth/logout` → `200 {ok:true}` (clears cookie)
- `GET /api/auth/me` → `200 {user}` or `401`
- `POST /api/auth/demo` → `200 {user}`; find-or-create `demo@todo.local` (seeds demo content on first creation); sets cookie. One-click instant-try.

**Tasks**
- `GET /api/tasks` → `{tasks:[...]}` (newest first)
- `POST /api/tasks` `{title*, notes?, dueDate?, remindAt?, contactId?, status?, recurrence?}` → `201` task
- `PATCH /api/tasks/:id` (any subset) → task
- `DELETE /api/tasks/:id` → `{ok:true}` (`404` if not owned)

Task JSON: `{id, userId, title, notes, completed (bool), dueDate, remindAt,
contactId (int|null), completedAt, status, recurrence (object|null),
recurrenceDone (bool), timeLogged, gcalEventId, gcalHash, createdAt, updatedAt}`.

**Contacts**
- `GET /api/contacts` → `{contacts:[...]}`
- `POST /api/contacts` `{name*, company?, email?, phone?, notes?, tags?[]}` → `201`
- `PATCH /api/contacts/:id` → contact
- `DELETE /api/contacts/:id` → `{ok:true}`; also sets `contactId=NULL` on this
  user's tasks and pipeline cards referencing the contact (`404` if not owned)

Contact JSON: `{id, userId, name, company, email, phone, notes, tags[], createdAt, updatedAt}`.

**Pipeline**
- `GET /api/pipeline` → `{stages:[{id,name,position}], cards:[{id,title,stageId,contactId,taskId,notes,position}]}`
- `POST /api/pipeline/stages` `{name*}` → `201` stage
- `PATCH /api/pipeline/stages/:id` `{name?, position?}` → stage
- `DELETE /api/pipeline/stages/:id` → `{ok:true}`; `400` if it is the user's last stage, otherwise its cards move to the first remaining stage
- `POST /api/pipeline/cards` `{title*, stageId?, contactId?, taskId?, notes?}` → `201` (defaults `stageId` to the user's first stage)
- `PATCH /api/pipeline/cards/:id` → card
- `DELETE /api/pipeline/cards/:id` → `{ok:true}`

**Time entries**
- `GET /api/time/entries` → `{entries:[...]}` (newest first)
- `POST /api/time/entries` `{taskId?, startedAt*, seconds*, kind*}` (`kind`: `manual`|`pomodoro`) → `201`

Entry JSON: `{id, taskId (int|null), startedAt, seconds, kind}`.

**Settings**
- `GET /api/settings` → settings object (row with defaults created on first read)
- `PATCH /api/settings` (any subset) → settings

Settings JSON: `{userId, pomoFocusMin, pomoBreakMin, pomoLongBreakMin, pomoCycles, notifEnabled (bool)}`.

Validation failures return `400 {error}`; resources not owned by the user return `404 {error}`.

## Deployment (Render / Railway)

1. Create a **web service** from this repo (working directory `server/` or
   root command adjusted accordingly).
2. **Build command:** `npm install` — **Start command:** `node index.js`.
3. Set env vars: `JWT_SECRET` (long random string), `FRONTEND_URL` (your
   production frontend origin, e.g. `https://your-app.vercel.app`),
   `COOKIE_SECURE=true` (HTTPS deployments), `NODE_ENV=production`.
4. **Persistent storage (required):** SQLite stores everything in one file, so
   attach a persistent disk and point `DB_PATH` at it (e.g. Render Disk mounted
   at `/data` → `DB_PATH=/data/app.db`). Without a disk, the database is wiped
   on every deploy/restart.

## Notes

- Passwords are hashed with bcryptjs (10 rounds); they are never logged or
  returned by the API.
- No `.env` file is committed — copy `.env.example` to `.env` for local dev.
