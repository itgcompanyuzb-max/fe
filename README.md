# Transit — transport to'lov ilovasi (konsept, AI bilan)

Mobil ilova (PWA) + admin panel + Node.js server.

- **Ilova** (`/`): bosh sahifa, Transport (kartalar, to'ldirish, tariflar, QR to'lov), Tarix (filtrlar, CSV, analitika), Menyu, AI yordamchi.
- **Admin panel** (`/admin`): mijozlar (kartalari, balansi, tranzaksiyalari, bloklash), barcha tranzaksiyalar, to'lov API va Telegram Gateway sozlamalari.
- **Kirish**: telefon raqam + Telegram Gateway orqali tasdiqlash kodi.

> To'lov provayderi ulanmaguncha ilova **DEMO** rejimida ishlaydi: balans shartli, barcha amallar va ekranlar "DEMO" belgisi bilan ko'rsatiladi.

## Ishga tushirish

```bash
npm install
npm run dev          # http://localhost:5173  (API: 8787)
```

Prod:

```bash
npm run build && npm start   # http://localhost:8787
```

## Muhit o'zgaruvchilari

| O'zgaruvchi | Vazifasi |
|---|---|
| `ADMIN_PASSWORD` | Admin panel paroli (o'rnatilmasa — `admin`, faqat lokal sinov uchun) |
| `TELEGRAM_GATEWAY_TOKEN` | Telegram Gateway API token (admin paneldan ham kiritish mumkin) |
| `PAYMENT_SECRET_KEY` | To'lov provayderi HMAC kaliti (admin paneldan ham kiritish mumkin) |
| `ANTHROPIC_API_KEY` | AI yordamchi uchun Claude API kaliti |
| `PORT`, `DB_FILE` | Server porti, ma'lumotlar fayli (`data/db.json`) |

## To'lov API (HTTP provayder)

1. Server `POST {apiUrl}` ga `{ merchantId, orderId, amount, currency, phone, callbackUrl }` yuboradi, `X-Signature: HMAC-SHA256(body, secret)`.
2. Provayder `{ checkoutUrl }` qaytaradi — ilova foydalanuvchini shu sahifaga yo'naltiradi.
3. Provayder natijani `POST /api/payments/webhook` ga `{ orderId, status: "paid" | "failed" }` ko'rinishida xuddi shu imzo bilan yuboradi.

Payme/Click kabi aniq provayder uchun `server/payments.js` dagi `createTopUp` va webhook formatini moslashtiring.

## QR kod formati

QR matnida `metro` bo'lsa — metro, aks holda avtobus. Marshrut raqami: `bus:route=67`.

## Tuzilma

```
server/       Express API (auth, kartalar, to'lov, safarlar, admin, AI)
src/app/      Mobil ilova ekranlari
src/admin/    Admin panel
src/ui/       Yagona ikonkalar (icons.jsx), illyustratsiyalar (art.jsx), umumiy komponentlar
```

Brend nomi va logotip `src/ui/common.jsx` (`Logo`) va `public/logo.svg` da — bitta joyda almashtiriladi.

## ATTO uchun konsept-prototip (`/concept`)

Taqdimot uchun faqat ko'rinish: bosh sahifa, Transport, Menyu va AI yordamchi namunasi.
To'lov, QR to'lov, kartani to'ldirish va to'langan safarlar tarixi ataylab yo'q: ular ATTO tizimiga ulanganda ishlaydi.
Rasmlar (`public/concept/`) loyiha egasi tomonidan berilgan; ulardan foydalanish huquqi uchun loyiha egasi javobgar.
