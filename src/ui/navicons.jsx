// Pastki navigatsiya uchun to'ldirilgan (filled) ikonkalar, 28x28.
const ICONS = {
  home: (
    <path d="M12.6 3.4a2.2 2.2 0 0 1 2.8 0l8.2 6.9c.6.5.9 1.2.9 2V22a2.5 2.5 0 0 1-2.5 2.5h-3.6a1.2 1.2 0 0 1-1.2-1.2V18a2.5 2.5 0 0 0-2.5-2.5h-1.4a2.5 2.5 0 0 0-2.5 2.5v5.3c0 .7-.5 1.2-1.2 1.2H6a2.5 2.5 0 0 1-2.5-2.5v-9.7c0-.8.3-1.5.9-2z" />
  ),
  history: (
    <>
      <path fillRule="evenodd" d="M7 4.5h11.2a5.6 5.6 0 0 0 5.3 5.3V20a3.5 3.5 0 0 1-3.5 3.5H7A3.5 3.5 0 0 1 3.5 20V8A3.5 3.5 0 0 1 7 4.5zm1.4 13.4a1 1 0 0 0 1.4.2l3.4-2.7 2.3 1.8a1 1 0 0 0 1.4-.2l3.3-4.6a1 1 0 1 0-1.6-1.2l-2.7 3.8-2.2-1.7a1 1 0 0 0-1.3 0l-4 3.2a1 1 0 0 0 0 1.4z" />
      <circle cx="23.2" cy="4.8" r="2.6" />
    </>
  ),
  bus: (
    <path fillRule="evenodd" d="M8 2.5h12A3.5 3.5 0 0 1 23.5 6v14a2.5 2.5 0 0 1-1.5 2.3V24a1.5 1.5 0 0 1-3 0v-1.5H9V24a1.5 1.5 0 0 1-3 0v-1.7A2.5 2.5 0 0 1 4.5 20V6A3.5 3.5 0 0 1 8 2.5zM10 5a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2zM7 9.5V13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1zm2 7.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm10 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM2 8.5a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1zm24 0a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1z" />
  ),
  grid: (
    <>
      <rect x="3" y="3" width="10" height="10" rx="3.5" />
      <rect x="15" y="3" width="10" height="10" rx="3.5" />
      <rect x="3" y="15" width="10" height="10" rx="3.5" />
      <rect x="15" y="15" width="10" height="10" rx="3.5" />
    </>
  ),
};

export function NavIcon({ name }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="currentColor" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}
