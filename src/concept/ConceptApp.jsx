// ATTO uchun taqdimot prototipi. Faqat ko'rinish: to'lov, QR to'lov,
// to'ldirish va to'langan safarlar tarixi ATAYLAB yo'q — ular ATTO tizimiga ulanganda ishlaydi.
import { useState } from 'react';
import { Icon } from '../ui/icons.jsx';
import { NavIcon } from '../ui/navicons.jsx';
import { Sheet } from '../ui/common.jsx';
import VirtualCard from './VirtualCard.jsx';

const img = (n) => `/concept/${n}.png`;

const TABS = [
  { id: 'home', label: 'Главная', icon: 'home' },
  { id: 'history', label: 'История', icon: 'history' },
  { id: 'transport', label: 'Транспорт', icon: 'bus' },
  { id: 'menu', label: 'Меню', icon: 'grid' },
];

function AttoLogo() {
  return <div className="logo" style={{ fontSize: 34 }}>ATT<b style={{ fontSize: '1.05em' }}>O</b></div>;
}

function Tile({ src, label, onClick, className = '' }) {
  return (
    <button className={`tile ${className}`} onClick={onClick}>
      <div className="pic" style={{ padding: 0, overflow: 'hidden' }}>
        <img src={img(src)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      {label}
    </button>
  );
}

export default function ConceptApp() {
  const [page, setPage] = useState('home');
  const [info, setInfo] = useState(null);
  const soon = (title) => () => setInfo(title);

  return (
    <div className="phone">
      {page === 'home' && (
        <>
          <header className="topbar">
            <button onClick={() => setPage('menu')} aria-label="Меню"><Icon name="menu" size={32} /></button>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}><AttoLogo /></div>
            <button onClick={soon('Поддержка')} aria-label="Поддержка"><Icon name="chat" size={32} /></button>
          </header>
          <div className="screen">
            <div className="panel">
              <div className="tiles-top">
                <Tile className="big" src="transport_bus" label="Транспорт" onClick={() => setPage('transport')} />
                <div className="side">
                  <Tile src="train_ticket" label="Билеты" onClick={soon('Билеты')} />
                  <Tile src="scooter" label="Самокаты" onClick={soon('Самокаты')} />
                </div>
              </div>
              <div className="tiles-3">
                <Tile src="fuel_card" label="Топливная карта" onClick={soon('Топливная карта')} />
                <Tile src="cinema_ticket_popcorn" label="Билеты в кино" onClick={soon('Билеты в кино')} />
                <Tile src="tv_movies" label="Кино и ТВ" onClick={soon('Кино и ТВ')} />
              </div>
              <button onClick={soon('QR оплата')} style={{ display: 'block', width: '100%', marginTop: 22 }}>
                <img src={img('qr_payment_banner')} alt="QR оплата" style={{ width: '100%', display: 'block', borderRadius: 'var(--radius)' }} />
              </button>
              <div className="hscroll">
                <Tile src="parking" label="Парковки" onClick={soon('Парковки')} />
                <Tile src="green_ticket_tree" label="Зеленый билет" onClick={soon('Зеленый билет')} />
                <Tile src="esim" label="eSIM" onClick={soon('eSIM')} />
              </div>
            </div>
          </div>
        </>
      )}

      {page === 'transport' && (
        <>
          <header className="topbar">
            <button className="round-btn" onClick={() => setPage('home')} aria-label="Назад"><Icon name="back" /></button>
            <div className="title">Транспорт</div><span className="spacer" />
          </header>
          <div className="screen">
            <VirtualCard />
            <div className="dots"><i className="on" /><i /></div>
            <div className="grid2">
              <button className="pill-btn" onClick={soon('FacePay')}><span><small>Включить</small>FacePay</span><Icon name="face" size={30} /></button>
              <button className="pill-btn" onClick={soon('PalmPay')}><span><small>Включить</small>PalmPay</span><Icon name="palm" size={30} /></button>
              <button className="action violet" onClick={soon('Пополнение карты')}><span className="ic"><Icon name="plus" size={22} strokeWidth={3} /></span>Пополнить карту</button>
              <button className="action green" onClick={soon('Покупка тарифа')}><span className="ic"><Icon name="ticket" size={22} /></span>Купить тариф</button>
            </div>
            <button className="wide-action" onClick={soon('QR Оплата')}>
              <Icon name="qr" size={36} />
              <div style={{ marginTop: 14 }}>QR Оплата<small>автобус, метро</small></div>
            </button>
          </div>
        </>
      )}

      {page === 'history' && (
        <>
          <div className="hist-head">
            <h1>История</h1>
            <button className="grad-btn" onClick={soon('Аналитика')}>Аналитика <Icon name="sparkle" size={22} /></button>
          </div>
          <div className="screen">
            <div className="empty">
              <img src={img('transport_bus')} alt="" style={{ width: 120, borderRadius: 22, marginBottom: 12 }} />
              <div>Операции появятся после подключения к ATTO.</div>
            </div>
          </div>
        </>
      )}

      {page === 'menu' && (
        <div className="screen">
          <h1 className="page-title">Меню</h1>
          <div className="grid2">
            {[
              ['my_cards_icon', 'Мои карты'], ['transfer_icon', 'Перевод средств'],
              ['terminals_icon', 'Терминалы'], ['sms_info_icon', 'СМС - Инфо'],
              ['faq_icon', 'Вопросы / Ответы'], ['my_tariffs_icon', 'Мои тарифы'],
              ['contact_icon', 'Связаться с нами'],
            ].map(([src, label]) => (
              <button key={label} className="menu-card" onClick={soon(label)}>
                <img src={img(src)} alt="" style={{ width: 34, height: 34 }} />{label}
              </button>
            ))}
          </div>
        </div>
      )}

      {TABS.some((t) => t.id === page) && (
        <nav className="tabbar">
          {TABS.map((t) => (
            <button key={t.id} className={`tab ${page === t.id ? 'on' : ''}`} onClick={() => setPage(t.id)}>
              <NavIcon name={t.icon} />{t.label}
            </button>
          ))}
        </nav>
      )}

      {info && (
        <Sheet title={info} onClose={() => setInfo(null)}>
          <p className="note">Функция будет доступна после подключения к платёжной системе ATTO.</p>
          <button className="btn" onClick={() => setInfo(null)}>Понятно</button>
        </Sheet>
      )}
    </div>
  );
}
