import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const USERS_FILE = process.env.USERS_FILE || join(__dirname, 'users.json');

export function readUsers() {
  try {
    if (!existsSync(USERS_FILE)) return { users: [] };
    return JSON.parse(readFileSync(USERS_FILE, 'utf8'));
  } catch {
    return { users: [] };
  }
}

export function writeUsers(data) {
  writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

export function findUser(username) {
  return readUsers().users.find((u) => u.username === username);
}
