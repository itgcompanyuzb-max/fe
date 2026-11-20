import { useCallback, useEffect, useState } from 'react';
import { adminApi, session, money, cardNum } from '../api.js';
import { Icon } from '../ui/icons.jsx';
import { Logo } from '../ui/common.jsx';

const NAV = [
  ['dashboard', 'Boshqaruv paneli', 'chart'],
  ['users', 'Mijozlar', 'users'],
  ['transactions', 'Tranzaksiyalar', 'history'],
  ['payment', "To'lov API", 'wallet'],
  ['telegram', 'Telegram Gateway', 'telegram'],
];

const fmt = (iso) => new Date(iso).toLocaleString('uz-UZ', { dateStyle: 'short', timeStyle: 'short' });
const statusTag = (s) => <span className={`tag ${s === 'paid' ? 'ok' : s === 'pending' ? 'warn' : 'bad'}`}>{{ paid: "to'langan", pending: 'kutilmoqda', failed: 'xato' }[s] || s}</span>;

export default function AdminApp() {
  const [authed, setAuthed] = useState(!!session.getAdmin());
  const [tab, setTab] = useState('dashboard');
  const logout = () => { session.setAdmin(null); setAuthed(false); };
  const onError = useCallback((e) => { if (e.status === 401) { session.setAdmin(null); setAuthed(false); } else alert(e.message); }, []);

  if (!authed) return <AdminLogin onDone={() => setAuthed(true)} />;
  const props = { onError };
  return (
    <div className="admin">
      <aside>
        <div className="logo"><Logo size={24} /><span>admin</span></div>
        {NAV.map(([id, label, icon]) => (
          <button key={id} className={`nav-item ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}><Icon name={icon} size={20} />{label}</button>
        ))}
        <button className="nav-item" style={{ marginTop: 'auto' }} onClick={logout}><Icon name="logout" size={20} />Chiqish</button>
      </aside>
      <main>
        {tab === 'dashboard' && <Dashboard {...props} />}
        {tab === 'users' && <Users {...props} />}
        {tab === 'transactions' && <Transactions {...props} />}
        {tab === 'payment' && <PaymentSettings {...props} />}
        {tab === 'telegram' && <TelegramSettings {...props} />}
      </main>
    </div>
  );
}

function AdminLogin({ onDone }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try { const r = await adminApi.post('/api/admin/login', { password }); session.setAdmin(r.token); onDone(); }
    catch (err) { setError(err.message); }
  };
  return (
    <form className="login" onSubmit={submit}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}><Logo size={36} /></div>
      <label className="field"><span>Admin paroli</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus /></label>
      {error && <div className="error">{error}</div>}
      <button className="btn"><Icon name="lock" size={20} />Kirish</button>
    </form>
  );
}

function useLoad(url, onError) {
  const [data, setData] = useState(null);
  const load = useCallback(() => adminApi.get(url).then(setData).catch(onError), [url, onError]);
  useEffect(() => { load(); }, [load]);
  return [data, load];
}

function Dashboard({ onError }) {
  const [s] = useLoad('/api/admin/stats', onError);
  const [tx] = useLoad('/api/admin/transactions', onError);
  if (!s) return null;
  const items = [
    ['users', 'Mijozlar', s.users],
    ['cards', 'Kartalar', s.cards],
    ['bus', 'Jami safarlar', s.rides],
    ['flash', 'Bugungi safarlar', s.ridesToday],
    ['wallet', "To'ldirishlar", `${money(s.topupSum)} UZS`],
    ['ticket', "Yo'l haqi tushumi", `${money(s.rideSum)} UZS`],
  ];
  return (
    <>
      <h2>Boshqaruv paneli</h2>
      <div className="row" style={{ marginBottom: 18 }}>
        <span className={`tag ${s.demo ? 'warn' : 'ok'}`}>To'lov: {s.demo ? 'DEMO rejim' : 'ulangan'}</span>
        <span className={`tag ${s.telegram ? 'ok' : 'warn'}`}>Telegram Gateway: {s.telegram ? 'ulangan' : "ulanmagan (demo kod)"}</span>
      </div>
      <div className="stats">
        {items.map(([icon, k, v]) => <div className="stat" key={k}><div className="k"><Icon name={icon} size={16} />{k}</div><div className="v">{v}</div></div>)}
      </div>
      <div className="box">
        <h3>So'nggi tranzaksiyalar</h3>
        <TxTable rows={(tx?.transactions || []).slice(0, 10)} showPhone />
      </div>
    </>
  );
}

function TxTable({ rows, showPhone }) {
  if (!rows.length) return <p className="note">Hozircha tranzaksiyalar yo'q.</p>;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead><tr><th>Vaqt</th>{showPhone && <th>Mijoz</th>}<th>Turi</th><th>Tavsif</th><th>Summa</th><th>Holat</th></tr></thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id}>
              <td>{fmt(t.createdAt)}</td>
              {showPhone && <td>{t.phone}</td>}
              <td>{t.type === 'ride' ? (t.kind === 'metro' ? 'Metro' : 'Avtobus') : "To'ldirish"}</td>
              <td>{t.subtitle}{t.demo && <> <span className="tag warn">DEMO</span></>}</td>
              <td style={{ color: t.amount > 0 ? '#4ade80' : undefined }}>{t.amount > 0 ? '+' : '-'}{money(t.amount)}</td>
              <td>{statusTag(t.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Users({ onError }) {
  const [data, reload] = useLoad('/api/admin/users', onError);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const users = (data?.users || []).filter((u) => !q || u.phone.includes(q) || (u.name || '').toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <h2>Mijozlar <span className="note">({data?.users.length ?? 0})</span></h2>
      <input className="search" placeholder="Telefon yoki ism bo'yicha qidirish" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="box" style={{ padding: 0, overflowX: 'auto' }}>
        <table>
          <thead><tr><th>Telefon</th><th>Ism</th><th>Kartalar</th><th>Balans</th><th>Safarlar</th><th>Ro'yxatdan o'tgan</th><th>Oxirgi faollik</th><th>Holat</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="click" onClick={() => setOpen(u.id)}>
                <td>{u.phone}</td><td>{u.name || '—'}</td><td>{u.cards}</td><td>{money(u.balance)} UZS</td><td>{u.rides}</td>
                <td>{fmt(u.createdAt)}</td><td>{fmt(u.lastActivity)}</td>
                <td>{u.blocked ? <span className="tag bad">bloklangan</span> : <span className="tag ok">faol</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && <p className="note" style={{ padding: 20 }}>Mijozlar topilmadi.</p>}
      </div>
      {open && <UserDrawer id={open} onClose={() => setOpen(null)} onChanged={reload} onError={onError} />}
    </>
  );
}

function UserDrawer({ id, onClose, onChanged, onError }) {
  const [d, reload] = useLoad(`/api/admin/users/${id}`, onError);
  if (!d) return null;
  const toggle = async () => {
    try { await adminApi.post(`/api/admin/users/${id}/block`, { blocked: !d.user.blocked }); reload(); onChanged(); } catch (e) { onError(e); }
  };
  return (
    <div className="drawer">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ margin: 0 }}>{d.user.name || d.user.phone}</h2>
        <button onClick={onClose} aria-label="Yopish"><Icon name="close" /></button>
      </div>
      <div className="box">
        <div className="note">Telefon: <b style={{ color: '#fff' }}>{d.user.phone}</b></div>
        <div className="note">ID: <code>{d.user.id}</code></div>
        <div className="note">Ro'yxatdan o'tgan: {fmt(d.user.createdAt)}</div>
        <button className={`btn ${d.user.blocked ? '' : 'danger'}`} style={{ marginTop: 14 }} onClick={toggle}>
          {d.user.blocked ? 'Blokdan chiqarish' : 'Bloklash'}
        </button>
      </div>
      <div className="box">
        <h3>Kartalar</h3>
        {d.cards.map((c) => (
          <div className="list-item" key={c.id}><Icon name="cards" /><span className="grow">{c.title}<div className="note">{cardNum(c.number)}</div></span><b>{money(c.balance)} UZS</b></div>
        ))}
      </div>
      <div className="box"><h3>Tranzaksiyalar</h3><TxTable rows={d.transactions} /></div>
    </div>
  );
}

function Transactions({ onError }) {
  const [data, reload] = useLoad('/api/admin/transactions', onError);
  const [type, setType] = useState('all');
  const rows = (data?.transactions || []).filter((t) => type === 'all' || t.type === type);
  return (
    <>
      <h2>Tranzaksiyalar</h2>
      <div className="row" style={{ marginBottom: 14 }}>
        <select className="search" style={{ maxWidth: 220, margin: 0 }} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">Barchasi</option><option value="ride">Safarlar</option><option value="topup">To'ldirishlar</option>
        </select>
        <button className="btn ghost" onClick={reload}><Icon name="refresh" size={18} />Yangilash</button>
      </div>
      <div className="box"><TxTable rows={rows} showPhone /></div>
    </>
  );
}

function useSettings(onError) {
  const [s, reload] = useLoad('/api/admin/settings', onError);
  const saveSettings = async (patch) => {
    try { await adminApi.put('/api/admin/settings', patch); await reload(); alert('Saqlandi'); } catch (e) { onError(e); }
  };
  return [s, saveSettings];
}

function PaymentSettings({ onError }) {
  const [s, saveSettings] = useSettings(onError);
  const [f, setF] = useState(null);
  useEffect(() => { if (s) setF({ ...s.payment, fare: { ...s.payment.fare } }); }, [s]);
  if (!f) return null;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <>
      <h2>To'lov API</h2>
      <div className="box">
        <h3><Icon name="wallet" />Provayder</h3>
        <div className="row">
          <label className="field"><span>Rejim</span>
            <select value={f.provider} onChange={set('provider')}>
              <option value="demo">Demo (haqiqiy pul yo'q)</option>
              <option value="http">HTTP API (to'lov provayderi)</option>
            </select>
          </label>
          <label className="field"><span>Merchant ID</span><input value={f.merchantId} onChange={set('merchantId')} /></label>
        </div>
        {f.provider === 'http' && (
          <div className="row">
            <label className="field"><span>API URL (to'lov yaratish)</span><input value={f.apiUrl} onChange={set('apiUrl')} placeholder="https://pay.example.uz/api/checkout" /></label>
            <label className="field"><span>Maxfiy kalit (HMAC){s.payment.secretFromEnv && ' — muhit o\'zgaruvchisidan'}</span>
              <input type="password" value={f.secretKey} onChange={set('secretKey')} placeholder="yangi kalit kiriting" disabled={s.payment.secretFromEnv} /></label>
          </div>
        )}
        <p className="note">
          Server <code>POST {'{apiUrl}'}</code> ga <code>{'{ merchantId, orderId, amount, currency, phone, callbackUrl }'}</code> yuboradi
          (sarlavha <code>X-Signature</code> = HMAC-SHA256). Provayder <code>{'{ checkoutUrl }'}</code> qaytaradi va natijani
          <code>{s.webhookUrl}</code> ga <code>{'{ orderId, status: "paid" | "failed" }'}</code> ko'rinishida, xuddi shu imzo bilan yuboradi.
        </p>
      </div>
      <div className="box">
        <h3><Icon name="ticket" />Yo'l haqi</h3>
        <div className="row">
          <label className="field"><span>Avtobus, UZS</span><input inputMode="numeric" value={f.fare.bus} onChange={(e) => setF({ ...f, fare: { ...f.fare, bus: e.target.value } })} /></label>
          <label className="field"><span>Metro, UZS</span><input inputMode="numeric" value={f.fare.metro} onChange={(e) => setF({ ...f, fare: { ...f.fare, metro: e.target.value } })} /></label>
        </div>
      </div>
      <button className="btn" onClick={() => saveSettings({ payment: f })}><Icon name="check" size={18} />Saqlash</button>
    </>
  );
}

function TelegramSettings({ onError }) {
  const [s, saveSettings] = useSettings(onError);
  const [f, setF] = useState(null);
  const [phone, setPhone] = useState('+998');
  const [test, setTest] = useState(null);
  useEffect(() => { if (s) setF({ ...s.telegram }); }, [s]);
  if (!f) return null;
  const runTest = async () => {
    setTest('…');
    try { const r = await adminApi.post('/api/admin/telegram/test', { phone }); setTest(JSON.stringify(r.result, null, 2)); }
    catch (e) { setTest(`Xato: ${e.message}`); }
  };
  return (
    <>
      <h2>Telegram Gateway</h2>
      <div className="box">
        <h3><Icon name="telegram" />Tasdiqlash kodlari (OTP)</h3>
        <p className="note">Mijozlar ilovaga telefon raqam bilan kiradi, kod Telegram orqali keladi. Token: <code>gateway.telegram.org</code> → hisob → API token.</p>
        <label className="switch"><input type="checkbox" checked={f.enabled} onChange={(e) => setF({ ...f, enabled: e.target.checked })} />Telegram Gateway yoqilgan</label>
        <div className="row">
          <label className="field"><span>API token{s.telegram.tokenFromEnv && ' — muhit o\'zgaruvchisidan'}</span>
            <input type="password" value={f.token} onChange={(e) => setF({ ...f, token: e.target.value })} placeholder="yangi token kiriting" disabled={s.telegram.tokenFromEnv} /></label>
          <label className="field" style={{ maxWidth: 160, minWidth: 120 }}><span>Kod uzunligi</span><input inputMode="numeric" value={f.codeLength} onChange={(e) => setF({ ...f, codeLength: e.target.value })} /></label>
          <label className="field" style={{ maxWidth: 160, minWidth: 120 }}><span>Amal qilish (soniya)</span><input inputMode="numeric" value={f.ttl} onChange={(e) => setF({ ...f, ttl: e.target.value })} /></label>
        </div>
        <button className="btn" onClick={() => saveSettings({ telegram: f })}><Icon name="check" size={18} />Saqlash</button>
      </div>
      <div className="box">
        <h3>Ulanishni tekshirish</h3>
        <p className="note"><code>checkSendAbility</code> — raqamga kod yuborish mumkinligini tekshiradi (xabar yuborilmaydi).</p>
        <div className="row">
          <label className="field"><span>Telefon</span><input value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
          <button className="btn ghost" onClick={runTest}>Tekshirish</button>
        </div>
        {test && <pre className="note" style={{ whiteSpace: 'pre-wrap' }}>{test}</pre>}
      </div>
    </>
  );
}
