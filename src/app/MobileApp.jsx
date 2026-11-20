import { useCallback, useEffect, useState } from 'react';
import { api, session } from '../api.js';
import { Icon } from '../ui/icons.jsx';
import { NavIcon } from '../ui/navicons.jsx';
import Login from './Login.jsx';
import Home from './Home.jsx';
import Transport from './Transport.jsx';
import History from './History.jsx';
import Menu from './Menu.jsx';
import Scanner from './Scanner.jsx';
import Assistant from './Assistant.jsx';
import { CardsPage, TariffsPage, FaqPage, ContactPage } from './Pages.jsx';

const TABS = [
  { id: 'home', label: 'Главная', icon: 'home' },
  { id: 'history', label: 'История', icon: 'history' },
  { id: 'transport', label: 'Транспорт', icon: 'bus' },
  { id: 'menu', label: 'Меню', icon: 'grid' },
];

export default function MobileApp() {
  const [authed, setAuthed] = useState(!!session.get());
  const [me, setMe] = useState(null);
  const [stack, setStack] = useState(['home']);
  const [scanning, setScanning] = useState(false);
  const [toast, setToast] = useState('');

  const page = stack.at(-1);
  const go = (p) => setStack((s) => [...s, p]);
  const tab = (p) => setStack([p]);
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : ['home']));
  const notify = useCallback((t) => { setToast(t); setTimeout(() => setToast(''), 2200); }, []);

  const refresh = useCallback(async () => {
    try { setMe(await api.get('/api/me')); }
    catch (e) { if (e.status === 401) { session.set(null); setAuthed(false); } }
  }, []);

  useEffect(() => { if (authed) refresh(); }, [authed, refresh]);

  if (!authed) return <div className="phone"><Login onDone={() => setAuthed(true)} /></div>;
  if (!me) return <div className="phone"><div className="empty">Загрузка…</div></div>;

  const logout = () => { session.set(null); setAuthed(false); setMe(null); setStack(['home']); };
  const ctx = { me, refresh, go, back, tab, notify, openScanner: () => setScanning(true), logout };
  const showTabs = TABS.some((t) => t.id === page);

  const pages = {
    home: <Home {...ctx} />,
    transport: <Transport {...ctx} />,
    history: <History {...ctx} />,
    menu: <Menu {...ctx} />,
    assistant: <Assistant {...ctx} />,
    cards: <CardsPage {...ctx} />,
    tariffs: <TariffsPage {...ctx} />,
    faq: <FaqPage {...ctx} />,
    contact: <ContactPage {...ctx} />,
  };

  return (
    <div className="phone">
      {pages[page]}
      {showTabs && (
        <nav className="tabbar">
          {TABS.map((t) => (
            <button key={t.id} className={`tab ${page === t.id ? 'on' : ''}`} onClick={() => tab(t.id)}>
              <NavIcon name={t.icon} />
              {t.label}
            </button>
          ))}
        </nav>
      )}
      {scanning && <Scanner {...ctx} onClose={() => setScanning(false)} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
