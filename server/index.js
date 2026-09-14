import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db, { initDb, USE_PG } from './db.js';

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
const TOKEN_TTL = 7 * 24 * 3600 * 1000; // 7 วัน
function makeToken() {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + TOKEN_TTL })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', ADMIN_PASSWORD).update(payload).digest('hex');
  return `${payload}.${sig}`;
}
function verifyToken(tok) {
  const [payload, sig] = String(tok || '').split('.');
  if (!payload || !sig) return false;
  const expect = crypto.createHmac('sha256', ADMIN_PASSWORD).update(payload).digest('hex');
  const a = Buffer.from(sig);
  const b = Buffer.from(expect);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now();
  } catch {
    return false;
  }
}

function requireAdmin(req, res, next) {
  const tok = (req.headers.authorization || '').replace('Bearer ', '');
  if (!verifyToken(tok)) return res.status(401).json({ error: 'Unauthorized' });
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

async function getSettings() {
  const rows = await db.all('SELECT key, value FROM settings');
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    openTime: s.open_time ?? '09:00',
    closeTime: s.close_time ?? '20:00',
    slotMinutes: Math.max(15, Number(s.slot_minutes) || 60),
    closedDays: (s.closed_days ?? '0').split(',').map(Number).filter((n) => n >= 0 && n <= 6),
  };
}
async function saveSettings({ openTime, closeTime, slotMinutes, closedDays }) {
  await db.run(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
    'open_time',
    openTime,
  );
  await db.run(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
    'close_time',
    closeTime,
  );
  await db.run(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
    'slot_minutes',
    String(slotMinutes),
  );
  await db.run(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
    'closed_days',
    closedDays.join(','),
  );
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
async function generateSlots(date) {
  const s = await getSettings();
  const dow = new Date(date + 'T00:00:00').getDay();
  if (s.closedDays.includes(dow)) return [];
  const open = timeToMin(s.openTime);
  const close = timeToMin(s.closeTime);
  const out = [];
  if (isNaN(open) || isNaN(close) || close <= open) return []; // config ผิด = ไม่มีคิว
  for (let t = open; t + s.slotMinutes <= close; t += s.slotMinutes) out.push(minToTime(t));
  return out;
}
const closedDaysText = (s) => {
  if (!s || s.closedDays.length === 0) return 'ทุกวัน';
  return `วัน${s.closedDays.map((d) => DAY_NAMES[d]).join(', ')}`;
};
const hoursText = (s) => `${s.openTime} - ${s.closeTime} น.`;

app.get('/api/settings', async (_req, res) => {
  const s = await getSettings();
  res.json({ ...s, hoursText: hoursText(s), closedDaysText: closedDaysText(s), dayNames: DAY_NAMES });
});

// ── public: services ───────────────────────────────────────────────────────
app.get('/api/services', async (_req, res) => {
  const rows = await db.all('SELECT * FROM services WHERE active=1 ORDER BY popular DESC, name');
  res.json(rows);
});
app.get('/api/services/all', async (_req, res) => {
  res.json(await db.all('SELECT * FROM services ORDER BY id'));
});

// ── public: available slots ────────────────────────────────────────────────
app.get('/api/slots', async (req, res) => {
  const date = req.query.date;
  if (!date) return res.status(400).json({ error: 'date required' });
  const all = await generateSlots(date);
  const booked = (await db.all(
    "SELECT time FROM bookings WHERE date=? AND status IN ('pending','confirmed')",
    date,
  )).map((r) => r.time);
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
  const s = await getSettings();
  const dow = new Date(date + 'T00:00:00').getDay();
  if (s.closedDays.includes(dow)) {
    return res.status(400).json({ error: `วัน${DAY_NAMES[dow]}ร้านหยุด ไม่สามารถจองได้` });
  }
  if (!(await generateSlots(date)).includes(time)) return res.status(400).json({ error: 'เวลาไม่ถูกต้อง' });
  if (date < todayStr()) return res.status(400).json({ error: 'ไม่สามารถจองย้อนหลังได้' });

  const svc = await db.get('SELECT * FROM services WHERE id=? AND active=1', serviceId);
  if (!svc) return res.status(400).json({ error: 'ไม่พบบริการนี้' });

  const conflict = await db.get(
    "SELECT id FROM bookings WHERE date=? AND time=? AND status IN ('pending','confirmed')",
    date,
    time,
  );
  if (conflict) return res.status(409).json({ error: 'คิวนี้ถูกจองไปแล้ว กรุณาเลือกเวลาใหม่' });

  const ref = genRef();
  await db.run(
    'INSERT INTO bookings (ref, service_id, date, time, name, phone, note) VALUES (?,?,?,?,?,?,?)',
    ref,
    serviceId,
    date,
    time,
    name.trim(),
    phone.trim(),
    note?.trim() || '',
  );

  const lineResult = await sendLineNotify(
    `💅 คิวใหม่!\n${svc.icon} ${svc.name}\n👤 ${name.trim()} (${phone.trim()})\n📅 ${date} ${time}\n🔢 ${ref}`,
  );

  res.status(201).json({ ref, message: 'จองคิวสำเร็จ', service: svc, line: lineResult });
});

// ── public: lookup bookings by phone ───────────────────────────────────────
app.get('/api/bookings/lookup', async (req, res) => {
  const phone = (req.query.phone || '').replace(/\D/g, '');
  if (phone.length < 8) return res.status(400).json({ error: 'กรุณากรอกเบอร์โทรให้ถูกต้อง' });
  const rows = await db.all(
    `SELECT b.ref, b.date, b.time, b.status, b.note, b.created_at,
            s.name AS service_name, s.icon, s.price
     FROM bookings b JOIN services s ON b.service_id=s.id
     WHERE b.phone LIKE ? ORDER BY b.date DESC, b.time DESC`,
    `%${phone}%`,
  );
  res.json(rows);
});

// ── public: cancel booking ─────────────────────────────────────────────────
app.patch('/api/bookings/:ref/cancel', async (req, res) => {
  const { ref } = req.params;
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'ต้องยืนยันด้วยเบอร์โทร' });
  const b = await db.get('SELECT * FROM bookings WHERE ref=? AND phone LIKE ?', ref, `%${phone.replace(/\D/g, '')}%`);
  if (!b) return res.status(404).json({ error: 'ไม่พบคิวนี้' });
  if (b.status === 'completed') return res.status(400).json({ error: 'คิวนี้จบแล้ว ไม่สามารถยกเลิกได้' });
  await db.run("UPDATE bookings SET status='cancelled' WHERE id=?", b.id);
  const svc = await db.get('SELECT name, icon FROM services WHERE id=?', b.service_id);
  await sendLineNotify(
    `🗑️ คิวถูกยกเลิก\n${svc?.icon ?? '💅'} ${svc?.name ?? ''}\n👤 ${b.name} (${b.phone})\n📅 ${b.date} ${b.time}\n🔢 ${b.ref}`,
  );
  res.json({ message: 'ยกเลิกคิวเรียบร้อย' });
});

