// Yangi dizayndagi virtual karta: ko'kdan yashilga gradient, shisha to'lqinlar, "A" belgisi.
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
      <svg className="vcard-logo" viewBox="0 0 48 48" aria-hidden="true">
        <defs>
          <linearGradient id="vlogo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#bfe9ff" />
          </linearGradient>
        </defs>
        <path d="M24 3c1.6 0 2.9.9 3.6 2.3l15.6 33.5c1.3 2.8-1.6 5.6-4.3 4.2-4.2-2.1-6.8-6-8.9-10.3L24 18.4l-5.5 11.7C14 28 9.6 30.6 7.8 35.6l12.6-30.3C21.1 3.9 22.4 3 24 3z" fill="url(#vlogo)" />
        <path d="M5.2 41.4C7.7 31.3 17.4 25.6 28 27.6c-8 .7-14.4 5.4-18.3 13.1-1 2-3.9 2.6-4.5.7z" fill="#7fd8ff" opacity=".9" />
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
