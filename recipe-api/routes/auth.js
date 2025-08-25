const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

const dataDir = path.join(__dirname, '..', 'data');
const usersFile = path.join(dataDir, 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

async function readUsers() {
  try {
    const content = await fs.readFile(usersFile, 'utf8');
    if (!content) return [];
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}
async function writeUsers(users) {
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

// Register (simple, for initial admin creation) - now also returns a JWT token so client can auto-login
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'username and password required' });
    const users = await readUsers();
    if (users.find(u => u.username === username)) {
      return res.status(409).json({ message: 'username already exists' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = { _id: generateId(), username, passwordHash: hash, role: users.length === 0 ? 'admin' : 'user' };
    users.push(user);
    await writeUsers(users);
    const token = jwt.sign({ sub: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { _id: user._id, username: user.username, role: user.role } });
  } catch (e) {
    res.status(500).json({ message: 'register failed', error: e.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'username and password required' });
    const users = await readUsers();
    const user = users.find(u => u.username === username);
    if (!user) return res.status(401).json({ message: 'invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'invalid credentials' });
    const token = jwt.sign({ sub: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { _id: user._id, username: user.username, role: user.role } });
  } catch (e) {
    res.status(500).json({ message: 'login failed', error: e.message });
  }
});

// Verify token
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'missing token' });
    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ user: payload });
  } catch (e) {
    res.status(401).json({ message: 'invalid token', error: e.message });
  }
});

module.exports = { router, JWT_SECRET };