// ── admin: login ───────────────────────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  if (req.body.password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
  res.json({ token: makeToken() });
});

// ── admin: bookings ────────────────────────────────────────────────────────
app.get('/api/admin/bookings', requireAdmin, async (req, res) => {
  const { date = todayStr(), status } = req.query;
  let sql = `SELECT b.*, s.name AS service_name, s.icon, s.price
             FROM bookings b JOIN services s ON b.service_id=s.id WHERE b.date=?`;
  const params = [date];
  if (status && status !== 'all') {
    sql += ' AND b.status=?';
    params.push(status);
  }
  sql += ' ORDER BY b.time';
  res.json(await db.all(sql, ...params));
});

app.get('/api/admin/bookings/all', requireAdmin, async (req, res) => {
  const { status } = req.query;
  let sql = `SELECT b.*, s.name AS service_name, s.icon, s.price
             FROM bookings b JOIN services s ON b.service_id=s.id WHERE 1=1`;
  const params = [];
  if (status && status !== 'all') {
    sql += ' AND b.status=?';
    params.push(status);
  }
  sql += ' ORDER BY b.date DESC, b.time DESC LIMIT 500';
  res.json(await db.all(sql, ...params));
});

app.get('/api/admin/bookings/week', requireAdmin, async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from/to required' });
  const rows = await db.all(
    `SELECT b.*, s.name AS service_name, s.icon, s.price
     FROM bookings b JOIN services s ON b.service_id=s.id
     WHERE b.date BETWEEN ? AND ? ORDER BY b.date, b.time`,
    from,
    to,
  );
  res.json(rows);
});

