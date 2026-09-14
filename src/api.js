async function json(url, options) {
  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });
  } catch (err) {
    const e = new Error('การเชื่อมต่อขัดข้อง หรือเซิร์ฟเวอร์กำลังตื่น กรุณาลองอีกครั้ง');
    e.network = true;
    e.cause = err;
    throw e;
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    localStorage.removeItem('nail_admin_token');
    window.dispatchEvent(new Event('admin-unauthorized'));
  }
  if (!res.ok) {
    const e = new Error(data.error || data.message || `เกิดข้อผิดพลาด (HTTP ${res.status})`);
    e.status = res.status;
    throw e;
  }
  return data;
}

export async function jsonWithRetry(url, options = {}, retries = 2, delayMs = 4000) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      return await json(url, options);
    } catch (err) {
      lastErr = err;
      const retriable = i < retries && (err.network || (typeof err.status === 'number' && err.status >= 500));
      if (!retriable) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

export const api = {
  services: () => json('/api/services'),
  settings: () => json('/api/settings'),
  slots: (date) => json(`/api/slots?date=${encodeURIComponent(date)}`),
  createBooking: (body) =>
    json('/api/bookings', { method: 'POST', body: JSON.stringify(body) }),
  lookup: (phone) => json(`/api/bookings/lookup?phone=${encodeURIComponent(phone)}`),
  cancel: (ref, phone) =>
    json(`/api/bookings/${ref}/cancel`, { method: 'PATCH', body: JSON.stringify({ phone }) }),
};

export const apiAdmin = {
  login: (password) =>
    json('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) }),
  stats: (token) =>
    json('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
  bookings: (token, { date, status }) =>
    json(`/api/admin/bookings?date=${encodeURIComponent(date)}&status=${encodeURIComponent(status)}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  allBookings: (token, status) =>
    json(`/api/admin/bookings/all?status=${encodeURIComponent(status)}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  setStatus: (token, id, status) =>
    json(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    }),
  lineStatus: (token) =>
    json('/api/admin/line-status', { headers: { Authorization: `Bearer ${token}` } }),
  testLine: (token) =>
    json('/api/admin/test-line', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
  settings: (token) =>
    json('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } }),
  updateSettings: (token, body) =>
    json('/api/admin/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }),
  weekBookings: (token, from, to) =>
    json(`/api/admin/bookings/week?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  services: (token) =>
    json('/api/services/all', { headers: { Authorization: `Bearer ${token}` } }),
  updateService: (token, id, body) =>
    json(`/api/admin/services/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }),
  createService: (token, body) =>
    json('/api/admin/services', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }),
  deleteService: (token, id) =>
    json(`/api/admin/services/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),
};