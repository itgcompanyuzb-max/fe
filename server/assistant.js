// AI yordamchi (Claude API). ANTHROPIC_API_KEY muhit o'zgaruvchisi kerak.
import Anthropic from '@anthropic-ai/sdk';
import { db } from './db.js';

let client;
const getClient = () => (client ??= new Anthropic());

const SYSTEM = `Siz "Transit" transport to'lov ilovasining yordamchisisiz (Toshkent).
Foydalanuvchiga quyidagilarda yordam bering: marshrutlar va transport turlari, yo'l haqi, kartani to'ldirish,
tariflar, xarajatlar tahlili va ilovadan foydalanish. Foydalanuvchi qaysi tilda yozsa (o'zbek yoki rus), shu tilda qisqa javob bering.
Aniq bilmagan marshrut yoki jadval haqida taxmin qilmang — buni ochiq ayting.`;

function userContext(user) {
  const d = db();
  const cards = d.cards.filter((c) => c.userId === user.id);
  const txs = d.transactions.filter((t) => t.userId === user.id).slice(-60);
  const fare = d.settings.payment.fare;
  return [
    `Foydalanuvchi: ${user.name || 'nomsiz'}`,
    `Yo'l haqi: avtobus ${fare.bus} UZS, metro ${fare.metro} UZS`,
    `Kartalar: ${cards.map((c) => `${c.title} (…${c.number.slice(-4)}): ${c.balance} UZS`).join('; ') || 'yo\'q'}`,
    `So'nggi amallar (eng yangisi oxirida):`,
    ...txs.map((t) => `${t.createdAt.slice(0, 16)} ${t.type} ${t.title} ${t.amount} UZS`),
  ].join('\n');
}

export async function ask(user, messages) {
  const response = await getClient().beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 4000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low' },
    system: SYSTEM,
    messages: [
      ...messages.slice(0, -1),
      { role: 'user', content: `<kontekst>\n${userContext(user)}\n</kontekst>\n\n${messages.at(-1).content}` },
    ],
  });
  if (response.stop_reason === 'refusal') return 'Kechirasiz, bu savolga javob bera olmayman.';
  return response.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
}
