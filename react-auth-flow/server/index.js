// =============================================================================
//  Tiny auth API for the lesson — Express + JWT, everything in memory.
//
//  The two-token pattern:
//    ACCESS TOKEN  — short-lived (30s here so we can watch it expire in class).
//                    Sent back in the JSON body. The client keeps it in MEMORY
//                    (Zustand) and sends it as `Authorization: Bearer <token>`.
//    REFRESH TOKEN — long-lived (7 days). Sent as an httpOnly cookie, so
//                    JavaScript in the browser can NEVER read it (XSS-safe).
//                    The browser attaches it automatically to /api/auth/*.
//
//  Restart the server = all users/sessions you created are gone. That's fine.
// =============================================================================
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

const PORT = 4000;
const ACCESS_SECRET = 'dev-access-secret-change-me';
const REFRESH_SECRET = 'dev-refresh-secret-change-me';
const ACCESS_TTL_SECONDS = Number(process.env.ACCESS_TTL ?? 30);
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7;
const LATENCY_MS = Number(process.env.LATENCY ?? 400); // fake network delay so loading states are visible

// ---------------------------------------------------------------------------
//  "Database"
// ---------------------------------------------------------------------------
const users = [
  { id: 'u1', name: 'Sara Student', email: 'student@demo.dev', role: 'student', passwordHash: bcrypt.hashSync('password123', 10) },
  { id: 'u2', name: 'Tariq Teacher', email: 'teacher@demo.dev', role: 'admin', passwordHash: bcrypt.hashSync('password123', 10) },
];

const notes = [
  { id: crypto.randomUUID(), userId: 'u1', text: 'Access tokens live in memory, not localStorage.', createdAt: Date.now() },
  { id: crypto.randomUUID(), userId: 'u1', text: 'Refresh token = httpOnly cookie.', createdAt: Date.now() },
  { id: crypto.randomUUID(), userId: 'u2', text: 'Grade the auth-flow homework.', createdAt: Date.now() },
];

// Every refresh token has an id (jti). We only accept ids that are in this set.
// On every refresh we delete the old id and issue a new one = "rotation".
// Logout deletes the id = the refresh token is dead even if someone stole it.
const activeRefreshIds = new Set();

// Never send passwordHash to the client.
const publicUser = ({ passwordHash, ...rest }) => rest;

// ---------------------------------------------------------------------------
//  Token helpers
// ---------------------------------------------------------------------------
function issueAccessToken(user) {
  const token = jwt.sign({ sub: user.id, role: user.role }, ACCESS_SECRET, { expiresIn: ACCESS_TTL_SECONDS });
  return { accessToken: token, expiresAt: Date.now() + ACCESS_TTL_SECONDS * 1000 };
}

function setRefreshCookie(res, user) {
  const jti = crypto.randomUUID();
  activeRefreshIds.add(jti);
  const token = jwt.sign({ sub: user.id, jti }, REFRESH_SECRET, { expiresIn: REFRESH_TTL_SECONDS });
  res.cookie('refresh_token', token, {
    httpOnly: true,     // JS can't read it
    sameSite: 'strict', // not sent on cross-site requests (CSRF protection)
    secure: false,      // set true in production (HTTPS only)
    path: '/api/auth',  // only sent to auth endpoints, not every request
    maxAge: REFRESH_TTL_SECONDS * 1000,
  });
}

function clearRefreshCookie(res) {
  res.clearCookie('refresh_token', { path: '/api/auth' });
}

// Login, register and refresh all answer with the same shape.
function sendSession(res, user) {
  setRefreshCookie(res, user);
  res.json({ ...issueAccessToken(user), user: publicUser(user) });
}

// ---------------------------------------------------------------------------
//  Middleware
// ---------------------------------------------------------------------------
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => setTimeout(next, LATENCY_MS));
app.use((req, res, next) => {
  res.on('finish', () => console.log(`${req.method.padEnd(6)} ${req.originalUrl.padEnd(22)} → ${res.statusCode}`));
  next();
});

