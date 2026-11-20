import { useState } from 'react';
import { api, cardNum, money } from '../api.js';
import { Icon } from '../ui/icons.jsx';
import { TopBar } from '../ui/common.jsx';
import { TransportCard } from './Transport.jsx';
import { AddCardSheet } from './Sheets.jsx';

export function CardsPage({ me, back, refresh, notify }) {
  const [adding, setAdding] = useState(false);
  const remove = async (c) => {
    if (!confirm(`Удалить карту •••• ${c.number.slice(-4)}?`)) return;
    try { await api.del(`/api/cards/${c.id}`); refresh(); notify('Карта удалена'); } catch (e) { notify(e.message); }
  };
  return (
    <>
      <TopBar title="Мои карты" onBack={back} right={<button className="round-btn" onClick={() => setAdding(true)} aria-label="Добавить"><Icon name="plus" /></button>} />
      <div className="screen">
        {me.cards.map((c) => (
          <div key={c.id} style={{ marginBottom: 18 }}>
            <TransportCard card={c} me={me} />
            <div className="list-item" style={{ marginTop: 10 }}>
              <span className="grow">{c.title}<div className="note">{cardNum(c.number)} · {money(c.balance)} UZS</div></span>
              {c.kind !== 'virtual' && <button onClick={() => remove(c)} aria-label="Удалить" style={{ color: 'var(--danger)' }}><Icon name="trash" /></button>}
            </div>
          </div>
        ))}
      </div>
      {adding && <AddCardSheet onClose={() => setAdding(false)} onAdded={() => { refresh(); notify('Карта добавлена'); }} />}
    </>
  );
}

const TARIFFS = [
  { name: 'Разовый', price: null, desc: 'Оплата каждой поездки по QR' },
  { name: 'Дневной', price: 12000, desc: 'Безлимит на автобус и метро на 24 часа' },
  { name: 'Недельный', price: 60000, desc: 'Безлимит на 7 дней' },
  { name: 'Месячный', price: 200000, desc: 'Безлимит на 30 дней' },
];

export function TariffsPage({ me, back, notify }) {
  return (
    <>
      <TopBar title="Тарифы" onBack={back} />
      <div className="screen">
        {TARIFFS.map((t) => (
          <button key={t.name} className="list-item" style={{ width: '100%', textAlign: 'left' }}
            onClick={() => notify(t.price ? 'Покупка тарифов скоро будет доступна' : 'Этот тариф уже активен')}>
            <Icon name="ticket" />
            <span className="grow"><b>{t.name}</b><div className="note">{t.desc}</div></span>
            <b>{t.price ? `${money(t.price)} UZS` : `${money(me.fare.bus)} UZS`}</b>
          </button>
        ))}
      </div>
    </>
  );
}

const FAQ = [
  ['Как оплатить проезд?', 'Откройте «QR оплата», наведите камеру на QR-код в салоне и подтвердите оплату. Поездка сразу появится в «Истории».'],
  ['Как пополнить карту?', 'Транспорт → «Пополнить карту», выберите карту и сумму.'],
  ['Можно ли добавить физическую карту?', 'Да: Меню → Мои карты → «+», введите 16-значный номер.'],
  ['Как войти в приложение?', 'По номеру телефона. Код подтверждения приходит в Telegram.'],
];

export function FaqPage({ back }) {
  const [open, setOpen] = useState(0);
  return (
    <>
      <TopBar title="Вопросы" onBack={back} />
      <div className="screen">
        {FAQ.map(([q, a], i) => (
          <button key={q} className="list-item" style={{ width: '100%', textAlign: 'left', display: 'block' }} onClick={() => setOpen(open === i ? -1 : i)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><b>{q}</b><Icon name="chevronDown" /></div>
            {open === i && <p className="note" style={{ marginBottom: 0 }}>{a}</p>}
          </button>
        ))}
      </div>
    </>
  );
}

export function ContactPage({ back, go }) {
  return (
    <>
      <TopBar title="Связаться с нами" onBack={back} />
      <div className="screen">
        <button className="list-item" style={{ width: '100%', textAlign: 'left' }} onClick={() => go('assistant')}>
          <Icon name="sparkle" /><span className="grow"><b>AI ассистент</b><div className="note">Ответит сразу, 24/7</div></span><Icon name="chevronRight" />
        </button>
        <div className="list-item"><Icon name="telegram" /><span className="grow"><b>Telegram</b><div className="note">Укажите канал поддержки в настройках</div></span></div>
        <div className="list-item"><Icon name="phone" /><span className="grow"><b>Колл-центр</b><div className="note">Укажите номер поддержки</div></span></div>
      </div>
    </>
  );
}
