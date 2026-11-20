import { Icon } from '../ui/icons.jsx';

export default function Menu({ me, go, notify, logout }) {
  const soon = () => notify('Скоро будет доступно');
  const items = [
    ['cards', 'Мои карты', () => go('cards')],
    ['transfer', 'Перевод средств', soon],
    ['pin', 'Терминалы', soon],
    ['sms', 'СМС - Инфо', soon],
    ['help', 'Вопросы / Ответы', () => go('faq')],
    ['ticket', 'Мои тарифы', () => go('tariffs')],
    ['chat', 'Связаться с нами', () => go('contact')],
    ['sparkle', 'AI ассистент', () => go('assistant')],
  ];
  return (
    <div className="screen">
      <h1 className="page-title">{me.user.name || me.user.phone}</h1>
      <div className="grid2">
        {items.map(([icon, label, onClick]) => (
          <button key={label} className="menu-card" onClick={onClick}>
            <span className="ic"><Icon name={icon} size={22} strokeWidth={2.4} /></span>
            {label}
          </button>
        ))}
      </div>
      <button className="btn danger" style={{ marginTop: 28 }} onClick={logout}><Icon name="logout" size={20} /> Выйти</button>
    </div>
  );
}
