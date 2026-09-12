# Nail & Salon — ระบบจองคิวร้านทำเล็บ

Full-stack จองคิวร้านทำเล็บ: หน้าเว็บ + ระบบหลังร้าน (Admin) + API + ฐานข้อมูล SQLite

## ฟีเจอร์

- **ลูกค้า**: ดูบริการ, จองคิวออนไลน์ (เช็คคิวเต็มแบบเรียลไทม์), เช็คคิวด้วยเบอร์โทร, ยกเลิกคิวเอง
- **หลังร้าน /admin**: เข้าสู่ระบบ, ดูคิววันนี้/ทั้งหมด, ยืนยันคิว/ปิดคิว/เสร็จแล้ว, ดูรายได้, แก้ราคา-เปิดปิดบริการ
- **กติกา**: หยุดทุกวันอาทิตย์, เปิด 09:00–20:00 น., จองซ้ำเวลาเดิมไม่ได้, จองย้อนหลังไม่ได้
- **แจ้งเตือน LINE** (ตัวเลือก): LINE Notify เมื่อมีคนจองคิวใหม่

## รันบนเครื่องตัวเอง

```bash
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm run dev                 # หน้าเว็บ http://localhost:5173
npm run server              # API http://localhost:4000
# หรือรันพร้อมกัน:
npm run both
```

- หน้าเว็บ: http://localhost:5173
- หลังร้าน: http://localhost:5173/admin (รหัสผ่านตั้งใน `.env` ค่าเริ่มต้น `admin123` — **ต้องเปลี่ยน**)

## ตั้งค่า

สร้างไฟล์ `.env` จาก `.env.example`:

| ตัวแปร | ความหมาย |
| --- | --- |
| `ADMIN_PASSWORD` | รหัสผ่านเข้าหน้า /admin |
| `LINE_NOTIFY_TOKEN` | Token ของ LINE Notify (ไม่ใส่ = ปิดแจ้งเตือน) |
| `PORT` | พอร์ตของ API server |

ฐานข้อมูลอยู่ที่ `data/nailsalon.db` (สร้างเองครั้งแรกที่รัน server)

## Build production

```bash
npm run build        # สร้าง dist/
npm run server       # server จะเสิร์ฟทั้งหน้าเว็บและ API ที่ http://localhost:4000
```

## Deploy ขึ้นอินเทอร์เน็ต

โปรเจคมีไฟล์ `render.yaml` พร้อมใช้สำหรับ [Render](https://render.com) แล้ว

1. Push โปรเจคขึ้น GitHub (ดูขั้นตอนด้านล่าง)
2. ที่ Render เลือก **New → Blueprint** แล้วเลือก repo นี้ (Render จะอ่าน `render.yaml`)
   - Build command: `npm ci && npm run build`
   - Start command: `npm run server`
3. ตั้ง environment variables ใน Dashboard: `ADMIN_PASSWORD`, `LINE_NOTIFY_TOKEN`
4. **ฐานข้อมูล**: Render แผนฟรีดิสก์เป็นชั่วคราว ข้อมูลจะหายเมื่อ redeploy
   - ถ้าต้องการถาวร: เพิ่ม Persistent Disk แล้วตั้ง path เป็น `data`
   - หรือย้ายไป PostgreSQL/Supabase สำหรับงานจริง

### เปลี่ยนรูปแกลเลอรี่เป็นรูปจริงของร้าน
วางไฟล์รูปชื่อ `1.jpg` … `8.jpg` ทับใน `public/gallery/` (หรือแก้ชื่อไฟล์ใน `src/data.js`) แล้ว build ใหม่

```bash
git init
git add .
git commit -m "Nail salon booking system"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```