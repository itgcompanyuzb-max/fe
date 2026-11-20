import { useEffect, useMemo, useState } from 'react';
import { api, money } from '../api.js';
import { Icon } from '../ui/icons.jsx';
import { Art } from '../ui/art.jsx';
import { Sheet, DemoBadge } from '../ui/common.jsx';

const MONTHS = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
const MONTHS_GEN = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const TYPES = { all: 'тип операции', ride: 'Проезд', topup: 'Пополнение' };

const monthKey = (iso) => iso.slice(0, 7);
const dayKey = (d) => d.toLocaleDateString('sv-SE');

function dayLabel(key) {
  const d = new Date(key + 'T00:00');
  const label = `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`;
  const today = new Date();
  const yest = new Date(Date.now() - 864e5);
  if (key === dayKey(today)) return `Сегодня, ${label}`;
  if (key === dayKey(yest)) return `Вчера, ${label}`;
  return label;
}

function Filter({ label, value, onChange, options }) {
  return (
    <label className="chip">
      {label}<Icon name="chevronDown" size={20} />
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    </label>
  );
}

export default function History({ me }) {
  const [txs, setTxs] = useState(null);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [type, setType] = useState('all');
  const [card, setCard] = useState('all');
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => { api.get('/api/transactions').then((r) => setTxs(r.transactions)); }, []);

  const months = useMemo(() => {
    const set = new Set([new Date().toISOString().slice(0, 7), ...(txs || []).map((t) => monthKey(t.createdAt))]);
    return [...set].sort().reverse();
  }, [txs]);

  const list = (txs || []).filter((t) => t.status !== 'failed' && monthKey(t.createdAt) === month
    && (type === 'all' || t.type === type) && (card === 'all' || t.cardId === card));

  const groups = useMemo(() => {
    const g = new Map();
    for (const t of list) {
      const k = dayKey(new Date(t.createdAt));
      if (!g.has(k)) g.set(k, []);
      g.get(k).push(t);
    }
    return [...g];
  }, [list]);

  const exportCsv = () => {
    const rows = [['Дата', 'Операция', 'Описание', 'Сумма UZS', 'Статус'], ...list.map((t) => [new Date(t.createdAt).toLocaleString('ru-RU'), t.title, t.subtitle, t.amount, t.status])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' }));
    a.download = `history-${month}.csv`;
    a.click();
  };

  const mLabel = (k) => MONTHS[Number(k.slice(5)) - 1] + (k.slice(0, 4) !== String(new Date().getFullYear()) ? ` ${k.slice(0, 4)}` : '');

  return (
    <>
      <div className="hist-head">
        <h1>История</h1>
        <button className="round-btn" onClick={exportCsv} aria-label="Скачать"><Icon name="download" /></button>
        <button className="grad-btn" onClick={() => setAnalytics(true)}>Аналитика <Icon name="sparkle" size={22} /></button>
      </div>
      <div className="filters">
        <Filter label={mLabel(month)} value={month} onChange={setMonth} options={months.map((m) => [m, mLabel(m)])} />
        <Filter label={TYPES[type]} value={type} onChange={setType} options={Object.entries(TYPES).map(([k, v]) => [k, k === 'all' ? 'Все операции' : v])} />
        <Filter label={card === 'all' ? 'Карты' : `•••• ${me.cards.find((c) => c.id === card)?.number.slice(-4)}`} value={card} onChange={setCard}
          options={[['all', 'Все карты'], ...me.cards.map((c) => [c.id, `${c.title} •••• ${c.number.slice(-4)}`])]} />
      </div>
      <div className="screen" style={{ paddingTop: 0 }}>
        {txs && !list.length && (
          <div className="empty"><Art name="bus" />Операций пока нет.<br />Оплатите проезд через QR — поездка появится здесь.</div>
        )}
        {groups.map(([day, items]) => (
          <section key={day}>
            <div className="day">{dayLabel(day)}</div>
            {items.map((t) => (
              <div className="tx" key={t.id}>
                <div className="avatar"><Art name={t.type === 'topup' ? 'topup' : t.kind === 'metro' ? 'metro' : 'bus'} /></div>
                <div className="body">
                  <div className="t1">{t.title} {t.demo && <DemoBadge />}</div>
                  <div className="t2">{t.subtitle}</div>
                  <div className={`amt ${t.amount > 0 ? 'plus' : ''}`}>{t.amount > 0 ? '+' : '-'} {money(t.amount)} UZS</div>
                </div>
                <div className="side">
                  {new Date(t.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  {t.type === 'ride' && <span className="qr-dot"><Icon name="qr" size={22} /></span>}
                  {t.status === 'pending' && <span className="note">ожидание</span>}
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
      {analytics && <Analytics txs={txs || []} month={month} label={mLabel(month)} onClose={() => setAnalytics(false)} />}
    </>
  );
}

function Analytics({ txs, month, label, onClose }) {
  const inMonth = txs.filter((t) => t.status === 'paid' && monthKey(t.createdAt) === month);
  const rides = inMonth.filter((t) => t.type === 'ride');
  const spent = -rides.reduce((s, t) => s + t.amount, 0);
  const topup = inMonth.filter((t) => t.type === 'topup').reduce((s, t) => s + t.amount, 0);
  const byKind = [['Автобус', rides.filter((t) => t.kind !== 'metro')], ['Метро', rides.filter((t) => t.kind === 'metro')]];
  const byWeekday = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d, i) => [d, rides.filter((t) => (new Date(t.createdAt).getDay() + 6) % 7 === i).length]);
  const maxW = Math.max(1, ...byWeekday.map(([, n]) => n));

  return (
    <Sheet title={`Аналитика: ${label}`} onClose={onClose}>
      <div className="grid2" style={{ marginBottom: 18 }}>
        <div className="list-item" style={{ display: 'block' }}><div className="note">Потрачено на проезд</div><b style={{ fontSize: 22 }}>{money(spent)} UZS</b></div>
        <div className="list-item" style={{ display: 'block' }}><div className="note">Поездок</div><b style={{ fontSize: 22 }}>{rides.length}</b></div>
        <div className="list-item" style={{ display: 'block' }}><div className="note">Пополнено</div><b style={{ fontSize: 22 }}>{money(topup)} UZS</b></div>
        <div className="list-item" style={{ display: 'block' }}><div className="note">Средний чек</div><b style={{ fontSize: 22 }}>{money(rides.length ? Math.round(spent / rides.length) : 0)}</b></div>
      </div>
      <div className="note" style={{ marginBottom: 8 }}>По видам транспорта</div>
      <div className="bars" style={{ marginBottom: 18 }}>
        {byKind.map(([k, list]) => (
          <div className="bar" key={k}><span>{k}</span><div className="track"><div className="fill" style={{ width: `${rides.length ? (list.length / rides.length) * 100 : 0}%` }} /></div><span>{list.length}</span></div>
        ))}
      </div>
      <div className="note" style={{ marginBottom: 8 }}>Поездки по дням недели</div>
      <div className="bars">
        {byWeekday.map(([d, n]) => (
          <div className="bar" key={d}><span>{d}</span><div className="track"><div className="fill" style={{ width: `${(n / maxW) * 100}%` }} /></div><span>{n}</span></div>
        ))}
      </div>
    </Sheet>
  );
}
