// Oddiy JSON-fayl ma'lumotlar bazasi (demo uchun). Prod uchun PostgreSQL ga almashtiring.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const FILE = process.env.DB_FILE || path.resolve('data/db.json');

const defaults = () => ({
  users: [],
  sessions: {},
  adminSessions: {},
  cards: [],
  transactions: [],
  otps: {},
  settings: {
    payment: {
      provider: 'demo', // 'demo' | 'http'
      apiUrl: '',
      merchantId: '',
      secretKey: '',
      fare: { bus: 2500, metro: 2500 },
    },
    telegram: {
      enabled: false,
      token: '',
      ttl: 300,
      codeLength: 6,
    },
  },
});

let data;

function load() {
  try {
    data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    const d = defaults();
    data = { ...d, ...data, settings: {
      payment: { ...d.settings.payment, ...data.settings?.payment },
      telegram: { ...d.settings.telegram, ...data.settings?.telegram },
    } };
  } catch {
    data = defaults();
  }
}
load();

export const db = () => data;

export function save() {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, FILE);
}

export const id = (prefix) => `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
export const token = () => crypto.randomBytes(24).toString('hex');
