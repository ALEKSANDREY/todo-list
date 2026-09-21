// JWT auth helpers + requireAuth middleware.
// (No cookie-parser dependency: cookies are parsed/set manually to keep deps minimal.)
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
if (!process.env.JWT_SECRET) {
  console.warn(
    '[auth] WARNING: JWT_SECRET is not set; using insecure dev default. Set JWT_SECRET in production!'
  );
}
const COOKIE_NAME = 'todo_session';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days, in seconds
const SECURE = process.env.COOKIE_SECURE === 'true';

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name || '' },
    SECRET,
    { expiresIn: '30d' }
  );
}

function getCookie(req, name) {
  const header = req.headers.cookie;
  if (!header) return null;
  const parts = header.split(';');
  for (const part of parts) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    if (part.slice(0, i).trim() === name) {
      try {
        return decodeURIComponent(part.slice(i + 1).trim());
      } catch {
        return part.slice(i + 1).trim();
      }
    }
  }
  return null;
}

function buildSetCookie(name, value, opts) {
  let s = `${name}=${encodeURIComponent(value)}`;
  if (opts.maxAge != null) s += `; Max-Age=${opts.maxAge}`;
  if (opts.expires) s += `; Expires=${opts.expires.toUTCString()}`;
  s += `; Path=${opts.path || '/'}`;
  if (opts.httpOnly) s += '; HttpOnly';
  if (opts.secure) s += '; Secure';
  if (opts.sameSite) s += `; SameSite=${opts.sameSite}`;
  return s;
}

function setSessionCookie(res, token) {
  res.setHeader(
    'Set-Cookie',
    buildSetCookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: SECURE,
      sameSite: 'Lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    })
  );
}

function clearSessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    buildSetCookie(COOKIE_NAME, '', {
      httpOnly: true,
      secure: SECURE,
      sameSite: 'Lax',
      expires: new Date(0),
      path: '/',
    })
  );
}

function requireAuth(req, res, next) {
  const token = getCookie(req, COOKIE_NAME);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = { id: payload.id, email: payload.email, name: payload.name || '' };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

function randomPassword() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  COOKIE_NAME,
  signToken,
  setSessionCookie,
  clearSessionCookie,
  requireAuth,
  randomPassword,
};
