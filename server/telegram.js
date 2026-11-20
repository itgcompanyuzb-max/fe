// Telegram Gateway API: https://core.telegram.org/gateway/api
// Tasdiqlash kodini telefon raqamga Telegram orqali yuboradi.
import { db } from './db.js';

const BASE = 'https://gatewayapi.telegram.org';

export function telegramConfig() {
  const t = db().settings.telegram;
  return {
    ...t,
    token: process.env.TELEGRAM_GATEWAY_TOKEN || t.token,
  };
}

async function call(method, params) {
  const { token } = telegramConfig();
  if (!token) throw new Error('Telegram Gateway token sozlanmagan');
  const res = await fetch(`${BASE}/${method}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const json = await res.json().catch(() => ({ ok: false, error: `HTTP ${res.status}` }));
  if (!json.ok) throw new Error(json.error || 'Telegram Gateway xatosi');
  return json.result;
}

/** Kod yuboradi, request_id qaytaradi. */
export async function sendVerification(phone) {
  const cfg = telegramConfig();
  const result = await call('sendVerificationMessage', {
    phone_number: phone,
    code_length: Number(cfg.codeLength) || 6,
    ttl: Number(cfg.ttl) || 300,
  });
  return result.request_id;
}

/** Kod to'g'riligini tekshiradi. */
export async function checkVerification(requestId, code) {
  const result = await call('checkVerificationStatus', { request_id: requestId, code });
  return result.verification_status?.status; // 'code_valid' | 'code_invalid' | 'expired' | ...
}

export async function checkSendAbility(phone) {
  return call('checkSendAbility', { phone_number: phone });
}
