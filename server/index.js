import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { findUser } from './users.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = process.env.DATA_FILE || join(__dirname, 'data.json');
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is not set. Aborting.');
  process.exit(1);
}

const app = express();
app.use(express.json());
app.use(cookieParser());

if (isProd) {
  app.use(express.static(join(__dirname, '../dist')));
}

function readData() {
  try {
    if (!existsSync(DATA_FILE)) return { sessions: [], weightLog: [], exercises: [] };
    const data = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    return { sessions: [], weightLog: [], exercises: [], ...data };
  } catch {
    return { sessions: [], weightLog: [], exercises: [] };
  }
}

function writeData(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function authMiddleware(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
}

const COOKIE_OPTS = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Auth routes (no middleware)
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  const user = findUser(username);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, COOKIE_OPTS);
  res.json({ user: { id: user.id, username: user.username } });
});

app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: isProd, sameSite: 'strict' });
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const user = jwt.verify(token, JWT_SECRET);
    res.json({ id: user.id, username: user.username });
  } catch {
    res.status(401).json({ error: 'Invalid session' });
  }
});

// Protected session routes
app.get('/api/sessions', authMiddleware, (_req, res) => {
  const sessions = readData().sessions.filter((s) => s.userId === _req.user.id);
  res.json(sessions);
});

app.post('/api/sessions', authMiddleware, (req, res) => {
  const data = readData();
  const session = { ...req.body, userId: req.user.id };
  data.sessions.push(session);
  writeData(data);
  res.json(session);
});

app.delete('/api/sessions/:id', authMiddleware, (req, res) => {
  const data = readData();
  const session = data.sessions.find((s) => s.id === req.params.id);
  if (!session) return res.status(404).json({ error: 'Not found' });
  if (session.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  data.sessions = data.sessions.filter((s) => s.id !== req.params.id);
  writeData(data);
  res.json({ ok: true });
});

// Protected weight routes
app.get('/api/weight', authMiddleware, (req, res) => {
  const data = readData();
  res.json(data.weightLog.filter((e) => e.userId === req.user.id));
});

app.post('/api/weight', authMiddleware, (req, res) => {
  const data = readData();
  const entry = { ...req.body, userId: req.user.id };
  data.weightLog.push(entry);
  writeData(data);
  res.json(entry);
});

app.delete('/api/weight/:id', authMiddleware, (req, res) => {
  const data = readData();
  const entry = data.weightLog.find((e) => e.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'Not found' });
  if (entry.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  data.weightLog = data.weightLog.filter((e) => e.id !== req.params.id);
  writeData(data);
  res.json({ ok: true });
});

// Protected exercise library routes
app.get('/api/exercises', authMiddleware, (req, res) => {
  const data = readData();
  res.json(data.exercises.filter((e) => e.userId === req.user.id));
});

app.post('/api/exercises', authMiddleware, (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name required' });
  const data = readData();
  const exercise = { id: crypto.randomUUID(), name: name.trim(), userId: req.user.id };
  data.exercises.push(exercise);
  writeData(data);
  res.json(exercise);
});

app.delete('/api/exercises/:id', authMiddleware, (req, res) => {
  const data = readData();
  const exercise = data.exercises.find((e) => e.id === req.params.id);
  if (!exercise) return res.status(404).json({ error: 'Not found' });
  if (exercise.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  data.exercises = data.exercises.filter((e) => e.id !== req.params.id);
  writeData(data);
  res.json({ ok: true });
});

if (isProd) {
  app.get('/{*path}', (_req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Iron Log server running on port ${PORT}`);
});