app.patch('/api/admin/bookings/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'status ไม่ถูกต้อง' });
  }
  await db.run('UPDATE bookings SET status=? WHERE id=?', status, Number(id));
  const b = await db.get(
    'SELECT b.*, s.name AS service_name, s.icon FROM bookings b JOIN services s ON b.service_id=s.id WHERE b.id=?',
    Number(id),
  );
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
app.put('/api/admin/services/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, icon, price, duration, active } = req.body;
  const svc = await db.get('SELECT id FROM services WHERE id=?', id);
  if (!svc) return res.status(404).json({ error: 'ไม่พบบริการ' });
  if (name !== undefined && String(name).trim()) {
    await db.run('UPDATE services SET name=? WHERE id=?', String(name).trim(), id);
  }
  if (icon !== undefined) await db.run('UPDATE services SET icon=? WHERE id=?', icon, id);
  if (price !== undefined) await db.run('UPDATE services SET price=? WHERE id=?', Number(price), id);
  if (duration !== undefined) await db.run('UPDATE services SET duration=? WHERE id=?', duration, id);
  if (active !== undefined) await db.run('UPDATE services SET active=? WHERE id=?', active ? 1 : 0, id);
  res.json({ message: 'ok' });
});

app.post('/api/admin/services', requireAdmin, async (req, res) => {
  const { name, icon, price, duration, category, price_range } = req.body;
  if (!String(name || '').trim()) return res.status(400).json({ error: 'กรุณากรอกชื่อบริการ' });
  const id = `svc-${Date.now()}`;
  await db.run(
    'INSERT INTO services (id, name, price, duration, icon, popular, active, category, price_range) VALUES (?,?,?,?,?,0,1,?,?)',
    id,
    String(name).trim(),
    Number(price || 0),
    String(duration || '60 นาที'),
    String(icon || '💅'),
    String(category || ''),
    String(price_range || ''),
  );
  res.json(await db.get('SELECT * FROM services WHERE id=?', id));
});

app.delete('/api/admin/services/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const svc = await db.get('SELECT id FROM services WHERE id=?', id);
  if (!svc) return res.status(404).json({ error: 'ไม่พบบริการ' });
  const used = await db.get('SELECT COUNT(*) AS n FROM bookings WHERE service_id=?', id);
  if (used.n > 0) {
    return res.status(400).json({ error: 'บริการนี้มีคิวอ้างอิงอยู่ กรุณาใช้ "ซ่อน" แทนการลบ' });
  }
  await db.run('DELETE FROM services WHERE id=?', id);
  res.json({ message: 'ok' });
});

// ── admin: business settings ───────────────────────────────────────────────
app.get('/api/admin/settings', requireAdmin, async (_req, res) => {
  res.json(await getSettings());
});

app.put('/api/admin/settings', requireAdmin, async (req, res) => {
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
  await saveSettings({ openTime, closeTime, slotMinutes: step, closedDays });
  res.json(await getSettings());
});

// ── admin: stats ───────────────────────────────────────────────────────────
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  const today = todayStr();
  const todayCount = (await db.get(
    "SELECT COUNT(*) AS n FROM bookings WHERE date=? AND status IN ('pending','confirmed')",
    today,
  )).n;
  const totalPending = (await db.get("SELECT COUNT(*) AS n FROM bookings WHERE status='pending'")).n;
  const totalConfirmed = (await db.get("SELECT COUNT(*) AS n FROM bookings WHERE status='confirmed'")).n;
  const totalCompleted = (await db.get("SELECT COUNT(*) AS n FROM bookings WHERE status='completed'")).n;
  const revenue = (await db.get(
    'SELECT COALESCE(SUM(s.price),0) AS total FROM bookings b JOIN services s ON b.service_id=s.id WHERE b.date=? AND b.status IN (\'pending\',\'confirmed\',\'completed\')',
    today,
  )).total;
  res.json({ todayCount, totalPending, totalConfirmed, totalCompleted, revenue });
});

// ── serve static in production ─────────────────────────────────────────────
const dist = path.join(__dirname, '..', 'dist');
app.use(express.static(dist));
const indexPath = path.join(dist, 'index.html');
app.get(/^\/(?!api\/).*/u, (_req, res) => res.sendFile(indexPath));

// ── start ──────────────────────────────────────────────────────────────────
try {
  await initDb();
  console.log(`[db] connected (${USE_PG ? 'postgres cloud' : 'local sqlite'})`);
  app.listen(PORT, () => {
    console.log(`💅 Nail Salon API → http://localhost:${PORT}`);
  });
} catch (err) {
  console.error('[db] init failed:', err);
  process.exit(1);
}