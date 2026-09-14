import 'dotenv/config';
import Database from 'better-sqlite3';
import pg from 'pg';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const USE_PG = Boolean(process.env.DATABASE_URL);

let sqlite = null;
let pool = null;

if (USE_PG) {
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
  });
} else {
  const dataDir = path.join(__dirname, '..', 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  sqlite = new Database(path.join(dataDir, 'nailsalon.db'));
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
}

// แปลง ? เป็น $1,$2,... สำหรับ Postgres
function pgSql(sql) {
  let n = 0;
  return sql.replace(/\?/g, () => `$${++n}`);
}

// ── async wrapper: ใช้ API เดียวกันทั้ง sqlite/PG ────────────────────────────
const db = {
  async all(sql, ...params) {
    if (USE_PG) {
      const res = await pool.query(pgSql(sql), params);
      return res.rows;
    }
    return sqlite.prepare(sql).all(...params);
  },
  async get(sql, ...params) {
    if (USE_PG) {
      const res = await pool.query(pgSql(sql), params);
      return res.rows[0];
    }
    return sqlite.prepare(sql).get(...params);
  },
  async run(sql, ...params) {
    if (USE_PG) {
      await pool.query(pgSql(sql), params);
      return {};
    }
    return sqlite.prepare(sql).run(...params);
  },
  async exec(sql) {
    if (USE_PG) {
      await pool.query(sql);
      return;
    }
    sqlite.exec(sql);
  },
};

// ── schema + seed ───────────────────────────────────────────────────────────
export async function initDb() {
  if (USE_PG) {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_en TEXT,
        description TEXT,
        price INTEGER NOT NULL DEFAULT 0,
        duration TEXT,
        icon TEXT,
        popular INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1,
        category TEXT DEFAULT '',
        price_range TEXT DEFAULT ''
      );
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        ref TEXT UNIQUE NOT NULL,
        service_id TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        note TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT now(),
        FOREIGN KEY (service_id) REFERENCES services(id)
      );
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  } else {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_en TEXT,
        description TEXT,
        price INTEGER NOT NULL DEFAULT 0,
        duration TEXT,
        icon TEXT,
        popular INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ref TEXT UNIQUE NOT NULL,
        service_id TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        note TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (service_id) REFERENCES services(id)
      );
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // ── migrations: column สำหรับหมวดหมู่และราคาแบบช่วง ──
    const cols = sqlite.prepare('PRAGMA table_info(services)').all().map((c) => c.name);
    if (!cols.includes('category')) await db.exec('ALTER TABLE services ADD COLUMN category TEXT DEFAULT \'\'');
    if (!cols.includes('price_range')) await db.exec('ALTER TABLE services ADD COLUMN price_range TEXT DEFAULT \'\'');
  }

  // ── settings เริ่มต้น ──
  const defaults = {
    open_time: '09:00',
    close_time: '20:00',
    slot_minutes: '60',
    closed_days: '0', // 0=อาทิตย์ ... 6=เสาร์
  };
  for (const [key, value] of Object.entries(defaults)) {
    const existing = await db.get('SELECT value FROM settings WHERE key=?', key);
    if (!existing) {
      await db.run(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
        key,
        value,
      );
    }
  }

  // ── seed บริการถ้ายังว่าง ──
  const count = await db.get('SELECT COUNT(*) AS n FROM services');
  if (!count || Number(count.n) === 0) {
    for (const s of seedServices) {
      await db.run(
        'INSERT INTO services (id, name, name_en, description, price, duration, icon, popular, active, category, price_range) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        s.id,
        s.name,
        s.name_en || '',
        s.description,
        s.price,
        s.duration,
        s.icon,
        s.popular || 0,
        1,
        s.category,
        s.price_range || '',
      );
    }
    console.log(`[db] seeded ${seedServices.length} services (${USE_PG ? 'postgres' : 'sqlite'})`);
  }
}