// Protects a route: needs a valid, non-expired access token.
function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing access token' });
  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    req.user = users.find((u) => u.id === payload.sub);
    if (!req.user) return res.status(401).json({ message: 'User no longer exists' });
    next();
  } catch (err) {
    // TokenExpiredError → the client should call /auth/refresh and retry.
    res.status(401).json({ message: err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid access token' });
  }
}

// 401 = "who are you?"   403 = "I know who you are, and the answer is no."
const requireRole = (role) => (req, res, next) =>
  req.user.role === role ? next() : res.status(403).json({ message: `Only ${role}s can see this` });

// ---------------------------------------------------------------------------
//  Auth routes
// ---------------------------------------------------------------------------
app.post('/api/auth/register', async (req, res) => {
  const { name = '', email = '', password = '' } = req.body ?? {};
  const errors = {};
  if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Enter a valid email';
  if (password.length < 8) errors.password = 'Password must be at least 8 characters';
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Please fix the errors below', errors });

  if (users.some((u) => u.email === email.toLowerCase())) {
    return res.status(409).json({ message: 'An account with this email already exists', errors: { email: 'Already registered' } });
  }

  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: email.toLowerCase(),
    role: 'student',
    passwordHash: await bcrypt.hash(password, 10),
  };
  users.push(user);
  res.status(201);
  sendSession(res, user);
});

app.post('/api/auth/login', async (req, res) => {
  const { email = '', password = '' } = req.body ?? {};
  const user = users.find((u) => u.email === email.toLowerCase());
  // Same message for "no such user" and "wrong password" — don't leak which emails exist.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Email or password is incorrect' });
  }
  sendSession(res, user);
});

app.post('/api/auth/refresh', (req, res) => {
  const token = req.cookies.refresh_token;
  if (!token) return res.status(401).json({ message: 'No refresh token' });
  try {
    const { sub, jti } = jwt.verify(token, REFRESH_SECRET);
    if (!activeRefreshIds.has(jti)) throw new Error('revoked');
    const user = users.find((u) => u.id === sub);
    if (!user) throw new Error('no user');
    activeRefreshIds.delete(jti); // rotation: the old refresh token is now useless
    sendSession(res, user);
  } catch {
    clearRefreshCookie(res);
    res.status(401).json({ message: 'Session expired, please log in again' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.cookies.refresh_token;
  if (token) {
    try { activeRefreshIds.delete(jwt.verify(token, REFRESH_SECRET).jti); } catch { /* already invalid */ }
  }
  clearRefreshCookie(res);
  res.status(204).end();
});

// ---------------------------------------------------------------------------
//  Protected routes
// ---------------------------------------------------------------------------
app.get('/api/me', requireAuth, (req, res) => res.json(publicUser(req.user)));

app.get('/api/notes', requireAuth, (req, res) => {
  res.json(notes.filter((n) => n.userId === req.user.id).sort((a, b) => b.createdAt - a.createdAt));
});

app.post('/api/notes', requireAuth, (req, res) => {
  const text = String(req.body?.text ?? '').trim();
  if (!text) return res.status(400).json({ message: 'Note cannot be empty' });
  const note = { id: crypto.randomUUID(), userId: req.user.id, text, createdAt: Date.now() };
  notes.push(note);
  res.status(201).json(note);
});

app.delete('/api/notes/:id', requireAuth, (req, res) => {
  const i = notes.findIndex((n) => n.id === req.params.id && n.userId === req.user.id);
  if (i === -1) return res.status(404).json({ message: 'Note not found' });
  notes.splice(i, 1);
  res.status(204).end();
});

app.get('/api/admin/stats', requireAuth, requireRole('admin'), (req, res) => {
  res.json({
    users: users.length,
    notes: notes.length,
    activeSessions: activeRefreshIds.size,
    accounts: users.map(publicUser),
  });
});

app.listen(PORT, () => {
  console.log(`\n  Auth API on http://localhost:${PORT}  (access token TTL: ${ACCESS_TTL_SECONDS}s)`);
  console.log('  Demo users: student@demo.dev / teacher@demo.dev — password: password123\n');
});
