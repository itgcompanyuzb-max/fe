import { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import { Icon } from '../ui/icons.jsx';
import { TopBar } from '../ui/common.jsx';

const SUGGEST = [
  'Сколько я потратил на проезд в этом месяце?',
  'Какой тариф мне выгоднее?',
  'Как пополнить карту?',
  "Chilonzordan Yunusobodga qanday boraman?",
];

export default function Assistant({ back }) {
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef(null);

  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, busy]);

  const send = async (content) => {
    if (!content.trim() || busy) return;
    const next = [...msgs, { role: 'user', content: content.trim() }];
    setMsgs(next); setText(''); setBusy(true);
    try {
      const r = await api.post('/api/assistant', { messages: next });
      setMsgs([...next, { role: 'assistant', content: r.reply }]);
    } catch (e) {
      setMsgs([...next, { role: 'assistant', content: `⚠ ${e.message}` }]);
    } finally { setBusy(false); }
  };

  return (
    <>
      <TopBar title="AI ассистент" onBack={back} />
      <div className="screen">
        <div className="chat">
          {!msgs.length && (
            <>
              <div className="msg assistant">Здравствуйте! Я помогу с маршрутами, тарифами и расходами на проезд. Можно писать на русском или узбекском.</div>
              <div className="suggest">{SUGGEST.map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}</div>
            </>
          )}
          {msgs.map((m, i) => <div key={i} className={`msg ${m.role}`}>{m.content}</div>)}
          {busy && <div className="msg assistant">…</div>}
          <div ref={end} />
        </div>
      </div>
      <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(text); }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Сообщение" />
        <button aria-label="Отправить" disabled={busy}><Icon name="send" /></button>
      </form>
    </>
  );
}