const seedServices = [
  // สีเจล / ทำเล็บมือ
  { id: 'gel-basic', category: 'สีเจล', name: 'เล็บเจลเริ่มต้น', price: 189, price_range: '', duration: '60 นาที', icon: '💅', description: 'ทำสีเจลเริ่มต้น ปกปิดสีเล็บสวยเงางาม' },
  { id: 'gel-plain-excl', category: 'สีเจล', name: 'ทาสีพื้น (ยกเว้นขาว/ดำ)', price: 189, price_range: '', duration: '60 นาที', icon: '🎨', description: 'ทาสีเจลพื้นสีเดียว ยกเว้นสีขาว/ดำ' },
  { id: 'gel-plain-all', category: 'สีเจล', name: 'ทาสีพื้น (ไม่จำกัดสี)', price: 200, price_range: '', duration: '60 นาที', icon: '🎨', description: 'ทาสีเจลพื้น ไม่จำกัดสี' },
  { id: 'gel-bw', category: 'สีเจล', name: 'สีขาว/ดำ', price: 250, price_range: '', duration: '60 นาที', icon: '⚫', description: 'ทาสีเจลสีขาวหรือสีดำ' },
  { id: 'gel-milk', category: 'สีเจล', name: 'สีขาวนม', price: 250, price_range: '', duration: '60 นาที', icon: '🥛', description: 'ทาสีเจลสีขาวนม' },
  { id: 'gel-fancy', category: 'สีเจล', name: 'สีลูกแก้ว / แฟลช / กากเพชร / ไซรัป / นีออน', price: 250, price_range: '250 - 350', duration: '60 นาที', icon: '✨', description: 'สีพิเศษ: ลูกแก้ว แฟลช กากเพชร ไซรัป นีออน 2 เหลือบ เฟรนช์ปลายขาว ออมเบร' },
  { id: 'gel-toe', category: 'สีเจล', name: 'ทาสีเล็บเท้า (ไม่จำกัดสี)', price: 300, price_range: '', duration: '60 นาที', icon: '🦶', description: 'ทาสีเจลที่เล็บเท้า ไม่จำกัดสี' },

  // ต่อขนตา
  { id: 'lash', category: 'ต่อขนตา', name: 'ต่อขนตา', price: 399, price_range: '', duration: '90 นาที', icon: '👁️', description: 'ต่อขนตาเสิร์จ สวยเป็นธรรมชาติ' },
  { id: 'lash-lift', category: 'ต่อขนตา', name: 'ลิฟต์ติ้งขนตา / ขนคิ้ว', price: 299, price_range: '', duration: '60 นาที', icon: '💫', description: 'ดัดขนตา/ขนคิ้วให้งอนสวย ไม่ต้องต่อ' },

  // เส้นผม
  { id: 'hair-ext', category: 'ผม', name: 'ต่อผม เริ่มต้น', price: 500, price_range: 'เริ่มต้น 500', duration: '120 นาที', icon: '💇‍♀️', description: 'ต่อผมเพิ่มความยาวและความหนา' },
  { id: 'hair-cut', category: 'ผม', name: 'ตัดผม', price: 250, price_range: '250 - 350', duration: '30 นาที', icon: '✂️', description: 'ตัดผมทรงตามต้องการ' },
  { id: 'hair-wash', category: 'ผม', name: 'สระไดร์หนีบ', price: 120, price_range: '120 - 200', duration: '30 นาที', icon: '🫧', description: 'สระผม ไดร์ หนีบตรง' },
  { id: 'hair-straight', category: 'ผม', name: 'ยืด / ทำสี / ไฮไลท์ เริ่มต้น', price: 600, price_range: 'เริ่มต้น 600', duration: '180 นาที', icon: '🌊', description: 'ยืดตรง ทำสี ไฮไลท์ ตามแบบที่ต้องการ' },
  { id: 'hair-nana', category: 'ผม', name: 'สปานานาผม', price: 350, price_range: '', duration: '60 นาที', icon: '🧖', description: 'ทรีทเม้นท์ฟื้นฟูเส้นผมด้วยนานา' },
  { id: 'hair-nana-cera', category: 'ผม', name: 'สปานานา เคราติน + เชื่อมแกน', price: 500, price_range: '', duration: '90 นาที', icon: '💆‍♀️', description: 'เคราตินบำรุงผมพร้อมเชื่อมแกนเส้น' },

  // ดูแลมือ-เท้า
  { id: 'spa-handfoot', category: 'สปามือ/เท้า', name: 'สปามือ / สปาเท้า', price: 399, price_range: '', duration: '60 นาที', icon: '🧴', description: 'สปาผิวและเล็บมือ หรือเล็บเท้า' },
  { id: 'cut-cuticle', category: 'สปามือ/เท้า', name: 'ตัดหนังชุดมือเท้า', price: 250, price_range: '', duration: '45 นาที', icon: '✂️', description: 'ตัดแต่งหนังรอบเล็บมือและเท้า' },
  { id: 'ingrown', category: 'สปามือ/เท้า', name: 'ตัดเล็บขบ', price: 150, price_range: '', duration: '30 นาที', icon: '🩹', description: 'แก้เล็บขบอย่างปลอดภัย' },
  { id: 'cut-cuticle2', category: 'สปามือ/เท้า', name: 'ตัดหนังมือ / เท้า', price: 250, price_range: '', duration: '45 นาที', icon: '✂️', description: 'ตัดแต่งหนังรอบเล็บมือ หรือเล็บเท้า' },

  // ขน / คิ้ว
  { id: 'wax', category: 'ขน/คิ้ว', name: 'แว็กซ์ขน', price: 150, price_range: '150 - 200', duration: '30 นาที', icon: '🪶', description: 'แว็กซ์ขนเรียบเนียน ตามบริเวณที่ต้องการ' },
  { id: 'brow', category: 'ขน/คิ้ว', name: 'กันคิ้ว', price: 40, price_range: '', duration: '15 นาที', icon: '🎯', description: 'กันคิ้วเก็บทรงสวยคมชัด' },

  // ป้ายกระดานดำ (ไอเทมโปรโมชัน)
  { id: 'b-treat', category: 'ป้ายกระดานดำ', name: 'ทรีทเม้นท์', price: 30, price_range: '', duration: '30 นาที', icon: '🎀', description: 'ทรีทเม้นท์บำรุง (รายการกระดานดำ)' },
  { id: 'b-magkrud', category: 'ป้ายกระดานดำ', name: 'มะกรูด', price: 30, price_range: '', duration: '30 นาที', icon: '🍈', description: 'สระผมด้วยมะกรูด (รายการกระดานดำ)' },
  { id: 'b-headmassage', category: 'ป้ายกระดานดำ', name: 'นวดหัว', price: 50, price_range: '', duration: '20 นาที', icon: '💆', description: 'นวดหัวผ่อนคลาย (รายการกระดานดำ)' },
  { id: 'b-nana', category: 'ป้ายกระดานดำ', name: 'สปานานา', price: 350, price_range: '', duration: '60 นาที', icon: '🧖', description: 'สปานานา (รายการกระดานดำ)' },

  // ดีไซน์
  { id: 'design-3d', category: 'ดีไซน์', name: 'งานฝัง / หินอ่อน / ปั้นนูน / ขัดผง', price: 450, price_range: '', duration: '90 นาที', icon: '💎', description: 'งานดีไซน์พิเศษ ฝังเพชร หินอ่อน ปั้นนูน ขัดผง' },
  { id: 'design-pearl', category: 'ดีไซน์', name: 'ขัดผงมุก (เพิ่ม)', price: 150, price_range: '', duration: '30 นาที', icon: '🦪', description: 'เพิ่มความเงาแบบขัดผงมุก' },
  { id: 'design-paint', category: 'ดีไซน์', name: 'เพ้นท์ / แต่งอะไหล่ (ต่อนิ้ว)', price: 10, price_range: '10 - 50/นิ้ว', duration: '30 นาที', icon: '🖌️', description: 'เพ้นท์ลายหรือติดอะไหล่ คิดต่อนิ้ว' },
  { id: 'design-sticker', category: 'ดีไซน์', name: 'สติกเกอร์ไม่อั้น', price: 50, price_range: '', duration: '30 นาที', icon: '🌼', description: 'ติดสติกเกอร์ได้ไม่อั้นทั้งนิ้ว' },

  // ต่อเล็บ
  { id: 'ext-hardgel', category: 'ต่อเล็บ', name: 'เสริมหน้าเล็บ (ฮาร์ดเจลเพิ่มความหนา)', price: 50, price_range: '', duration: '30 นาที', icon: '🪨', description: 'เสริมความแข็งแรงด้วยฮาร์ดเจล' },
  { id: 'ext-pvc-tip', category: 'ต่อเล็บ', name: 'ต่อ PVC ซิดโคน', price: 150, price_range: '', duration: '90 นาที', icon: '💅', description: 'ต่อเล็บ PVC แบบชิดโคน' },
  { id: 'ext-pvc-gap', category: 'ต่อเล็บ', name: 'ต่อ PVC เว้นโคน', price: 200, price_range: '', duration: '90 นาที', icon: '✨', description: 'ต่อเล็บ PVC แบบเว้นโคน' },

  // สปา 7 ขั้นตอน
  { id: 'spa7-hand', category: 'สปา 7 ขั้นตอน', name: 'สปามือ 7 ขั้นตอน', price: 399, price_range: '', duration: '60 นาที', icon: '🤲', description: 'สปามือครบ 7 ขั้นตอน' },
  { id: 'spa7-foot', category: 'สปา 7 ขั้นตอน', name: 'สปาเท้า 7 ขั้นตอน', price: 399, price_range: '', duration: '60 นาที', icon: '🦶', description: 'สปาเท้าครบ 7 ขั้นตอน' },
  { id: 'spa7-both', category: 'สปา 7 ขั้นตอน', name: 'สปามือ + เท้า 7 ขั้นตอน', price: 699, price_range: '', duration: '90 นาที', icon: '💆', description: 'สปามือและเท้าครบ 7 ขั้นตอน' },

  // ล้าง / ถอด
  { id: 'rmv-old', category: 'ล้าง/ถอด', name: 'ล้างเล็บ (ลูกค้าเก่า)', price: 0, price_range: 'ฟรี', duration: '15 นาที', icon: '🧽', description: 'ล้างเล็บสำหรับลูกค้าเก่าที่มาทำต่อ', popular: 1 },
  { id: 'rmv-other', category: 'ล้าง/ถอด', name: 'ถอดเล็บเจล / PVC (จากร้านอื่น)', price: 50, price_range: '50 - 100', duration: '30 นาที', icon: '🛠️', description: 'ถอดเล็บจากร้านอื่น' },
  { id: 'rmv-notol', category: 'ล้าง/ถอด', name: 'ถอดเล็บเจล / PVC (ไม่ทำต่อ)', price: 150, price_range: '150 - 200', duration: '30 นาที', icon: '🗑️', description: 'ถอดเล็บอย่างปลอดภัย ไม่ทำต่อ' },
];

export { USE_PG };

export default db;