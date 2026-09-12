import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'nailsalon.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
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

const defaults = {
  open_time: '09:00',
  close_time: '20:00',
  slot_minutes: '60',
  closed_days: '0', // 0=อาทิตย์ ... 6=เสาร์ (คั่นด้วย ,)
};
const getSetting = db.prepare('SELECT value FROM settings WHERE key=?');
const setSetting = db.prepare(
  'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
);
for (const [key, value] of Object.entries(defaults)) {
  if (!getSetting.get(key)) setSetting.run(key, value);
}

const seed = db.prepare('SELECT COUNT(*) AS n FROM services').get().n;
if (seed === 0) {
  const services = [
    { id: 'classic', name: 'ทำเล็บเจล', name_en: 'Gel Manicure', description: 'ทำเล็บเจลติดทนนาน เงางาม อยู่ได้นาน 3-4 สัปดาห์', price: 590, duration: '60 นาที', icon: '💅', popular: 1, active: 1 },
    { id: 'extension', name: 'ต่อเล็บอะคริลิก', name_en: 'Acrylic Extension', description: 'ต่อเล็บทรงสวยได้ทุกแบบ แข็งแรง อยู่ได้นาน 4-6 สัปดาห์', price: 890, duration: '90 นาที', icon: '✨', popular: 0, active: 1 },
    { id: 'art', name: 'เพ้นท์เล็บลาย', name_en: 'Nail Art', description: 'ออกแบบลายเล็บเฉพาะตัว ตามสไตล์ที่คุณต้องการ', price: 350, duration: '45 นาที', icon: '🎨', popular: 1, active: 1 },
    { id: 'pedicure', name: 'สปาเท้า + ทำเล็บเท้า', name_en: 'Spa Pedicure', description: 'ดูแลเท้าอย่างล้ำลึก ขัดผิว แช่เท้าสมุนไพร และทำเล็บ', price: 690, duration: '75 นาที', icon: '🌿', popular: 0, active: 1 },
    { id: 'removal', name: 'ถอดเล็บ + บำรุง', name_en: 'Removal & Care', description: 'ถอดเล็บอย่างปลอดภัย พร้อมบำรุงผิวรอบเล็บ', price: 250, duration: '30 นาที', icon: '🧴', popular: 0, active: 1 },
    { id: 'bridal', name: 'แพ็กเกจเจ้าสาว', name_en: 'Bridal Package', description: 'ทำเล็บมือ-เท้า + ออกแบบลายพิเศษสำหรับวันสำคัญ', price: 1590, duration: '120 นาที', icon: '👰', popular: 0, active: 1 },
  ];
  const insert = db.prepare(
    'INSERT INTO services (id, name, name_en, description, price, duration, icon, popular, active) VALUES (?,?,?,?,?,?,?,?,?)',
  );
  for (const s of services) {
    insert.run(s.id, s.name, s.name_en, s.description, s.price, s.duration, s.icon, s.popular, s.active);
  }
  console.log('[db] seeded services');
}

export default db;