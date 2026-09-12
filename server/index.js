import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ?? 4000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const LINE_NOTIFY_TOKEN = process.env.LINE_NOTIFY_TOKEN || '';

app.use(cors());
app.use(express.json());

// ── helpers ────────────────────────────────────────────────────────────────
function genRef() {
  return 'NS' + crypto.randomInt(100000, 999999);
}
function todayStr() {
  return new Date().toISOString().split('T')[0];
}
function makeToken() {
  return crypto.randomBytes(32).toString('hex');
}
// simple admin tokens in-memory
const adminTokens = new Set();

function requireAdmin(req, res, next) {
  const tok = (req.headers.authorization || '').replace('Bearer ', '');
  if (!tok || !adminTokens.has(tok)) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// ── LINE Notify ────────────────────────────────────────────────────────────
async function sendLineNotify(message) {
  if (!LINE_NOTIFY_TOKEN) return { sent: false, reason: 'no-token' };
  try {
    const resp = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LINE_NOTIFY_TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ message }),
    });
    if (!resp.ok) {
      return { sent: false, reason: `http-${resp.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error('[LINE] notify failed:', err?.message ?? err);
    return { sent: false, reason: 'network-error' };
  }
}

// ── business settings ──────────────────────────────────────────────────────
const DAY_NAMES = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];

function getSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    openTime: s.open_time ?? '09:00',
    closeTime: s.close_time ?? '20:00',
    slotMinutes: Math.max(15, Number(s.slot_minutes) || 60),
    closedDays: (s.closed_days ?? '0').split(',').map(Number).filter((n) => n >= 0 && n <= 6),
  };
}
function saveSettings({ openTime, closeTime, slotMinutes, closedDays }) {
  const set = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
  );
  set.run('open_time', openTime);
  set.run('close_time', closeTime);
  set.run('slot_minutes', String(slotMinutes));
  set.run('closed_days', closedDays.join(','));
}
function timeToMin(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function minToTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
function generateSlots(date) {
  const s = getSettings();
  const dow = new Date(date + 'T00:00:00').getDay();
  if (s.closedDays.includes(dow)) return [];
  const open = timeToMin(s.openTime);
  const close = timeToMin(s.closeTime);
  const out = [];
  if (isNaN(open) || isNaN(close) || close <= open) return []; // config ผิด = ไม่มีคิว
  for (let t = open; t + s.slotMinutes <= close; t += s.slotMinutes) out.push(minToTime(t));
  return out;
}
const closedDaysText = (s = getSettings()) => {
  if (s.closedDays.length === 0) return 'ทุกวัน';
  return `วัน${s.closedDays.map((d) => DAY_NAMES[d]).join(', ')}`;
};
const hoursText = (s = getSettings()) => `${s.openTime} - ${s.closeTime} น.`;

app.get('/api/settings', (_req, res) => {
  const s = getSettings();
  res.json({ ...s, hoursText: hoursText(s), closedDaysText: closedDaysText(s), dayNames: DAY_NAMES });
});

// ── public: services ───────────────────────────────────────────────────────
app.get('/api/services', (_req, res) => {
  const rows = db.prepare('SELECT * FROM services WHERE active=1 ORDER BY popular DESC, name').all();
  res.json(rows);
});
app.get('/api/services/all', (_req, res) => {
  res.json(db.prepare('SELECT * FROM services ORDER BY id').all());
});

// ── public: available slots ────────────────────────────────────────────────
app.get('/api/slots', (req, res) => {
  const date = req.query.date;
  if (!date) return res.status(400).json({ error: 'date required' });
  const all = generateSlots(date);
  const booked = db
    .prepare("SELECT time FROM bookings WHERE date=? AND status IN ('pending','confirmed')")
    .all(date)
    .map((r) => r.time);
  const now = new Date();
  const slots = all.filter((t) => {
    if (booked.includes(t)) return false;
    if (date === todayStr()) {
      const [h, m] = t.split(':').map(Number);
      const slotTime = new Date();
      slotTime.setHours(h, m, 0, 0);
      if (slotTime <= now) return false;
    }
    return true;
  });
  res.json(slots);
});

// ── public: create booking ─────────────────────────────────────────────────
app.post('/api/bookings', async (req, res) => {
  const { serviceId, date, time, name, phone, note } = req.body;
  if (!serviceId || !date || !time || !name?.trim() || !phone?.trim()) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบ' });
  }
  const s = getSettings();
  const dow = new Date(date + 'T00:00:00').getDay();
  if (s.closedDays.includes(dow)) {
    return res.status(400).json({ error: `วัน${DAY_NAMES[dow]}ร้านหยุด ไม่สามารถจองได้` });
  }
  if (!generateSlots(date).includes(time)) return res.status(400).json({ error: 'เวลาไม่ถูกต้อง' });
  if (date < todayStr()) return res.status(400).json({ error: 'ไม่สามารถจองย้อนหลังได้' });

  const svc = db.prepare('SELECT * FROM services WHERE id=? AND active=1').get(serviceId);
  if (!svc) return res.status(400).json({ error: 'ไม่พบบริการนี้' });

  const conflict = db
    .prepare("SELECT id FROM bookings WHERE date=? AND time=? AND status IN ('pending','confirmed')")
    .get(date, time);
  if (conflict) return res.status(409).json({ error: 'คิวนี้ถูกจองไปแล้ว กรุณาเลือกเวลาใหม่' });

  const ref = genRef();
  db.prepare(
    'INSERT INTO bookings (ref, service_id, date, time, name, phone, note) VALUES (?,?,?,?,?,?,?)',
  ).run(ref, serviceId, date, time, name.trim(), phone.trim(), note?.trim() || '');

  const lineResult = await sendLineNotify(
    `💅 คิวใหม่!\n${svc.icon} ${svc.name}\n👤 ${name.trim()} (${phone.trim()})\n📅 ${date} ${time}\n🔢 ${ref}`,
  );

  res.status(201).json({ ref, message: 'จองคิวสำเร็จ', service: svc, line: lineResult });
});

// ── public: lookup bookings by phone ───────────────────────────────────────
app.get('/api/bookings/lookup', (req, res) => {
  const phone = (req.query.phone || '').replace(/\D/g, '');
  if (phone.length < 8) return res.status(400).json({ error: 'กรุณากรอกเบอร์โทรให้ถูกต้อง' });
  const rows = db
    .prepare(
      `SELECT b.ref, b.date, b.time, b.status, b.note, b.created_at,
              s.name AS service_name, s.icon, s.price
       FROM bookings b JOIN services s ON b.service_id=s.id
       WHERE b.phone LIKE ? ORDER BY b.date DESC, b.time DESC`,
    )
    .all(`%${phone}%`);
  res.json(rows);
});

// ── public: cancel booking ─────────────────────────────────────────────────
app.patch('/api/bookings/:ref/cancel', async (req, res) => {
  const { ref } = req.params;
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'ต้องยืนยันด้วยเบอร์โทร' });
  const b = db.prepare('SELECT * FROM bookings WHERE ref=? AND phone LIKE ?').get(ref, `%${phone.replace(/\D/g, '')}%`);
  if (!b) return res.status(404).json({ error: 'ไม่พบคิวนี้' });
  if (b.status === 'completed') return res.status(400).json({ error: 'คิวนี้จบแล้ว ไม่สามารถยกเลิกได้' });
  db.prepare('UPDATE bookings SET status="cancelled" WHERE id=?').run(b.id);
  const svc = db.prepare('SELECT name, icon FROM services WHERE id=?').get(b.service_id);
  await sendLineNotify(
    `🗑️ คิวถูกยกเลิก\n${svc?.icon ?? '💅'} ${svc?.name ?? ''}\n👤 ${b.name} (${b.phone})\n📅 ${b.date} ${b.time}\n🔢 ${b.ref}`,
  );
  res.json({ message: 'ยกเลิกคิวเรียบร้อย' });
});

// ── admin: login ───────────────────────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  if (req.body.password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
  const token = makeToken();
  adminTokens.add(token);
  setTimeout(() => adminTokens.delete(token), 12 * 60 * 60 * 1000); // 12 hours
  res.json({ token });
});

// ── admin: bookings ────────────────────────────────────────────────────────
app.get('/api/admin/bookings', requireAdmin, (req, res) => {
  const { date = todayStr(), status } = req.query;
  let sql = `SELECT b.*, s.name AS service_name, s.icon, s.price
             FROM bookings b JOIN services s ON b.service_id=s.id WHERE b.date=?`;
  const params = [date];
  if (status && status !== 'all') {
    sql += ' AND b.status=?';
    params.push(status);
  }
  sql += ' ORDER BY b.time';
  res.json(db.prepare(sql).all(...params));
});

app.get('/api/admin/bookings/all', requireAdmin, (req, res) => {
  const { status } = req.query;
  let sql = `SELECT b.*, s.name AS service_name, s.icon, s.price
             FROM bookings b JOIN services s ON b.service_id=s.id WHERE 1=1`;
  const params = [];
  if (status && status !== 'all') {
    sql += ' AND b.status=?';
    params.push(status);
  }
  sql += ' ORDER BY b.date DESC, b.time DESC LIMIT 500';
  res.json(db.prepare(sql).all(...params));
});

app.get('/api/admin/bookings/week', requireAdmin, (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from/to required' });
  const rows = db
    .prepare(`SELECT b.*, s.name AS service_name, s.icon, s.price
              FROM bookings b JOIN services s ON b.service_id=s.id
              WHERE b.date BETWEEN ? AND ? ORDER BY b.date, b.time`)
    .all(from, to);
  res.json(rows);
});

app.patch('/api/admin/bookings/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'status ไม่ถูกต้อง' });
  }
  db.prepare('UPDATE bookings SET status=? WHERE id=?').run(status, Number(id));
  const b = db.prepare('SELECT b.*, s.name AS service_name, s.icon FROM bookings b JOIN services s ON b.service_id=s.id WHERE b.id=?').get(Number(id));
  if (b) {
    const statusEmoji = { confirmed: '✅ ยืนยันคิว', completed: '💅 เสร็จแล้ว', cancelled: '🗑️ ยกเลิกคิว', pending: '⏳ รอยืนยัน' };
    await sendLineNotify(
      `${statusEmoji[status] ?? status}\n${b.icon} ${b.service_name}\n👤 ${b.name} (${b.phone})\n📅 ${b.date} ${b.time}\n🔢 ${b.ref}`,
    );
  }
  res.json({ message: 'ok' });
});

// ── admin: LINE status + test notify ───────────────────────────────────────
app.get('/api/admin/line-status', requireAdmin, (req, res) => {
  res.json({ configured: !!LINE_NOTIFY_TOKEN });
});

app.post('/api/admin/test-line', requireAdmin, async (req, res) => {
  const result = await sendLineNotify('💅 LINE Notify ทำงานได้ปกติ!\nNail & Salon\nระบบจะแจ้งเตือนคิวใหม่ทันทีที่มีคนจอง');
  if (!result.sent && result.reason === 'no-token') {
    return res.status(400).json({ error: 'ยังไม่ได้ตั้งค่า LINE_NOTIFY_TOKEN ใน .env', ...result });
  }
  res.json(result);
});

// ── admin: services CRUD ───────────────────────────────────────────────────
app.put('/api/admin/services/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, icon, price, duration, active } = req.body;
  const svc = db.prepare('SELECT id FROM services WHERE id=?').get(id);
  if (!svc) return res.status(404).json({ error: 'ไม่พบบริการ' });
  if (name !== undefined && String(name).trim()) {
    db.prepare('UPDATE services SET name=? WHERE id=?').run(String(name).trim(), id);
  }
  if (icon !== undefined) db.prepare('UPDATE services SET icon=? WHERE id=?').run(icon, id);
  if (price !== undefined) db.prepare('UPDATE services SET price=? WHERE id=?').run(Number(price), id);
  if (duration !== undefined) db.prepare('UPDATE services SET duration=? WHERE id=?').run(duration, id);
  if (active !== undefined) db.prepare('UPDATE services SET active=? WHERE id=?').run(active ? 1 : 0, id);
  res.json({ message: 'ok' });
});

app.post('/api/admin/services', requireAdmin, (req, res) => {
  const { name, icon, price, duration } = req.body;
  if (!String(name || '').trim()) return res.status(400).json({ error: 'กรุณากรอกชื่อบริการ' });
  const id = `svc-${Date.now()}`;
  db.prepare(
    'INSERT INTO services (id, name, price, duration, icon, popular, active) VALUES (?,?,?,?,?,0,1)'
  ).run(id, String(name).trim(), Number(price || 0), String(duration || '60 นาที'), String(icon || '💅'));
  res.json(db.prepare('SELECT * FROM services WHERE id=?').get(id));
});

app.delete('/api/admin/services/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const svc = db.prepare('SELECT id FROM services WHERE id=?').get(id);
  if (!svc) return res.status(404).json({ error: 'ไม่พบบริการ' });
  const used = db.prepare('SELECT COUNT(*) AS n FROM bookings WHERE service_id=?').get(id).n;
  if (used > 0) {
    return res.status(400).json({ error: 'บริการนี้มีคิวอ้างอิงอยู่ กรุณาใช้ "ซ่อน" แทนการลบ' });
  }
  db.prepare('DELETE FROM services WHERE id=?').run(id);
  res.json({ message: 'ok' });
});

// ── admin: business settings ───────────────────────────────────────────────
app.get('/api/admin/settings', requireAdmin, (_req, res) => {
  res.json(getSettings());
});

app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const { openTime, closeTime, slotMinutes, closedDays } = req.body;
  if (
    !/^\d{2}:\d{2}$/.test(openTime || '') ||
    !/^\d{2}:\d{2}$/.test(closeTime || '')
  ) {
    return res.status(400).json({ error: 'เวลาเปิด-ปิดต้องอยู่ในรูปแบบ HH:MM' });
  }
  const step = Number(slotMinutes);
  if (![15, 30, 45, 60, 90, 120].includes(step)) {
    return res.status(400).json({ error: 'ระยะเวลาสล็อตผิดปกติ' });
  }
  if (!Array.isArray(closedDays) || closedDays.some((d) => !Number.isInteger(d) || d < 0 || d > 6)) {
    return res.status(400).json({ error: 'วันหยุดไม่ถูกต้อง' });
  }
  saveSettings({ openTime, closeTime, slotMinutes: step, closedDays });
  res.json(getSettings());
});

// ── admin: stats ───────────────────────────────────────────────────────────
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const today = todayStr();
  const todayCount = db.prepare("SELECT COUNT(*) AS n FROM bookings WHERE date=? AND status IN ('pending','confirmed')").get(today).n;
  const totalPending = db.prepare("SELECT COUNT(*) AS n FROM bookings WHERE status='pending'").get().n;
  const totalConfirmed = db.prepare("SELECT COUNT(*) AS n FROM bookings WHERE status='confirmed'").get().n;
  const totalCompleted = db.prepare("SELECT COUNT(*) AS n FROM bookings WHERE status='completed'").get().n;
  const revenue = db.prepare("SELECT COALESCE(SUM(s.price),0) AS total FROM bookings b JOIN services s ON b.service_id=s.id WHERE b.date=? AND b.status IN ('pending','confirmed','completed')").get(today).total;
  res.json({ todayCount, totalPending, totalConfirmed, totalCompleted, revenue });
});

// ── serve static in production ─────────────────────────────────────────────
const dist = path.join(__dirname, '..', 'dist');
app.use(express.static(dist));
const indexPath = path.join(dist, 'index.html');
app.get(/^\/(?:booking|admin)(?:\/.*)?$/, (_req, res) => res.sendFile(indexPath));
app.get('/', (_req, res) => res.sendFile(indexPath));

app.listen(PORT, () => {
  console.log(`💅 Nail Salon API → http://localhost:${PORT}`);
});