// To'lov API qatlami.
//  - 'demo': hisob darhol to'ldiriladi (haqiqiy pul yo'q, ilovada DEMO belgisi chiqadi)
//  - 'http': umumiy HTTP provayder. Server apiUrl ga HMAC imzo bilan so'rov yuboradi,
//            provayder /api/payments/webhook ga natijani qaytaradi.
import crypto from 'node:crypto';
import { db } from './db.js';

export function paymentConfig() {
  const p = db().settings.payment;
  return { ...p, secretKey: process.env.PAYMENT_SECRET_KEY || p.secretKey };
}

export const isDemo = () => paymentConfig().provider !== 'http';

export const sign = (body, secret) =>
  crypto.createHmac('sha256', secret).update(body).digest('hex');

export function verifySignature(rawBody, signature) {
  const { secretKey } = paymentConfig();
  if (!secretKey || !signature) return false;
  const expected = Buffer.from(sign(rawBody, secretKey));
  const got = Buffer.from(String(signature));
  return expected.length === got.length && crypto.timingSafeEqual(expected, got);
}

/** Hisobni to'ldirishni boshlaydi. { status: 'paid' } yoki { status: 'pending', checkoutUrl } */
export async function createTopUp({ orderId, amount, phone, callbackUrl }) {
  const cfg = paymentConfig();
  if (cfg.provider !== 'http') return { status: 'paid' };
  if (!cfg.apiUrl || !cfg.secretKey) throw new Error("To'lov API sozlanmagan");

  const body = JSON.stringify({ merchantId: cfg.merchantId, orderId, amount, currency: 'UZS', phone, callbackUrl });
  const res = await fetch(cfg.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Signature': sign(body, cfg.secretKey) },
    body,
  });
  if (!res.ok) throw new Error(`To'lov provayderi xatosi: HTTP ${res.status}`);
  const json = await res.json();
  return { status: 'pending', checkoutUrl: json.checkoutUrl };
}
