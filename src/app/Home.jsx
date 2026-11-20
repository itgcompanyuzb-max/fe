import { Icon } from '../ui/icons.jsx';
import { Art } from '../ui/art.jsx';
import { Logo, DemoBadge } from '../ui/common.jsx';

function Tile({ art, label, onClick, className = '' }) {
  return (
    <button className={`tile ${className}`} onClick={onClick}>
      <div className="pic"><Art name={art} /></div>
      {label}
    </button>
  );
}

export default function Home({ me, go, tab, notify, openScanner }) {
  const soon = () => notify('Скоро будет доступно');
  return (
    <>
      <header className="topbar">
        <button onClick={() => tab('menu')} aria-label="Меню"><Icon name="menu" size={32} /></button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
          <Logo />
          {me.demo && <DemoBadge />}
        </div>
        <button onClick={() => go('assistant')} aria-label="AI ассистент" style={{ position: 'relative' }}>
          <Icon name="chat" size={32} />
          <span style={{ position: 'absolute', right: -4, top: -4, color: 'var(--accent)' }}><Icon name="sparkle" size={16} /></span>
        </button>
      </header>
      <div className="screen">
        <div className="panel">
          <div className="tiles-top">
            <Tile className="big" art="bus" label="Транспорт" onClick={() => go('transport')} />
            <div className="side">
              <Tile art="metro" label="Билеты" onClick={soon} />
              <Tile art="scooter" label="Самокаты" onClick={soon} />
            </div>
          </div>
          <div className="tiles-3">
            <Tile art="fuel" label="Топливная карта" onClick={soon} />
            <Tile art="cinema" label="Билеты в кино" onClick={soon} />
            <Tile art="tv" label="Кино и ТВ" onClick={soon} />
          </div>
          <button className="wide-tile" onClick={openScanner}>
            QR оплата
            <div className="pic"><Art name="qr" /></div>
          </button>
          <div className="hscroll">
            <Tile art="parking" label="Парковки" onClick={soon} />
            <Tile art="tree" label="Зеленый билет" onClick={soon} />
            <Tile art="sim" label="eSIM" onClick={soon} />
            <Tile art="watch" label="Запястье" onClick={soon} />
          </div>
        </div>
      </div>
    </>
  );
}
