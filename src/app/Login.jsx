import { useState } from 'react';
import { api, session } from '../api.js';
import { Logo } from '../ui/common.jsx';
import { Art } from '../ui/art.jsx';

export default function Login({ onDone }) {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('+998');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const run = (fn) => async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try { await fn(); } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const send = run(async () => {
    const r = await api.post('/api/auth/send-code', { phone });
    setInfo(r); setStep('code');
  });

  const verify = run(async () => {
    const r = await api.post('/api/auth/verify', { phone, code, name });
    session.set(r.token);
    onDone();
  });

  return (
    <div className="screen no-nav" style={{ paddingTop: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}><Logo size={44} /></div>
      <div style={{ width: 180, height: 180, margin: '24px auto' }}><Art name="bus" /></div>
      {step === 'phone' ? (
        <form onSubmit={send}>
          <label className="field"><span>Номер телефона</span>
            <input inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" autoFocus />
          </label>
          <label className="field"><span>Имя (необязательно)</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" />
          </label>
          {error && <div className="error">{error}</div>}
          <button className="btn" disabled={busy}>Получить код</button>
          <p className="note" style={{ marginTop: 14, textAlign: 'center' }}>Код подтверждения придёт в Telegram</p>
        </form>
      ) : (
        <form onSubmit={verify}>
          <p className="note">
            {info?.via === 'telegram' ? `Код отправлен в Telegram на ${phone}` : 'Telegram Gateway не подключён — демо-код:'}
            {info?.demoCode && <b style={{ color: '#fff', fontSize: 20, marginLeft: 8 }}>{info.demoCode}</b>}
          </p>
          <label className="field"><span>Код</span>
            <input inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} autoFocus maxLength={8} />
          </label>
          {error && <div className="error">{error}</div>}
          <button className="btn" disabled={busy || code.length < 4}>Войти</button>
          <button type="button" className="btn ghost" style={{ marginTop: 10 }} onClick={() => { setStep('phone'); setCode(''); }}>Изменить номер</button>
        </form>
      )}
    </div>
  );
}
