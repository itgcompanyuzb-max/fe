import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { db, save, id, token } from './db.js';
import { sendVerification, checkVerification, checkSendAbility, telegramConfig } from './telegram.js';
import { createTopUp, verifySignature, isDemo, paymentConfig } from './payments.js';
import { ask } from './assistant.js';

const app = express();
const PORT = Number(process.env.PORT) || 8787;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
if (!process.env.ADMIN_PASSWORD) console.warn('⚠ ADMIN_PASSWORD o\'rnatilmagan, vaqtinchalik parol: "admin"');

// Webhook imzosini tekshirish uchun xom tanani saqlaymiz
app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf.toString('utf8'); } }));

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const normPhone = (p) => '+' + String(p || '').replace(/\D/g, '');
const now = () => new Date().toISOString();

function genCardNumber() {
  let n = '1000'; // demo prefiks, haqiqiy BIN emas
  while (n.length < 16) n += crypto.randomInt(10);
  return n;
}

function publicUser(u) {
  return { id: u.id, phone: u.phone, name: u.name, createdAt: u.createdAt, blocked: !!u.blocked };
}

// ---------- Mijoz autentifikatsiyasi (Telegram Gateway OTP) ----------
app.post('/api/auth/send-code', wrap(async (req, res) => {
  const phone = normPhone(req.body.phone);
  if (phone.length < 10) return res.status(400).json({ error: 'Telefon raqam noto\'g\'ri' });
  const d = db();
  const tg = telegramConfig();
  if (tg.enabled && tg.token) {
    const requestId = await sendVerification(phone);
    d.otps[phone] = { requestId, via: 'telegram', at: Date.now() };
    save();
    return res.json({ sent: true, via: 'telegram' });
  }
  // Telegram ulanmagan: demo kod (faqat ishlab chiqish uchun)
  const code = String(crypto.randomInt(100000, 1000000));
  d.otps[phone] = { code, via: 'demo', at: Date.now() };
  save();
  console.log(`[demo OTP] ${phone}: ${code}`);
  res.json({ sent: true, via: 'demo', demoCode: code });
}));

app.post('/api/auth/verify', wrap(async (req, res) => {
  const phone = normPhone(req.body.phone);
  const code = String(req.body.code || '').trim();
  const d = db();
  const otp = d.otps[phone];
  if (!otp) return res.status(400).json({ error: 'Avval kod so\'rang' });

  let ok = false;
  if (otp.via === 'telegram') ok = (await checkVerification(otp.requestId, code)) === 'code_valid';
  else ok = otp.code === code && Date.now() - otp.at < 5 * 60_000;
  if (!ok) return res.status(400).json({ error: 'Kod noto\'g\'ri yoki eskirgan' });
  delete d.otps[phone];

  let user = d.users.find((u) => u.phone === phone);
  if (!user) {
    user = { id: id('usr'), phone, name: String(req.body.name || '').trim().slice(0, 40), createdAt: now() };
    d.users.push(user);
    d.cards.push({ id: id('crd'), userId: user.id, title: 'Virtual', kind: 'virtual', number: genCardNumber(), balance: 0, createdAt: now() });
  }
  if (user.blocked) return res.status(403).json({ error: 'Hisob bloklangan' });
  const t = token();
  d.sessions[t] = { userId: user.id, at: now() };
  save();
  res.json({ token: t, user: publicUser(user) });
}));

function auth(req, res, next) {
  const t = (req.headers.authorization || '').replace(/^Bearer /, '');
  const s = db().sessions[t];
  const user = s && db().users.find((u) => u.id === s.userId);
  if (!user || user.blocked) return res.status(401).json({ error: 'Avtorizatsiya kerak' });
  req.user = user;
  next();
}

// ---------- Mijoz API ----------
app.get('/api/config', (_req, res) => {
  res.json({ demo: isDemo(), fare: paymentConfig().fare });
});

app.get('/api/me', auth, (req, res) => {
  const d = db();
  res.json({
    user: publicUser(req.user),
    cards: d.cards.filter((c) => c.userId === req.user.id),
    demo: isDemo(),
    fare: paymentConfig().fare,
  });
});

app.patch('/api/me', auth, (req, res) => {
  if (typeof req.body.name === 'string') req.user.name = req.body.name.trim().slice(0, 40);
  save();
  res.json({ user: publicUser(req.user) });
});

app.post('/api/cards', auth, (req, res) => {
  const number = String(req.body.number || '').replace(/\D/g, '');
  if (number.length !== 16) return res.status(400).json({ error: 'Karta raqami 16 ta raqamdan iborat bo\'lishi kerak' });
  const d = db();
  if (d.cards.some((c) => c.number === number)) return res.status(409).json({ error: 'Bu karta allaqachon qo\'shilgan' });
  const card = { id: id('crd'), userId: req.user.id, title: String(req.body.title || 'Transport karta').slice(0, 30), kind: 'physical', number, balance: 0, createdAt: now() };
  d.cards.push(card);
  save();
  res.json({ card });
});

