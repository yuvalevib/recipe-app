const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Desired user credentials (Hebrew username)
const USERNAME = 'איילת';
const PASSWORD = '1234';

const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function readUsers() {
  try {
    if (!fs.existsSync(usersFile)) return [];
    const content = fs.readFileSync(usersFile, 'utf8');
    if (!content) return [];
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('[seedUser] Failed to read users file:', e.message);
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

(async () => {
  const users = readUsers();
  if (users.find(u => u.username === USERNAME)) {
    console.log(`[seedUser] User "${USERNAME}" already exists. No changes made.`);
    return;
  }
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const user = { _id: generateId(), username: USERNAME, passwordHash, role: users.length === 0 ? 'admin' : 'user' };
  users.push(user);
  writeUsers(users);
  console.log(`[seedUser] Added user "${USERNAME}" with password "${PASSWORD}" (hashed).`);
})();
