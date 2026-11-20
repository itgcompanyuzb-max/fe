// Yangi dizayndagi virtual karta: ko'kdan yashilga gradient, shisha to'lqinlar.
export default function VirtualCard({ balance = '19 000', holder = 'aau', number = '9987 0000 0000 0000' }) {
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
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9z" fill="#2ee86a" /></svg>
        {number}
      </div>
    </div>
  );
}
