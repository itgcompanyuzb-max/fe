import { Icon } from './icons.jsx';

export function Logo({ size }) {
  return <div className="logo" style={size ? { fontSize: size } : undefined}>TRANS<b>IT</b></div>;
}

export function TopBar({ title, onBack, right }) {
  return (
    <header className="topbar">
      {onBack ? <button className="round-btn" onClick={onBack} aria-label="Назад"><Icon name="back" /></button> : <span className="spacer" />}
      <div className="title">{title}</div>
      {right || <span className="spacer" />}
    </header>
  );
}

export function Sheet({ title, onClose, children }) {
  return (
    <div className="sheet-wrap" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <h3>{title}</h3>
          <button onClick={onClose} aria-label="Закрыть"><Icon name="close" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const DemoBadge = () => <span className="demo-badge">DEMO</span>;