app.delete('/api/cards/:id', auth, (req, res) => {
  const d = db();
  const card = d.cards.find((c) => c.id === req.params.id && c.userId === req.user.id);
  if (!card) return res.status(404).json({ error: 'Topilmadi' });
  if (card.kind === 'virtual') return res.status(400).json({ error: 'Virtual kartani o\'chirib bo\'lmaydi' });
  d.cards = d.cards.filter((c) => c !== card);
  save();
  res.json({ ok: true });
});

app.post('/api/topup', auth, wrap(async (req, res) => {
  const d = db();
  const card = d.cards.find((c) => c.id === req.body.cardId && c.userId === req.user.id);
  const amount = Math.round(Number(req.body.amount));
  if (!card) return res.status(404).json({ error: 'Karta topilmadi' });
  if (!(amount >= 1000 && amount <= 1_000_000)) return res.status(400).json({ error: 'Summa 1 000 – 1 000 000 UZS oralig\'ida bo\'lsin' });

  const tx = { id: id('txn'), userId: req.user.id, cardId: card.id, type: 'topup', title: 'Пополнение', subtitle: `Карта •••• ${card.number.slice(-4)}`, amount, status: 'pending', demo: isDemo(), createdAt: now() };
  const callbackUrl = `${req.protocol}://${req.get('host')}/api/payments/webhook`;
  const result = await createTopUp({ orderId: tx.id, amount, phone: req.user.phone, callbackUrl });
  if (result.status === 'paid') { tx.status = 'paid'; card.balance += amount; }
  d.transactions.push(tx);
  save();
  res.json({ transaction: tx, card, checkoutUrl: result.checkoutUrl });
}));

// To'lov provayderidan qaytuvchi webhook: { orderId, status: 'paid' | 'failed' }, X-Signature: HMAC-SHA256
app.post('/api/payments/webhook', (req, res) => {
  if (!verifySignature(req.rawBody || '', req.headers['x-signature'])) return res.status(401).json({ error: 'bad signature' });
  const d = db();
  const tx = d.transactions.find((t) => t.id === req.body.orderId && t.type === 'topup');
  if (!tx) return res.status(404).json({ error: 'not found' });
  if (tx.status === 'pending') {
    tx.status = req.body.status === 'paid' ? 'paid' : 'failed';
    if (tx.status === 'paid') {
      const card = d.cards.find((c) => c.id === tx.cardId);
      if (card) card.balance += tx.amount;
    }
    save();
  }
  res.json({ ok: true });
});

// QR orqali yo'l haqi to'lash
app.post('/api/rides', auth, (req, res) => {
  const d = db();
  const qr = String(req.body.qr || '').trim().slice(0, 200);
  if (!qr) return res.status(400).json({ error: 'QR kod bo\'sh' });
  const card = d.cards.find((c) => c.id === req.body.cardId && c.userId === req.user.id);
  if (!card) return res.status(404).json({ error: 'Karta topilmadi' });
  const kind = /metro/i.test(qr) ? 'metro' : 'bus';
  const fare = paymentConfig().fare[kind];
  if (card.balance < fare) return res.status(402).json({ error: 'Kartada mablag\' yetarli emas' });
  card.balance -= fare;
  const route = (qr.match(/(?:route|r|marshrut)[=:](\w+)/i) || [])[1];
  const tx = {
    id: id('txn'), userId: req.user.id, cardId: card.id, type: 'ride', kind,
    title: kind === 'metro' ? 'Метро' : 'Автобус',
    subtitle: kind === 'metro' ? 'Оплата за проезд в метро' : `Оплата за проезд в автобусе${route ? ` №${route}` : ''}`,
    amount: -fare, status: 'paid', demo: isDemo(), qr, createdAt: now(),
  };
  d.transactions.push(tx);
  save();
  res.json({ transaction: tx, card });
});

app.get('/api/transactions', auth, (req, res) => {
  const txs = db().transactions.filter((t) => t.userId === req.user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ transactions: txs });
});

app.post('/api/assistant', auth, wrap(async (req, res) => {
  const messages = (Array.isArray(req.body.messages) ? req.body.messages : [])
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-20);
  if (!messages.length || messages.at(-1).role !== 'user') return res.status(400).json({ error: 'Xabar yo\'q' });
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return res.status(503).json({ error: 'AI yordamchi sozlanmagan (ANTHROPIC_API_KEY)' });
  }
  res.json({ reply: await ask(req.user, messages) });
}));

// ---------- Admin API ----------
app.post('/api/admin/login', (req, res) => {
  const a = Buffer.from(String(req.body.password || ''));
  const b = Buffer.from(ADMIN_PASSWORD);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(401).json({ error: 'Parol noto\'g\'ri' });
  const t = token();
  db().adminSessions[t] = { at: now() };
  save();
  res.json({ token: t });
});

