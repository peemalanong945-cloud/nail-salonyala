import { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiAdmin } from "../api";

const TOKEN_KEY = "nail_admin_token";

const statusLabel = {
  pending: "รอยืนยัน",
  confirmed: "ยืนยันแล้ว",
  completed: "เสร็จแล้ว",
  cancelled: "ยกเลิก",
};

const statusColor = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  completed: "bg-blush-100 text-blush-700",
  cancelled: "bg-red-100 text-red-600",
};

function Login({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await apiAdmin.login(password);
      localStorage.setItem(TOKEN_KEY, token);
      onLogin(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border-2 border-plum-100 bg-white px-4 py-3 text-sm text-plum-900 outline-none transition placeholder:text-plum-300 focus:border-blush-400 focus:ring-4 focus:ring-blush-200/40";

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-blush-100 via-blush-50 to-plum-100 px-5">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-2xl shadow-plum-400/20 ring-1 ring-plum-100"
      >
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blush-400 to-plum-500 text-2xl text-white shadow-lg">
          🔐
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold text-plum-900">
          เข้าสู่ระบบหลังร้าน
        </h1>
        <p className="mt-1 text-sm text-plum-600">สำหรับเจ้าของร้านและพนักงานเท่านั้น</p>
        {error && (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 ring-1 ring-red-100">
            {error}
          </p>
        )}
        <label htmlFor="apassword" className="mt-6 mb-1.5 block text-sm font-medium text-plum-800">
          รหัสผ่าน
        </label>
        <input
          id="apassword"
          type="password"
          required
          placeholder="รหัสผ่านหลังร้าน"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-gradient-to-r from-blush-500 to-plum-500 py-3.5 font-semibold text-white shadow-xl shadow-blush-500/25 transition hover:scale-[1.02] disabled:opacity-50"
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
        <Link
          to="/"
          className="mt-5 block text-center text-sm font-medium text-plum-600 transition hover:text-blush-600"
        >
          ← กลับหน้าหลัก
        </Link>
      </form>
    </div>
  );
}

function Dashboard({ token, onLogout }) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [status, setStatus] = useState("all");
  const [view, setView] = useState("day");
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lineConfigured, setLineConfigured] = useState(null);
  const [lineMsg, setLineMsg] = useState("");
  const [lineBusy, setLineBusy] = useState(false);
  const [settings, setSettings] = useState(null);
  const [weekBookings, setWeekBookings] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);

  const mondayOfCurrentWeek = () => {
    const d = new Date();
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    return d;
  };
  const weekRange = (offset = weekOffset) => {
    const mon = mondayOfCurrentWeek();
    mon.setDate(mon.getDate() + offset * 7);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    const fmt = (x) =>
      `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
    return { from: fmt(mon), to: fmt(sun), monday: mon };
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([apiAdmin.stats(token), fetchBookings()])
      .then(([s]) => setStats(s))
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (view === "day") {
      fetchBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, status, view]);

  useEffect(() => {
    if (view === "all") {
      setLoading(true);
      apiAdmin
        .allBookings(token, status)
        .then(setBookings)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, view]);

  const loadServices = () => {
    apiAdmin.services(token).then(setServices).catch(() => {});
  };

  useEffect(() => {
    loadServices();
    apiAdmin
      .lineStatus(token)
      .then((s) => setLineConfigured(s.configured))
      .catch(() => setLineConfigured(false));
    apiAdmin.settings(token).then(setSettings).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (view !== "week") return;
    setLoading(true);
    const { from, to } = weekRange();
    Promise.all([apiAdmin.settings(token), apiAdmin.weekBookings(token, from, to)])
      .then(([st, rows]) => {
        setSettings(st);
        setWeekBookings(rows);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, weekOffset]);

  const testLine = async () => {
    setLineMsg("");
    setLineBusy(true);
    try {
      const result = await apiAdmin.testLine(token);
      setLineMsg(
        result.sent
          ? "✅ ส่งสำเร็จ ตรวจดูแชท LINE ของคุณได้เลย"
          : result.error || "ส่งไม่สำเร็จ ตรวจสอบ token ใน .env",
      );
    } catch (err) {
      setLineMsg(err.message);
    } finally {
      setLineBusy(false);
    }
  };

  const fetchBookings = () =>
    apiAdmin
      .bookings(token, { date, status })
      .then(setBookings)
      .catch(() => setBookings([]));

  const changeStatus = async (id, next) => {
    try {
      await apiAdmin.setStatus(token, id, next);
    } catch (e) {
      window.alert(`เปลี่ยนสถานะไม่สำเร็จ: ${e.message}`);
      return;
    }
    fetchBookings();
    apiAdmin.stats(token).then(setStats).catch(() => {});
  };

  const inputClass =
    "rounded-2xl border-2 border-plum-100 bg-white px-4 py-2.5 text-sm text-plum-900 outline-none transition focus:border-blush-400";

  const nextOf = (s) =>
    s === "pending" ? "confirmed" : s === "confirmed" ? "completed" : null;

  return (
    <div className="min-h-screen bg-blush-50">
      <header className="sticky top-0 z-40 bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blush-400 to-plum-500 text-lg shadow-md">
              🐰
            </span>
            <div>
              <p className="font-bold text-plum-900">Nail & Salon · Admin</p>
              <p className="text-xs text-plum-500">ระบบจัดการคิวหลังร้าน</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-full border-2 border-plum-200 px-4 py-2 text-sm font-semibold text-plum-700 transition hover:border-blush-400 hover:text-blush-600"
            >
              ดูหน้าเว็บ
            </Link>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(TOKEN_KEY);
                onLogout();
              }}
              className="rounded-full bg-blush-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blush-600"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        {stats && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "คิววันนี้", value: stats.todayCount, emoji: "🗓️" },
              { label: "รอยืนยัน", value: stats.totalPending, emoji: "⏳" },
              { label: "ยืนยันแล้ว", value: stats.totalConfirmed, emoji: "✅" },
              { label: "รายได้วันนี้", value: `${stats.revenue.toLocaleString("th-TH")} บาท`, emoji: "💰" },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-plum-100"
              >
                <span className="text-2xl">{card.emoji}</span>
                <p className="mt-2 font-display text-xl font-bold text-plum-900 sm:text-2xl">
                  {card.value}
                </p>
                <p className="text-xs text-plum-500 sm:text-sm">{card.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-plum-100">
          <div className="flex flex-wrap items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-2xl shadow-md">
              💬
            </span>
            <div className="flex-1">
              <h2 className="font-display text-lg font-bold text-plum-900">
                LINE แจ้งเตือนเจ้าของร้าน
              </h2>
              <p className="mt-0.5 text-sm text-plum-600">
                {lineConfigured === null
                  ? "กำลังตรวจสอบการตั้งค่า..."
                  : lineConfigured
                    ? "✦ ตั้งค่าแล้ว — จะแจ้งเตือนเมื่อมีคิวใหม่ / ยกเลิก / เปลี่ยนสถานะ"
                    : "ยังไม่ได้ตั้งค่า — ยังไม่มีการแจ้งเตือน LINE"}
              </p>
            </div>
            {!lineConfigured && (
              <a
                href="https://notify-bot.line.me/th/" 
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-600 underline underline-offset-2"
              >
                วิธีขอ token (LINE Notify) ↗
              </a>
            )}
            <button
              type="button"
              onClick={testLine}
              disabled={lineBusy}
              className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-600 disabled:opacity-50"
            >
              {lineBusy ? "กำลังส่ง..." : "ส่งข้อความเทสต์"}
            </button>
          </div>
          {lineMsg && (
            <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-100">
              {lineMsg}
            </p>
          )}
          {!lineConfigured && (
            <div className="mt-4 rounded-2xl bg-plum-50 px-5 py-4 text-sm leading-relaxed text-plum-700 ring-1 ring-plum-100">
              <p className="font-semibold text-plum-900">วิธีเปิดใช้งาน (2 ขั้นตอน):</p>
              <ol className="mt-1.5 list-decimal space-y-1 pl-5">
                <li>
                  เข้า{" "}
                  <a
                    href="https://notify-bot.line.me/th/"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-emerald-600 underline underline-offset-2"
                  >
                    notify-bot.line.me/th/
                  </a>{" "}
                  ด้วย LINE ของคุณ → สร้าง Access Token → วางไว้ในไฟล์{" "}
                  <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">.env</code> ตัวแปร{" "}
                  <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">LINE_NOTIFY_TOKEN</code>
                </li>
                <li>
                  รีสตาร์ท server (กด Ctrl+C แล้วรัน{" "}
                  <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">npm run both</code> ใหม่) แล้วกลับมากด
                  "ส่งข้อความเทสต์"
                </li>
              </ol>
            </div>
          )}
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-plum-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-2xl bg-plum-50 p-1">
              <button
                type="button"
                onClick={() => setView("day")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  view === "day" ? "bg-white text-blush-600 shadow" : "text-plum-600"
                }`}
              >
                คิวรายวัน
              </button>
              <button
                type="button"
                onClick={() => setView("week")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  view === "week" ? "bg-white text-blush-600 shadow" : "text-plum-600"
                }`}
              >
                ปฏิทินสัปดาห์
              </button>
              <button
                type="button"
                onClick={() => setView("all")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  view === "all" ? "bg-white text-blush-600 shadow" : "text-plum-600"
                }`}
              >
                คิวทั้งหมด
              </button>
            </div>
            {view === "day" ? (
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            ) : null}
            {view === "week" ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWeekOffset((o) => o - 1)}
                  className="rounded-full border-2 border-plum-200 px-3 py-1.5 text-sm font-semibold text-plum-600 transition hover:border-blush-400 hover:text-blush-600"
                >
                  ← ย้อน
                </button>
                <button
                  type="button"
                  onClick={() => setWeekOffset(0)}
                  className="rounded-full px-3 py-1.5 text-sm font-semibold text-plum-500"
                >
                  สัปดาห์นี้
                </button>
                <button
                  type="button"
                  onClick={() => setWeekOffset((o) => o + 1)}
                  className="rounded-full border-2 border-plum-200 px-3 py-1.5 text-sm font-semibold text-plum-600 transition hover:border-blush-400 hover:text-blush-600"
                >
                  ถัดไป →
                </button>
              </div>
            ) : null}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputClass}
            >
              <option value="all">ทุกสถานะ</option>
              <option value="pending">รอยืนยัน</option>
              <option value="confirmed">ยืนยันแล้ว</option>
              <option value="completed">เสร็จแล้ว</option>
              <option value="cancelled">ยกเลิก</option>
            </select>
            <span className="ml-auto text-sm text-plum-500">
              {loading ? "กำลังโหลด..." : `พบ ${bookings.length} รายการ`}
            </span>
          </div>

          {view === "week" ? (
            <WeekCalendar
              settings={settings}
              weekBookings={weekBookings}
              weekRange={weekRange()}
              today={today}
              onStatus={async (id, next) => {
                await changeStatus(id, next);
                const { from, to } = weekRange();
                apiAdmin.weekBookings(token, from, to).then(setWeekBookings).catch(() => {});
              }}
              onReload={() => {
                const { from, to } = weekRange();
                apiAdmin.weekBookings(token, from, to).then(setWeekBookings).catch(() => {});
              }}
            />
          ) : (
            <div className="mt-5 space-y-3">
              {!loading && bookings.length === 0 && (
                <p className="rounded-2xl bg-plum-50 px-5 py-8 text-center text-sm text-plum-600">
                  ไม่พบรายการคิว
                </p>
              )}
            {bookings.map((b) => (
              <div
                key={b.id}
                className="flex flex-col gap-3 rounded-3xl border-2 border-plum-100 p-4 transition hover:border-blush-200 sm:flex-row sm:items-center"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blush-100 to-plum-100 text-xl">
                  {b.icon || "💅"}
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-plum-900">{b.name}</p>
                    <span className="rounded-full bg-plum-100 px-2.5 py-0.5 text-xs font-semibold text-plum-700">
                      {b.ref}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[b.status]}`}
                    >
                      {statusLabel[b.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-plum-600">
                    {b.service_name} · {b.date} {b.time} น. · {b.phone}
                  </p>
                  {b.note && (
                    <p className="mt-1 text-xs text-plum-400">โน้ต: {b.note}</p>
                  )}
                  <p className="mt-0.5 text-xs text-plum-400">
                    จองเมื่อ {b.created_at} · ราคา {b.price.toLocaleString("th-TH")} บาท
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {b.status === "cancelled" ? (
                    <button
                      type="button"
                      onClick={() => changeStatus(b.id, "pending")}
                      className="rounded-full border-2 border-plum-200 px-3.5 py-1.5 text-xs font-semibold text-plum-600 transition hover:border-blush-400 hover:text-blush-600"
                    >
                      กู้คิวกลับ
                    </button>
                  ) : (
                    <>
                      {b.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => changeStatus(b.id, "confirmed")}
                          className="rounded-full bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600"
                        >
                          ✅ ยืนยัน
                        </button>
                      )}
                      {b.status === "confirmed" && (
                        <button
                          type="button"
                          onClick={() => changeStatus(b.id, "completed")}
                          className="rounded-full bg-blush-500 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blush-600"
                        >
                          💅 เสร็จแล้ว
                        </button>
                      )}
                      {nextOf(b.status) && (
                        <button
                          type="button"
                          onClick={() => changeStatus(b.id, "cancelled")}
                          className="rounded-full border-2 border-red-200 px-3.5 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                        >
                          ยกเลิก
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            </div>
          )}
        </div>

        <SettingsCard token={token} settings={settings} setSettings={setSettings} />

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-plum-100">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-plum-900">
                📋 จัดการราคาบริการ
              </h2>
              <p className="mt-1 text-sm text-plum-500">
                เพิ่ม แก้ไข หรือซ่อนบริการได้ที่นี่ — บริการที่ซ่อนจะไม่แสดงบนหน้าเว็บ
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  await apiAdmin.createService(token, {
                    name: "บริการใหม่",
                    icon: "💅",
                    price: 0,
                    duration: "60 นาที",
                  });
                  loadServices();
                } catch (e) {
                  alert(e.message);
                }
              }}
              className="rounded-full bg-gradient-to-r from-blush-500 to-plum-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blush-500/25 transition hover:scale-105"
            >
              ＋ เพิ่มบริการ
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase text-plum-500">
                  <th className="pb-3">บริการ</th>
                  <th className="pb-3">ราคา (บาท)</th>
                  <th className="pb-3">เวลาที่ใช้</th>
                  <th className="pb-3">แสดงผล</th>
                  <th className="pb-3">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <ServiceRow key={s.id} svc={s} token={token} onChanged={loadServices} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function timeToMin(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function minToTime(min) {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

function WeekCalendar({ settings, weekBookings, weekRange, today, onStatus }) {
  if (!settings) return null;

  const s = settings;
  const open = timeToMin(s.openTime);
  const close = timeToMin(s.closeTime);
  const step = s.slotMinutes;
  const slots = [];
  for (let t = open; t + step <= close; t += step) slots.push(minToTime(t));

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekRange.monday);
    d.setDate(d.getDate() + i);
    const fmt = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    days.push({ date: fmt, dow: d.getDay() });
  }

  const cell = (day, time) =>
    weekBookings.find((b) => b.date === day.date && b.time === time && b.status !== "cancelled");

  return (
    <div className="mt-5 overflow-x-auto">
      <div className="min-w-[860px]">
        <div className="grid grid-cols-[64px_repeat(7,1fr)] gap-2 text-xs font-semibold text-plum-600">
          <div />
          {days.map((d) => {
            const closed = s.closedDays?.includes(d.dow) || false;
            const isToday = d.date === today;
            return (
              <div key={d.date} className={`rounded-xl px-2 py-1.5 text-center ${closed ? "bg-red-50 text-red-500" : isToday ? "bg-blush-100 text-blush-700" : "bg-plum-50"}`}>
                <div>วัน{s.dayNames[d.dow]}</div>
                <div className="mt-0.5 text-[10px] opacity-70">{d.date.split("-").slice(2).join("/")}</div>
                {closed && <div className="mt-0.5 text-[10px] font-semibold">หยุด</div>}
              </div>
            );
          })}

          {slots.map((time) => (
            <Fragment key={time}>
              <div className="self-center pr-2 text-right text-xs font-semibold text-plum-500">
                {time}
              </div>
              {days.map((d) => {
                const b = cell(d, time);
                const closed = s.closedDays?.includes(d.dow) || false;
                return (
                  <div
                    key={d.date + time}
                    onClick={() => {
                      if (!b || !onStatus) return;
                      const next =
                        b.status === "pending"
                          ? "confirmed"
                          : b.status === "confirmed"
                            ? "completed"
                            : null;
                      if (next) onStatus(b.id, next);
                    }}
                    className={`min-h-[56px] rounded-xl border-2 p-1.5 ${
                      closed
                        ? "border-red-100 bg-red-50"
                        : b
                          ? `cursor-pointer ${
                              b.status === "confirmed"
                                ? "border-emerald-200 bg-emerald-50 hover:border-emerald-400"
                                : b.status === "completed"
                                  ? "border-blush-200 bg-blush-50 opacity-70"
                                  : "border-amber-200 bg-amber-50 hover:border-amber-400"
                            }`
                          : "border-plum-100 bg-plum-50/40"
                    }`}
                  >
                    {b ? (
                      <div className="text-[11px] leading-tight">
                        <div className="truncate font-bold text-plum-900">{b.name}</div>
                        <div className="truncate text-plum-600">
                          {b.icon} {b.service_name}
                        </div>
                        <span className={`mt-1 inline-block rounded-full px-1.5 py-px text-[10px] font-semibold ${statusColor[b.status]}`}>
                          {statusLabel[b.status]}
                        </span>
                        {b.status !== "completed" && b.status !== "cancelled" && (
                          <div className="mt-1 flex gap-1">
                            {b.status === "pending" && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStatus?.(b.id, "confirmed");
                                }}
                                className="rounded-full bg-emerald-500 px-2 py-px text-[9px] font-bold text-white transition hover:bg-emerald-600"
                              >
                                ✓ ยืนยัน
                              </button>
                            )}
                            {b.status === "confirmed" && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStatus?.(b.id, "completed");
                                }}
                                className="rounded-full bg-blush-500 px-2 py-px text-[9px] font-bold text-white transition hover:bg-blush-600"
                              >
                                💅 เสร็จ
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onStatus?.(b.id, "cancelled");
                              }}
                              className="rounded-full bg-white/90 px-2 py-px text-[9px] font-bold text-red-500 ring-1 ring-red-200 transition hover:bg-red-50"
                            >
                              ยกเลิก
                            </button>
                          </div>
                        )}
                      </div>
                    ) : closed ? (
                      <span className="text-[10px] text-red-400">ปิด</span>
                    ) : (
                      <span className="text-[10px] text-plum-300">ว่าง</span>
                    )}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-plum-500">
        สล็อตตามที่ตั้งค่าใน "ตั้งค่าเวลาเปิด-ปิด" · กดคิวรายวันเพื่อยืนยัน/เสร็จแล้วได้
      </p>
    </div>
  );
}

function SettingsCard({ token, settings, setSettings }) {
  if (!settings) return null;
  return (
    <SettingsForm key={JSON.stringify(settings)} token={token} settings={settings} setSettings={setSettings} />
  );
}

function SettingsForm({ token, settings, setSettings }) {
  const openRef = useRef(settings.openTime);
  const closeRef = useRef(settings.closeTime);
  const slotRef = useRef(settings.slotMinutes);
  const [closedDays, setClosedDays] = useState(settings.closedDays || []);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const toggleDay = (d) =>
    setClosedDays((arr) => (arr.includes(d) ? arr.filter((x) => x !== d) : [...arr, d].sort()));

  const save = async () => {
    setMsg("");
    setBusy(true);
    try {
      const updated = await apiAdmin.updateSettings(token, {
        openTime: openRef.current.value,
        closeTime: closeRef.current.value,
        slotMinutes: Number(slotRef.current.value),
        closedDays,
      });
      setSettings(updated);
      setMsg("บันทึกแล้ว ✓ ระบบคิวใช้เวลาใหม่ทันที");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-plum-100">
      <h2 className="font-display text-xl font-bold text-plum-900">⏰ ตั้งค่าเวลาเปิด-ปิดร้าน</h2>
      <p className="mt-1 text-sm text-plum-500">
        เปลี่ยนแล้วระบบคิว/ปฏิทิน/หน้าลูกค้าใช้ทันที ไม่ต้องแก้โค้ด
      </p>
      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-plum-800">เวลาเปิดร้าน</span>
          <input type="time" defaultValue={settings.openTime} ref={openRef} className="w-full rounded-2xl border-2 border-plum-100 px-4 py-2.5 text-sm outline-none focus:border-blush-400" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-plum-800">เวลาปิดร้าน</span>
          <input type="time" defaultValue={settings.closeTime} ref={closeRef} className="w-full rounded-2xl border-2 border-plum-100 px-4 py-2.5 text-sm outline-none focus:border-blush-400" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-plum-800">สล็อตคิวละ (นาที)</span>
          <select defaultValue={settings.slotMinutes} ref={slotRef} className="w-full rounded-2xl border-2 border-plum-100 bg-white px-4 py-2.5 text-sm outline-none focus:border-blush-400">
            {[15, 30, 45, 60, 90, 120].map((m) => (
              <option key={m} value={m}>{m} นาที</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-5">
        <span className="mb-1.5 block text-sm font-medium text-plum-800">วันหยุดประจำสัปดาห์</span>
        <div className="flex flex-wrap gap-2">
          {["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"].map((name, d) => {
            const on = closedDays.includes(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  on
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-plum-50 text-plum-700 hover:bg-plum-100"
                }`}
              >
                {on ? "✕ " : ""}{name}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="rounded-full bg-plum-800 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-plum-900 disabled:opacity-50"
        >
          {busy ? "กำลังบันทึก..." : "บันทึกเวลาเปิด-ปิด"}
        </button>
        {msg && <span className="text-sm font-medium text-emerald-700">{msg}</span>}
      </div>
    </div>
  );
}

function ServiceRow({ svc, token, onChanged }) {
  const [name, setName] = useState(svc.name);
  const [icon, setIcon] = useState(svc.icon);
  const [price, setPrice] = useState(svc.price);
  const [duration, setDuration] = useState(svc.duration);
  const [active, setActive] = useState(!!svc.active);
  const [saved, setSaved] = useState(false);

  const save = async (overrides = {}) => {
    try {
      await apiAdmin.updateService(token, svc.id, {
        name,
        icon,
        price: Number(price),
        duration,
        active,
        ...overrides,
      });
    } catch (e) {
      alert(e.message);
      return false;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    return true;
  };

  const remove = async () => {
    if (!window.confirm(`ลบ "${svc.name}" ออกจากรายการใช่ไหม?`)) return;
    try {
      await apiAdmin.deleteService(token, svc.id);
      onChanged?.();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <tr className="border-t border-plum-100">
      <td className="py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-12 rounded-xl border-2 border-plum-100 px-2 py-1.5 text-center text-plum-900 outline-none focus:border-blush-400"
            maxLength={4}
            aria-label="ไอคอนบริการ"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="min-w-[180px] flex-1 rounded-xl border-2 border-plum-100 px-3 py-1.5 font-semibold text-plum-900 outline-none focus:border-blush-400"
            aria-label="ชื่อบริการ"
          />
        </div>
        {svc.popular ? (
          <span className="mt-1 inline-block text-xs text-blush-500">🔥 ขายดี</span>
        ) : null}
      </td>
      <td className="py-3">
        <input
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-28 rounded-xl border-2 border-plum-100 px-3 py-1.5 text-plum-900 outline-none focus:border-blush-400"
        />
      </td>
      <td className="py-3">
        <input
          type="text"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-28 rounded-xl border-2 border-plum-100 px-3 py-1.5 text-plum-900 outline-none focus:border-blush-400"
        />
      </td>
      <td className="py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const next = !active;
              setActive(next);
              save({ active: next });
            }}
            className={`h-6 w-11 rounded-full transition ${active ? "bg-emerald-500" : "bg-plum-200"}`}
            aria-label="เปิด/ปิดการแสดงผล"
          >
            <span
              className={`block h-5 w-5 rounded-full bg-white shadow transition ${active ? "translate-x-5" : "translate-x-0.5"}`}
            />
          </button>
          <span className="text-xs text-plum-500">{active ? "โชว์" : "ซ่อน"}</span>
        </div>
      </td>
      <td className="py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={save}
            className="rounded-full bg-plum-800 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-plum-900"
          >
            {saved ? "บันทึกแล้ว ✓" : "บันทึก"}
          </button>
          <button
            type="button"
            onClick={remove}
            className="rounded-full border-2 border-red-200 px-3.5 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50"
          >
            ลบ
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    const handler = () => {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
    };
    window.addEventListener('admin-unauthorized', handler);
    return () => window.removeEventListener('admin-unauthorized', handler);
  }, []);

  if (!token) return <Login onLogin={setToken} />;
  return <Dashboard token={token} onLogout={() => setToken(null)} />;
}