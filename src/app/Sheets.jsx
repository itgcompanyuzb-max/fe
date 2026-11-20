import { useState } from 'react';
import { api, cardNum, money } from '../api.js';
import { Sheet } from '../ui/common.jsx';

export function TopUpSheet({ me, card, onClose, refresh, notify }) {
  const [cardId, setCardId] = useState(card?.id || me.cards[0]?.id);
  const [amount, setAmount] = useState('20000');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const r = await api.post('/api/topup', { cardId, amount: Number(amount) });
      if (r.checkoutUrl) { location.href = r.checkoutUrl; return; }
      await refresh();
      notify(`Карта пополнена на ${money(r.transaction.amount)} UZS`);
      onClose();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <Sheet title="Пополнить карту" onClose={onClose}>
      <form onSubmit={submit}>
        <label className="field"><span>Карта</span>
          <select value={cardId} onChange={(e) => setCardId(e.target.value)}>
            {me.cards.map((c) => <option key={c.id} value={c.id}>{c.title} •••• {c.number.slice(-4)} — {money(c.balance)} UZS</option>)}
          </select>
        </label>
        <label className="field"><span>Сумма, UZS</span>
          <input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} />
        </label>
        <div className="amounts">
          {[10000, 20000, 50000, 100000].map((v) => <button type="button" key={v} onClick={() => setAmount(String(v))}>{money(v)}</button>)}
        </div>
        {me.demo && <p className="note">Демо-режим: платёжная система не подключена, баланс пополняется условно.</p>}
        {error && <div className="error">{error}</div>}
        <button className="btn" disabled={busy || !amount}>Пополнить</button>
      </form>
    </Sheet>
  );
}

export function AddCardSheet({ onClose, onAdded }) {
  const [number, setNumber] = useState('');
  const [title, setTitle] = useState('Транспортная карта');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/cards', { number, title });
      onAdded(); onClose();
    } catch (err) { setError(err.message); }
  };

  return (
    <Sheet title="Добавить карту" onClose={onClose}>
      <form onSubmit={submit}>
        <label className="field"><span>Номер карты</span>
          <input inputMode="numeric" value={cardNum(number)} placeholder="0000 0000 0000 0000"
            onChange={(e) => setNumber(e.target.value.replace(/\D/g, '').slice(0, 16))} autoFocus />
        </label>
        <label className="field"><span>Название</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={30} />
        </label>
        {error && <div className="error">{error}</div>}
        <button className="btn" disabled={number.length !== 16}>Добавить</button>
      </form>
    </Sheet>
  );
}