function admin(req, res, next) {
  const t = (req.headers.authorization || '').replace(/^Bearer /, '');
  if (!db().adminSessions[t]) return res.status(401).json({ error: 'Admin avtorizatsiyasi kerak' });
  next();
}

const mask = (s) => (s ? '••••' + String(s).slice(-4) : '');

app.get('/api/admin/stats', admin, (_req, res) => {
  const d = db();
  const today = now().slice(0, 10);
  const paid = d.transactions.filter((t) => t.status === 'paid');
  res.json({
    users: d.users.length,
    cards: d.cards.length,
    rides: paid.filter((t) => t.type === 'ride').length,
    ridesToday: paid.filter((t) => t.type === 'ride' && t.createdAt.startsWith(today)).length,
    topupSum: paid.filter((t) => t.type === 'topup').reduce((s, t) => s + t.amount, 0),
    rideSum: -paid.filter((t) => t.type === 'ride').reduce((s, t) => s + t.amount, 0),
    demo: isDemo(),
    telegram: telegramConfig().enabled && !!telegramConfig().token,
  });
});

app.get('/api/admin/users', admin, (_req, res) => {
  const d = db();
  res.json({
    users: d.users.map((u) => {
      const cards = d.cards.filter((c) => c.userId === u.id);
      const txs = d.transactions.filter((t) => t.userId === u.id);
      return {
        ...publicUser(u),
        cards: cards.length,
        balance: cards.reduce((s, c) => s + c.balance, 0),
        rides: txs.filter((t) => t.type === 'ride').length,
        lastActivity: txs.at(-1)?.createdAt || u.createdAt,
      };
    }).sort((a, b) => b.lastActivity.localeCompare(a.lastActivity)),
  });
});

app.get('/api/admin/users/:id', admin, (req, res) => {
  const d = db();
  const u = d.users.find((x) => x.id === req.params.id);
  if (!u) return res.status(404).json({ error: 'Topilmadi' });
  res.json({
    user: publicUser(u),
    cards: d.cards.filter((c) => c.userId === u.id),
    transactions: d.transactions.filter((t) => t.userId === u.id).reverse(),
  });
});

app.post('/api/admin/users/:id/block', admin, (req, res) => {
  const d = db();
  const u = d.users.find((x) => x.id === req.params.id);
  if (!u) return res.status(404).json({ error: 'Topilmadi' });
  u.blocked = !!req.body.blocked;
  if (u.blocked) for (const [t, s] of Object.entries(d.sessions)) if (s.userId === u.id) delete d.sessions[t];
  save();
  res.json({ user: publicUser(u) });
});

app.get('/api/admin/transactions', admin, (_req, res) => {
  const d = db();
  const phone = Object.fromEntries(d.users.map((u) => [u.id, u.phone]));
  res.json({ transactions: d.transactions.slice(-500).reverse().map((t) => ({ ...t, phone: phone[t.userId] })) });
});

app.get('/api/admin/settings', admin, (_req, res) => {
  const { payment, telegram } = db().settings;
  res.json({
    payment: { ...payment, secretKey: mask(payment.secretKey), secretFromEnv: !!process.env.PAYMENT_SECRET_KEY },
    telegram: { ...telegram, token: mask(telegram.token), tokenFromEnv: !!process.env.TELEGRAM_GATEWAY_TOKEN },
    webhookUrl: '/api/payments/webhook',
  });
});

app.put('/api/admin/settings', admin, (req, res) => {
  const s = db().settings;
  const p = req.body.payment;
  if (p) {
    if (['demo', 'http'].includes(p.provider)) s.payment.provider = p.provider;
    if (typeof p.apiUrl === 'string') s.payment.apiUrl = p.apiUrl.trim();
    if (typeof p.merchantId === 'string') s.payment.merchantId = p.merchantId.trim();
    if (p.secretKey && !p.secretKey.startsWith('••••')) s.payment.secretKey = p.secretKey.trim();
    if (p.fare) for (const k of ['bus', 'metro']) if (Number(p.fare[k]) > 0) s.payment.fare[k] = Math.round(Number(p.fare[k]));
  }
  const t = req.body.telegram;
  if (t) {
    if (typeof t.enabled === 'boolean') s.telegram.enabled = t.enabled;
    if (t.token && !t.token.startsWith('••••')) s.telegram.token = t.token.trim();
    if (Number(t.ttl) >= 30 && Number(t.ttl) <= 3600) s.telegram.ttl = Number(t.ttl);
    if (Number(t.codeLength) >= 4 && Number(t.codeLength) <= 8) s.telegram.codeLength = Number(t.codeLength);
  }
  save();
  res.json({ ok: true });
});

app.post('/api/admin/telegram/test', admin, wrap(async (req, res) => {
  const result = await checkSendAbility(normPhone(req.body.phone));
  res.json({ ok: true, result });
}));

// ---------- Statik fayllar (prod) ----------
const dist = path.resolve('dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server xatosi' });
});

app.listen(PORT, () => console.log(`API: http://localhost:${PORT}`));
