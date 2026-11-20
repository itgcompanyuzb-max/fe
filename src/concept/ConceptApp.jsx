// ATTO uchun taqdimot prototipi (konsept). Faqat ko'rinish: to'lov, QR to'lov,
// to'ldirish va to'langan safarlar tarixi ATAYLAB yo'q — ular ATTO tizimiga ulanganda ishlaydi.
import { useState } from 'react';
import { Icon } from '../ui/icons.jsx';
import { Sheet } from '../ui/common.jsx';

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

const ConceptBadge = () => <span className="demo-badge" style={{ background: '#a5b4fc' }}>КОНЦЕПТ</span>;

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
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}><AttoLogo /><ConceptBadge /></div>
            <button onClick={() => setPage('ai')} aria-label="AI"><Icon name="chat" size={32} /></button>
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
              <button className="wide-tile" onClick={() => setPage('ai')}>
                AI ассистент <span style={{ color: 'var(--accent)', paddingRight: 24 }}><Icon name="sparkle" size={40} /></span>
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
            <div className="tcard">
              <ConceptBadge />
              <div className="bal" style={{ fontSize: 30, marginTop: 8 }}>Баланс карты</div>
              <div className="holder">появится после подключения к ATTO</div>
              <div className="brand">ATTO<small>VIRTUAL</small></div>
              <div className="num"><Icon name="star" size={20} />•••• ••••</div>
            </div>
            <div className="dots"><i className="on" /><i /></div>
            <div className="grid2">
              <button className="pill-btn" onClick={soon('FacePay')}><span><small>Включить</small>FacePay</span><Icon name="face" size={30} /></button>
              <button className="pill-btn" onClick={soon('PalmPay')}><span><small>Включить</small>PalmPay</span><Icon name="palm" size={30} /></button>
              <button className="action violet" onClick={soon('Пополнение карты')}><span className="ic"><Icon name="plus" size={22} strokeWidth={3} /></span>Пополнить карту</button>
              <button className="action green" onClick={soon('Покупка тарифа')}><span className="ic"><Icon name="ticket" size={22} /></span>Купить тариф</button>
            </div>
            <button className="wide-action" onClick={() => setPage('ai')}>
              <span style={{ color: 'var(--accent)' }}><Icon name="sparkle" size={36} /></span>
              <div style={{ marginTop: 14 }}>AI подбор тарифа<small>новое: персональная рекомендация</small></div>
            </button>
          </div>
        </>
      )}

      {page === 'history' && (
        <>
          <div className="hist-head">
            <h1>История</h1>
            <button className="grad-btn" onClick={() => setPage('ai')}>Аналитика <Icon name="sparkle" size={22} /></button>
          </div>
          <div className="screen">
            <div className="empty">
              <img src={img('transport_bus')} alt="" style={{ width: 120, borderRadius: 22, marginBottom: 12 }} />
              <div>Операции появятся после подключения к ATTO.</div>
              <p className="note">Новое в концепте: группировка по дням, фильтры, экспорт и AI-аналитика расходов.</p>
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
            <button className="menu-card" onClick={() => setPage('ai')}>
              <span className="ic" style={{ background: 'var(--accent)' }}><Icon name="sparkle" size={22} /></span>AI ассистент
            </button>
          </div>
        </div>
      )}

      {page === 'ai' && (
        <>
          <header className="topbar">
            <button className="round-btn" onClick={() => setPage('home')} aria-label="Назад"><Icon name="back" /></button>
            <div className="title">AI ассистент</div><span className="spacer" />
          </header>
          <div className="screen">
            <div className="chat">
              <div className="msg user">Как доехать от Чиланзара до Юнусабада?</div>
              <div className="msg assistant">Быстрее всего на метро: Чиланзарская линия до «Амира Темура хиёбони», пересадка на Юнусабадскую линию. Около 35 минут. (пример ответа)</div>
              <div className="msg user">Какой тариф мне выгоднее?</div>
              <div className="msg assistant">Вы ездите примерно 2 раза в день по будням. Месячный тариф выйдет дешевле, чем разовые поездки. (пример ответа)</div>
            </div>
            <p className="note" style={{ marginTop: 24 }}>Концепт: ассистент видит историю поездок пользователя и отвечает на узбекском и русском.</p>
          </div>
        </>
      )}

      {TABS.some((t) => t.id === page) && (
        <nav className="tabbar">
          {TABS.map((t) => (
            <button key={t.id} className={`tab ${page === t.id ? 'on' : ''}`} onClick={() => setPage(t.id)}>
              <Icon name={t.icon} size={28} />{t.label}
            </button>
          ))}
        </nav>
      )}

      {info && (
        <Sheet title={info} onClose={() => setInfo(null)}>
          <p className="note">Это концепт-прототип. Функция заработает после подключения к платёжной системе ATTO.</p>
          <button className="btn" onClick={() => setInfo(null)}>Понятно</button>
        </Sheet>
      )}
    </div>
  );
}
