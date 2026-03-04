#!/usr/bin/env node
import bcrypt from 'bcryptjs';
import { readUsers, writeUsers, findUser } from './users.js';

const [username, password] = process.argv.slice(2);

if (!username || !password) {
  console.error('Usage: node server/create-user.js <username> <password>');
  process.exit(1);
}

if (findUser(username)) {
  console.error(`Error: User "${username}" already exists.`);
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
const data = readUsers();
data.users.push({ id: crypto.randomUUID(), username, passwordHash: hash });
writeUsers(data);

console.log(`User "${username}" created successfully.`);
