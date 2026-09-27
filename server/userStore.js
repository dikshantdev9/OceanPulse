import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class UserStore {
  constructor() {
    this.users = [];
    this.loadUsers();
    this.seedDefaultUsers();
  }

  loadUsers() {
    try {
      if (fs.existsSync(USERS_FILE)) {
        const raw = fs.readFileSync(USERS_FILE, 'utf-8');
        this.users = JSON.parse(raw);
      } else {
        this.users = [];
      }
    } catch (err) {
      console.error('[UserStore] Error loading users:', err);
      this.users = [];
    }
  }

  saveUsers() {
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(this.users, null, 2), 'utf-8');
    } catch (err) {
      console.error('[UserStore] Error saving users:', err);
    }
  }

  seedDefaultUsers() {
    const demoEmail = 'demo@oceanpulse.ai';
    const existing = this.users.find((u) => u.email.toLowerCase() === demoEmail.toLowerCase());

    if (!existing) {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync('Demo@123', salt);

      const demoUser = {
        id: 'user-demo-001',
        name: 'Demo Intelligence Officer',
        email: demoEmail,
        password: hashedPassword,
        role: 'agency',
        createdAt: new Date().toISOString(),
      };

      this.users.push(demoUser);
      this.saveUsers();
      console.log('[UserStore] Seeded default demo account: demo@oceanpulse.ai / Demo@123');
    }
  }

  findByEmail(email) {
    if (!email) return undefined;
    return this.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  findById(id) {
    return this.users.find((u) => u.id === id);
  }

  createUser({ name, email, passwordPlain, role }) {
    const emailNormalized = email.trim().toLowerCase();
    if (this.findByEmail(emailNormalized)) {
      throw new Error('EMAIL_EXISTS');
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(passwordPlain, salt);

    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: emailNormalized,
      password: hashedPassword,
      role: role || 'researcher',
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    this.saveUsers();

    return this.toPublicUser(newUser);
  }

  toPublicUser(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}

export const userStore = new UserStore();
