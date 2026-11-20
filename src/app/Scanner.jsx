import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { api, money } from '../api.js';
import { Icon } from '../ui/icons.jsx';
import { Sheet, DemoBadge } from '../ui/common.jsx';

export default function Scanner({ me, onClose, refresh }) {
  const video = useRef(null);
  const [qr, setQr] = useState(null);
  const [camError, setCamError] = useState('');
  const [manual, setManual] = useState('');
  const [torch, setTorch] = useState(false);
  const streamRef = useRef(null);

  useEffect(() => {
    if (qr) return;
    let raf, stopped = false;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (stopped) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        video.current.srcObject = stream;
        video.current.play();
        const tick = () => {
          const v = video.current;
          if (v && v.readyState === v.HAVE_ENOUGH_DATA) {
            canvas.width = v.videoWidth; canvas.height = v.videoHeight;
            ctx.drawImage(v, 0, 0);
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
            if (code?.data) { navigator.vibrate?.(60); setQr(code.data); return; }
          }
          raf = requestAnimationFrame(tick);
        };
        tick();
      })
      .catch(() => setCamError('Нет доступа к камере. Введите код с терминала вручную.'));
    if (!navigator.mediaDevices) setCamError('Камера недоступна. Введите код вручную.');

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [qr]);

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    try { await track?.applyConstraints({ advanced: [{ torch: !torch }] }); setTorch(!torch); } catch { /* не поддерживается */ }
  };

  return (
    <div className="scanner">
      <video ref={video} playsInline muted />
      {!camError && <div className="frame" />}
      <div className="top">
        <button className="round-btn" onClick={onClose} aria-label="Закрыть"><Icon name="close" /></button>
        <b style={{ fontSize: 20 }}>QR оплата</b>
        <button className="round-btn" onClick={toggleTorch} aria-label="Фонарик"><Icon name="flash" /></button>
      </div>
      <div className="bottom">
        <div className="hint">{camError || 'Наведите камеру на QR-код в автобусе или метро'}</div>
        <form onSubmit={(e) => { e.preventDefault(); if (manual.trim()) setQr(manual.trim()); }} style={{ display: 'flex', gap: 10 }}>
          <input className="search" style={{ margin: 0, maxWidth: 'none' }} placeholder="Код терминала, напр. bus:route=67" value={manual} onChange={(e) => setManual(e.target.value)} />
          <button className="round-btn" style={{ background: 'var(--accent)', flex: 'none' }} aria-label="Оплатить"><Icon name="check" /></button>
        </form>
      </div>
      {qr && <PaySheet me={me} qr={qr} onCancel={() => setQr(null)} onClose={onClose} refresh={refresh} />}
    </div>
  );
}

function PaySheet({ me, qr, onCancel, onClose, refresh }) {
  const kind = /metro/i.test(qr) ? 'metro' : 'bus';
  const fare = me.fare[kind];
  const [cardId, setCardId] = useState((me.cards.find((c) => c.balance >= fare) || me.cards[0]).id);
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const pay = async () => {
    setBusy(true); setError('');
    try {
      const r = await api.post('/api/rides', { qr, cardId });
      setDone(r.transaction);
      refresh();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  if (done) {
    return (
      <Sheet title="" onClose={onClose}>
        <div className="success">
          <div className="big-check"><Icon name="check" size={44} strokeWidth={3} /></div>
          <div>{done.title} {done.demo && <DemoBadge />}</div>
          <div className="sum">- {money(done.amount)} UZS</div>
          <div className="note">{done.subtitle}<br />{new Date(done.createdAt).toLocaleString('ru-RU')}</div>
          <button className="btn" style={{ marginTop: 20 }} onClick={onClose}>Готово</button>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet title={kind === 'metro' ? 'Оплата проезда в метро' : 'Оплата проезда в автобусе'} onClose={onCancel}>
      <div className="list-item"><span className="grow note">Код</span><b style={{ maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{qr}</b></div>
      <div className="list-item"><span className="grow note">Стоимость</span><b>{money(fare)} UZS</b></div>
      <label className="field"><span>Списать с карты</span>
        <select value={cardId} onChange={(e) => setCardId(e.target.value)}>
          {me.cards.map((c) => <option key={c.id} value={c.id}>{c.title} •••• {c.number.slice(-4)} — {money(c.balance)} UZS</option>)}
        </select>
      </label>
      {error && <div className="error">{error}</div>}
      <button className="btn" onClick={pay} disabled={busy}>Оплатить {money(fare)} UZS</button>
    </Sheet>
  );
}
