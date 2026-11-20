import { useId } from 'react';

// Plitkalar uchun yagona uslubdagi illyustratsiyalar (yumshoq 3D: gradient + yorug'lik + soya).
// Hammasi 120x120 viewBox, bir xil yorug'lik yo'nalishi (yuqori-chap) va bir xil palitra.
const C = {
  green: ['#a3f06b', '#3fbf3a'],
  blue: ['#9fd8ff', '#3a86f0'],
  white: ['#ffffff', '#c9d3dd'],
  red: ['#ff7a7a', '#e23a3a'],
  gold: ['#ffe39a', '#e7a93a'],
  dark: ['#4a5866', '#1d2730'],
  brown: ['#b9805a', '#7a4b2e'],
  teal: ['#7ef0d0', '#21a58a'],
};

function Defs({ id }) {
  return (
    <defs>
      {Object.entries(C).map(([k, [a, b]]) => (
        <linearGradient key={k} id={`${id}-${k}`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      ))}
      <radialGradient id={`${id}-shadow`}>
        <stop offset="0" stopColor="#000" stopOpacity=".45" />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

const Shadow = ({ id, y = 104, w = 44 }) => <ellipse cx="60" cy={y} rx={w} ry="7" fill={`url(#${id}-shadow)`} />;
const Gloss = (p) => <path fill="#fff" opacity=".35" {...p} />;

const scenes = {
  bus: (id) => (<>
    <Shadow id={id} y={102} w={50} />
    <rect x="12" y="24" width="96" height="70" rx="16" fill={`url(#${id}-green)`} />
    <rect x="20" y="34" width="80" height="28" rx="6" fill={`url(#${id}-dark)`} />
    <Gloss d="M24 37h30l-10 22H24z" />
    <rect x="12" y="70" width="96" height="6" fill="#2f9a2c" opacity=".6" />
    <rect x="22" y="24" width="40" height="6" rx="3" fill="#ffb347" />
    <circle cx="34" cy="94" r="10" fill="#1d2730" /><circle cx="34" cy="94" r="4" fill="#c9d3dd" />
    <circle cx="86" cy="94" r="10" fill="#1d2730" /><circle cx="86" cy="94" r="4" fill="#c9d3dd" />
    <rect x="18" y="80" width="10" height="6" rx="3" fill="#fff6c2" /><rect x="92" y="80" width="10" height="6" rx="3" fill="#fff6c2" />
  </>),
  metro: (id) => (<>
    <Shadow id={id} />
    <path d="M24 92V44c0-16 14-26 36-26s36 10 36 26v48z" fill={`url(#${id}-white)`} />
    <path d="M30 50c0-12 12-20 30-20s30 8 30 20v8H30z" fill={`url(#${id}-blue)`} />
    <Gloss d="M36 50c2-8 10-13 20-14l-6 18H36z" />
    <rect x="24" y="66" width="72" height="8" fill={`url(#${id}-blue)`} />
    <circle cx="38" cy="82" r="4" fill="#fff6c2" /><circle cx="82" cy="82" r="4" fill="#fff6c2" />
    <path d="M30 92l-8 12M90 92l8 12M28 100h64" stroke="#7a8794" strokeWidth="4" strokeLinecap="round" />
  </>),
  scooter: (id) => (<>
    <Shadow id={id} />
    <path d="M78 22l-12 64" stroke={`url(#${id}-white)`} strokeWidth="8" strokeLinecap="round" />
    <path d="M70 20h18" stroke="#1d2730" strokeWidth="7" strokeLinecap="round" />
    <path d="M30 86h46" stroke={`url(#${id}-green)`} strokeWidth="10" strokeLinecap="round" />
    <circle cx="30" cy="92" r="12" fill="#1d2730" /><circle cx="30" cy="92" r="5" fill="#c9d3dd" />
    <circle cx="86" cy="92" r="12" fill="#1d2730" /><circle cx="86" cy="92" r="5" fill="#c9d3dd" />
    <rect x="71" y="40" width="6" height="16" rx="3" fill="#3fbf3a" transform="rotate(10 74 48)" />
  </>),
  fuel: (id) => (<>
    <Shadow id={id} />
    <g transform="rotate(-14 60 60)">
      <rect x="14" y="30" width="92" height="58" rx="10" fill={`url(#${id}-teal)`} />
      <Gloss d="M14 44c20-10 50-14 92-8v-6a10 10 0 0 0-10-10H24a10 10 0 0 0-10 10z" />
      <rect x="24" y="48" width="16" height="12" rx="3" fill={`url(#${id}-gold)`} />
      <path d="M24 76h40M70 76h20" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".85" />
    </g>
    <path d="M90 56h10v26a4 4 0 0 1-8 0v-8" stroke="#fff" strokeWidth="3" fill="none" opacity=".6" />
  </>),
  cinema: (id) => (<>
    <Shadow id={id} />
    <g transform="rotate(-18 50 50)">
      <path d="M14 30h58v12a6 6 0 0 0 0 12v12H14V54a6 6 0 0 0 0-12z" fill={`url(#${id}-gold)`} />
      <path d="M50 32v34" stroke="#b07a1e" strokeDasharray="3 3" strokeWidth="2" />
    </g>
    <path d="M58 58h40l-6 44H64z" fill={`url(#${id}-white)`} />
    <path d="M66 58l3 44M78 58v44M90 58l-3 44" stroke="#e23a3a" strokeWidth="5" />
    {[[62, 54], [72, 48], [84, 50], [94, 55], [78, 42], [66, 46], [90, 45]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="7" fill="#fff8e6" stroke="#f3dca5" strokeWidth="1.5" />
    ))}
  </>),
  tv: (id) => (<>
    <Shadow id={id} />
    <rect x="10" y="22" width="100" height="66" rx="8" fill={`url(#${id}-dark)`} />
    <rect x="16" y="28" width="88" height="54" rx="4" fill="#2c4a8f" />
    <rect x="22" y="36" width="22" height="38" rx="3" fill={`url(#${id}-blue)`} />
    <rect x="49" y="36" width="22" height="38" rx="3" fill={`url(#${id}-red)`} />
    <rect x="76" y="36" width="22" height="38" rx="3" fill={`url(#${id}-gold)`} />
    <Gloss d="M16 28h40L30 82H16z" opacity=".12" />
    <path d="M44 100h32M60 88v12" stroke="#4a5866" strokeWidth="5" strokeLinecap="round" />
  </>),
  qr: (id) => (<>
    <Shadow id={id} w={40} />
    <rect x="22" y="18" width="76" height="76" rx="14" fill={`url(#${id}-white)`} />
    {[[30, 26], [70, 26], [30, 66]].map(([x, y], i) => (
      <g key={i}><rect x={x} y={y} width="20" height="20" rx="4" fill="#1d2730" /><rect x={x + 6} y={y + 6} width="8" height="8" rx="2" fill="#fff" /></g>
    ))}
    <path d="M70 66h8v8h-8zM82 74h8v8h-8zM70 82h8v8M56 30h6v6h-6zM56 44h6v14M30 54h14v6" fill="#1d2730" stroke="#1d2730" strokeWidth="1" />
    <path d="M16 56h88" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
  </>),
  parking: (id) => (<>
    <Shadow id={id} w={30} />
    <rect x="56" y="70" width="8" height="34" rx="3" fill="#7a8794" />
    <rect x="26" y="12" width="68" height="64" rx="12" fill={`url(#${id}-white)`} />
    <rect x="31" y="17" width="58" height="54" rx="9" fill={`url(#${id}-blue)`} />
    <path d="M50 62V28h12a10 10 0 0 1 0 20H50" stroke="#fff" strokeWidth="9" fill="none" strokeLinejoin="round" />
    <Gloss d="M31 26a9 9 0 0 1 9-9h30L40 52h-9z" opacity=".2" />
  </>),
  tree: (id) => (<>
    <Shadow id={id} />
    <path d="M22 88l38-16 38 16-38 16z" fill={`url(#${id}-green)`} />
    <path d="M22 88v6l38 16v-6zM98 88v6l-38 16v-6z" fill="#c9d3dd" />
    <path d="M56 86V60h8v26z" fill={`url(#${id}-brown)`} />
    <circle cx="60" cy="40" r="22" fill={`url(#${id}-green)`} />
    <circle cx="42" cy="54" r="14" fill={`url(#${id}-green)`} />
    <circle cx="78" cy="54" r="14" fill={`url(#${id}-green)`} />
    <Gloss d="M46 30a18 18 0 0 1 18-10c-8 4-12 10-14 18z" />
  </>),
  sim: (id) => (<>
    <Shadow id={id} />
    <g transform="rotate(-20 60 60)">
      <path d="M30 16h44l18 18v66a6 6 0 0 1-6 6H30a6 6 0 0 1-6-6V22a6 6 0 0 1 6-6z" fill={`url(#${id}-white)`} />
      <rect x="38" y="46" width="44" height="38" rx="6" fill={`url(#${id}-gold)`} />
      <path d="M38 60h44M38 72h44M58 46v38" stroke="#b07a1e" strokeWidth="2" />
    </g>
  </>),
  watch: (id) => (<>
    <Shadow id={id} w={30} />
    <rect x="44" y="8" width="32" height="104" rx="12" fill={`url(#${id}-teal)`} />
    <rect x="34" y="32" width="52" height="56" rx="14" fill={`url(#${id}-dark)`} />
    <rect x="40" y="38" width="40" height="44" rx="9" fill="#11202b" />
    <path d="M60 46v14l8 6" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" fill="none" />
  </>),
  topup: (id) => (<>
    <Shadow id={id} />
    <rect x="16" y="30" width="88" height="60" rx="12" fill={`url(#${id}-blue)`} />
    <Gloss d="M16 44c22-10 50-14 88-8v-6a12 12 0 0 0-12-12H28a12 12 0 0 0-12 12z" />
    <circle cx="86" cy="80" r="18" fill={`url(#${id}-green)`} />
    <path d="M86 72v16M78 80h16" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
  </>),
};

export function Art({ name, className = '' }) {
  const id = 'art' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg className={`art ${className}`} viewBox="0 0 120 120" aria-hidden="true">
      <Defs id={id} />
      {scenes[name]?.(id)}
    </svg>
  );
}
