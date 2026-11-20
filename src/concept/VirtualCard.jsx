// Yangi dizayndagi virtual karta: ko'kdan yashilga gradient, shisha to'lqinlar.
// Balans ATTO serveridan kelmaydi (bizda API yo'q), shuning uchun "—" ko'rsatiladi.
export default function VirtualCard({ balance = '—', holder = 'aau', number = '0000 0000 0000 0000', onEdit }) {
  return (
    <div className="vcard">
      <svg className="vcard-waves" viewBox="0 0 340 170" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="vw1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset=".6" stopColor="#bff6ff" stopOpacity=".55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 125 C 90 95, 170 92, 230 62 S 300 6, 315 0 L 340 0 L 340 170 L 0 170 Z" fill="#fff" opacity=".06" />
        <path d="M110 170 C 150 120, 220 98, 340 88 L 340 170 Z" fill="#fff" opacity=".07" />
        <path d="M0 125 C 90 95, 170 92, 230 62 S 300 6, 315 0" fill="none" stroke="url(#vw1)" strokeWidth="1.2" />
        <path d="M110 170 C 150 120, 220 98, 340 88" fill="none" stroke="url(#vw1)" strokeWidth="1" />
      </svg>
      <div className="vcard-bal">{balance}<small>UZS</small></div>
      <div className="vcard-holder">{holder}</div>
      <div className="vcard-brand">ATTO<small>VIRTUAL</small></div>
      <div className="vcard-num">
        <img src="/concept/ic/star.png" alt="" width="22" height="22" />
        {number}
      </div>
      {onEdit && <button className="vcard-edit" onClick={onEdit} aria-label="Изменить карту">✎</button>}
    </div>
  );
}
