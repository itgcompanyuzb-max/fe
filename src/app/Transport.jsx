import { useRef, useState } from 'react';
import { Icon } from '../ui/icons.jsx';
import { TopBar, DemoBadge } from '../ui/common.jsx';
import { cardNum, money } from '../api.js';
import { TopUpSheet, AddCardSheet } from './Sheets.jsx';

export function TransportCard({ card, me }) {
  return (
    <div className={`tcard ${card.kind}`}>
      {me.demo && <DemoBadge />}
      <div className="bal">{money(card.balance)}<small>UZS</small></div>
      <div className="holder">{me.user.name || card.title}</div>
      <div className="brand">TRANSIT<small>{card.kind === 'virtual' ? 'VIRTUAL' : card.title.toUpperCase()}</small></div>
      <div className="num">{card.kind === 'virtual' && <Icon name="star" size={20} />}{cardNum(card.number)}</div>
    </div>
  );
}

export default function Transport(ctx) {
  const { me, back, go, notify, openScanner, refresh } = ctx;
  const [idx, setIdx] = useState(0);
  const [sheet, setSheet] = useState(null);
  const slider = useRef(null);
  const cards = me.cards;
  const current = cards[Math.min(idx, cards.length - 1)];

  const onScroll = () => {
    const el = slider.current;
    setIdx(Math.round(el.scrollLeft / (el.clientWidth - 28)));
  };

  return (
    <>
      <TopBar title="Транспорт" onBack={back} />
      <div className="screen">
        <div className="cards-slider" ref={slider} onScroll={onScroll}>
          {cards.map((c) => <TransportCard key={c.id} card={c} me={me} />)}
          <button className="tcard add" onClick={() => setSheet('add')}>
            <div style={{ textAlign: 'center' }}><Icon name="plus" size={36} /><div style={{ marginTop: 8 }}>Добавить карту</div></div>
          </button>
        </div>
        <div className="dots">
          {[...cards, null].map((_, i) => <i key={i} className={i === idx ? 'on' : ''} />)}
        </div>

        <div className="grid2">
          <button className="pill-btn" onClick={() => notify('FacePay скоро будет доступен')}>
            <span><small>Включить</small>FacePay</span><Icon name="face" size={30} />
          </button>
          <button className="pill-btn" onClick={() => notify('PalmPay скоро будет доступен')}>
            <span><small>Включить</small>PalmPay</span><Icon name="palm" size={30} />
          </button>
          <button className="action violet" onClick={() => setSheet('topup')}>
            <span className="ic"><Icon name="plus" size={22} strokeWidth={3} /></span>
            Пополнить карту
          </button>
          <button className="action green" onClick={() => go('tariffs')}>
            <span className="ic"><Icon name="ticket" size={22} /></span>
            Купить тариф
          </button>
        </div>
        <button className="wide-action" onClick={openScanner}>
          <Icon name="qr" size={36} />
          <div style={{ marginTop: 14 }}>QR Оплата<small>автобус, метро</small></div>
        </button>
      </div>
      {sheet === 'topup' && <TopUpSheet {...ctx} card={current} onClose={() => setSheet(null)} />}
      {sheet === 'add' && <AddCardSheet onClose={() => setSheet(null)} onAdded={() => { refresh(); notify('Карта добавлена'); }} />}
    </>
  );
}
