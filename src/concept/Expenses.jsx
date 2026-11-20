// Shaxsiy xarajat hisoblagichi (konsept). Foydalanuvchi haqiqiy ATTO ilovasida
// to'lagandan SO'NG, bu yerga o'zi qo'lda yozib qo'yadi va qancha sarflayotganini ko'radi.
// Bu to'lov EMAS va chek EMAS — faqat shaxsiy daftar. ATTO serveriga ulanmaydi.
import { useMemo, useState } from 'react';
import { Sheet } from '../ui/common.jsx';

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const money = (n) => Math.abs(n).toLocaleString('ru-RU').replace(/,/g, ' ');
const load = () => { try { return JSON.parse(localStorage.getItem('concept.expenses')) || []; } catch { return []; } };
const store = (x) => { try { localStorage.setItem('concept.expenses', JSON.stringify(x)); } catch { /* ignore */ } };

function dayLabel(key) {
  const d = new Date(key + 'T00:00');
  const today = new Date().toLocaleDateString('sv-SE');
  const yest = new Date(Date.now() - 864e5).toLocaleDateString('sv-SE');
  const l = `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  if (key === today) return `Сегодня, ${l}`;
  if (key === yest) return `Вчера, ${l}`;
  return l;
}

export default function Expenses() {
  const [items, setItems] = useState(load);
  const [adding, setAdding] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const save = (list) => { setItems(list); store(list); };
  const add = (e) => { save([...items, e].sort((a, b) => b.at.localeCompare(a.at))); setAdding(false); };
  const del = (id) => save(items.filter((x) => x.id !== id));

  const groups = useMemo(() => {
    const g = new Map();
    for (const t of items) {
      const k = t.at.slice(0, 10);
      if (!g.has(k)) g.set(k, []);
      g.get(k).push(t);
    }
    return [...g];
  }, [items]);

  const month = new Date().toISOString().slice(0, 7);
  const thisMonth = items.filter((t) => t.at.startsWith(month));
  const spent = thisMonth.reduce((s, t) => s + t.amount, 0);

  return (
    <>
      <div className="hist-head">
        <h1>Расходы</h1>
        <button className="grad-btn" onClick={() => setShowStats(true)}>Аналитика</button>
      </div>
      <div className="screen" style={{ paddingTop: 0 }}>
        <div className="list-item" style={{ background: 'var(--surface-2)', display: 'block', marginBottom: 14 }}>
          <div className="note">Потрачено в {MONTHS[Number(month.slice(5)) - 1].toLowerCase()}</div>
          <b style={{ fontSize: 26 }}>{money(spent)} UZS</b>
          <div className="note" style={{ marginTop: 4 }}>{thisMonth.length} поездок · личный учёт</div>
        </div>

        {!items.length && (
          <p className="note" style={{ textAlign: 'center', padding: '30px 10px' }}>
            Записей пока нет. После оплаты в приложении ATTO добавьте поездку сюда, чтобы следить за расходами.
          </p>
        )}

        {groups.map(([day, list]) => (
          <section key={day}>
            <div className="day">{dayLabel(day)}</div>
            {list.map((t) => (
              <div className="tx" key={t.id}>
                <div className="avatar" style={{ display: 'grid', placeItems: 'center', fontSize: 24 }}>{t.kind === 'metro' ? '🚇' : '🚌'}</div>
                <div className="body">
                  <div className="t1">{t.kind === 'metro' ? 'Метро' : 'Автобус'}{t.route ? ` № ${t.route}` : ''}</div>
                  <div className="t2">Личная запись</div>
                  <div className="amt">- {money(t.amount)} UZS</div>
                </div>
                <button className="side" onClick={() => del(t.id)} style={{ color: 'var(--danger)' }} aria-label="Удалить">✕</button>
              </div>
            ))}
          </section>
        ))}

        <button className="btn" style={{ marginTop: 20 }} onClick={() => setAdding(true)}>+ Добавить поездку</button>
      </div>

      {adding && <AddExpense onAdd={add} onClose={() => setAdding(false)} />}
      {showStats && <Stats items={thisMonth} onClose={() => setShowStats(false)} />}
    </>
  );
}

function AddExpense({ onAdd, onClose }) {
  const [kind, setKind] = useState('bus');
  const [amount, setAmount] = useState('2500');
  const [route, setRoute] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  return (
    <Sheet title="Добавить поездку" onClose={onClose}>
      <label className="field"><span>Вид транспорта</span>
        <select value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="bus">Автобус</option><option value="metro">Метро</option>
        </select>
      </label>
      <label className="field"><span>Сумма, UZS</span>
        <input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} />
      </label>
      <label className="field"><span>Маршрут (необязательно)</span>
        <input value={route} onChange={(e) => setRoute(e.target.value.slice(0, 10))} placeholder="101" />
      </label>
      <label className="field"><span>Дата</span>
        <input type="date" value={date} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} />
      </label>
      <p className="note">Это ваш личный учёт расходов, а не оплата. Оплата проезда проходит в приложении ATTO.</p>
      <button className="btn" disabled={!amount} onClick={() => onAdd({
        id: Math.random().toString(36).slice(2), kind, amount: Number(amount), route: route.trim(),
        at: `${date}T${new Date().toTimeString().slice(0, 8)}`,
      })}>Сохранить</button>
    </Sheet>
  );
}

function Stats({ items, onClose }) {
  const spent = items.reduce((s, t) => s + t.amount, 0);
  const bus = items.filter((t) => t.kind !== 'metro');
  const metro = items.filter((t) => t.kind === 'metro');
  const avg = items.length ? Math.round(spent / items.length) : 0;
  const byWeekday = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d, i) => [d, items.filter((t) => (new Date(t.at).getDay() + 6) % 7 === i).length]);
  const maxW = Math.max(1, ...byWeekday.map(([, n]) => n));
  const row = (k, l) => (
    <div className="bar"><span>{k}</span><div className="track"><div className="fill" style={{ width: `${items.length ? (l / items.length) * 100 : 0}%` }} /></div><span>{l}</span></div>
  );
  return (
    <Sheet title="Аналитика расходов" onClose={onClose}>
      <div className="grid2" style={{ marginBottom: 18 }}>
        <div className="list-item" style={{ display: 'block' }}><div className="note">Потрачено</div><b style={{ fontSize: 22 }}>{money(spent)}</b></div>
        <div className="list-item" style={{ display: 'block' }}><div className="note">Поездок</div><b style={{ fontSize: 22 }}>{items.length}</b></div>
        <div className="list-item" style={{ display: 'block' }}><div className="note">Средний чек</div><b style={{ fontSize: 22 }}>{money(avg)}</b></div>
        <div className="list-item" style={{ display: 'block' }}><div className="note">Автобус / Метро</div><b style={{ fontSize: 22 }}>{bus.length} / {metro.length}</b></div>
      </div>
      <div className="note" style={{ marginBottom: 8 }}>Поездки по дням недели</div>
      <div className="bars">{byWeekday.map(([d, n]) => row(d, n))}</div>
    </Sheet>
  );
}
