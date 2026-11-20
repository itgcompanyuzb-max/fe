const KEY = { user: 'transit.token', admin: 'transit.admin' };

const read = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k, v) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch { /* ignore */ } };

export const session = {
  get: () => read(KEY.user), set: (t) => write(KEY.user, t),
  getAdmin: () => read(KEY.admin), setAdmin: (t) => write(KEY.admin, t),
};

async function request(method, url, body, tok) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(tok ? { Authorization: `Bearer ${tok}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.error || `Xato ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return json;
}

export const api = {
  get: (u) => request('GET', u, null, session.get()),
  post: (u, b) => request('POST', u, b, session.get()),
  patch: (u, b) => request('PATCH', u, b, session.get()),
  del: (u) => request('DELETE', u, null, session.get()),
};

export const adminApi = {
  get: (u) => request('GET', u, null, session.getAdmin()),
  post: (u, b) => request('POST', u, b, session.getAdmin()),
  put: (u, b) => request('PUT', u, b, session.getAdmin()),
};

export const money = (n) => Math.abs(n).toLocaleString('ru-RU').replace(/,/g, ' ');
export const cardNum = (n) => n.replace(/(\d{4})(?=\d)/g, '$1 ');
