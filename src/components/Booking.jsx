import { useEffect, useState } from "react";
import { api } from "../api";
import { categoryOrder } from "../data";

const today = new Date().toISOString().split("T")[0];

function fmtPrice(service) {
  if (!service) return "";
  if (service.price_range) return `${service.price_range} บาท`;
  const p = Number(service.price || 0);
  return p === 0 ? "ฟรี" : `${p.toLocaleString("th-TH")} บาท`;
}

const statusLabel = {
  pending: "รอยืนยัน",
  confirmed: "ยืนยันแล้ว",
  completed: "เสร็จแล้ว",
  cancelled: "ยกเลิก",
};

export default function Booking() {
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [activeCat, setActiveCat] = useState("");
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(null);
  const [form, setForm] = useState({
    service: "",
    date: today,
    time: "",
    name: "",
    phone: "",
    note: "",
  });

  const [phoneCheck, setPhoneCheck] = useState("");
  const [myBookings, setMyBookings] = useState(null);
  const [checkMsg, setCheckMsg] = useState("");

  const catsOf = (list) =>
    [...new Set(list.map((s) => s.category).filter(Boolean))].sort(
      (a, b) =>
        (categoryOrder.indexOf(a) === -1 ? 99 : categoryOrder.indexOf(a)) -
        (categoryOrder.indexOf(b) === -1 ? 99 : categoryOrder.indexOf(b))
    );

  useEffect(() => {
    api
      .services()
      .then((list) => {
        setServices(list);
        const first = catsOf(list)[0];
        setActiveCat((prev) => (prev && catsOf(list).includes(prev) ? prev : first || ""));
      })
      .catch((e) => setError(e.message));
    api.settings().then(setSettings).catch(() => {});
  }, [setActiveCat]);

  const cats = catsOf(services);
  const selectedSvc = services.find((s) => s.id === form.service) || null;

  useEffect(() => {
    let ignore = false;
    if (!form.date) return;
    api
      .slots(form.date)
      .then((s) => !ignore && setSlots(s))
      .catch(() => !ignore && setSlots([]))
      .finally(() => !ignore && setSlotsLoading(false));
    return () => {
      ignore = true;
    };
  }, [form.date]);

  const update = (field) => (e) => {
    const val = e.target.value;
    if (field === "date") {
      setSlotsLoading(true);
      setForm((f) => ({ ...f, date: val, time: "" }));
      return;
    }
    setForm((f) => ({ ...f, [field]: val }));
  };

  const isClosedDay = (date) => {
    const sel = settings;
    const dow = new Date(date + "T00:00:00").getDay();
    if (!sel) return dow === 0;
    return (sel.closedDays || [0]).includes(dow);
  };
  const closedDayName = (date) => {
    const dow = new Date(date + "T00:00:00").getDay();
    return settings?.dayNames?.[dow] || "วันนี้";
  };

  const validated =
    form.service && form.time && form.name.trim() && form.phone.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await api.createBooking(form);
      setConfirmed(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setConfirmed(null);
    setError("");
    setForm((f) => ({ ...f, service: "", time: "", name: "", phone: "", note: "" }));
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    setCheckMsg("");
    setMyBookings(null);
    try {
      const rows = await api.lookup(phoneCheck);
      setMyBookings(rows);
      if (rows.length === 0) setCheckMsg("ไม่พบคิวที่จองด้วยเบอร์นี้");
    } catch (err) {
      setCheckMsg(err.message);
    }
  };

  const handleCancel = async (ref) => {
    if (!window.confirm(`แน่ใจว่าจะยกเลิกคิว ${ref}?`)) return;
    try {
      await api.cancel(ref, phoneCheck);
      handleLookup({ preventDefault: () => {} });
    } catch (err) {
      setCheckMsg(err.message);
    }
  };

  const inputClass =
    "w-full rounded-2xl border-2 border-plum-100 bg-white px-4 py-3 text-sm text-plum-900 outline-none transition placeholder:text-plum-300 focus:border-blush-400 focus:ring-4 focus:ring-blush-200/40";

  return (
    <section
      id="booking"
      className="relative overflow-hidden bg-gradient-to-br from-blush-100 via-blush-50 to-plum-100 py-20 lg:py-28"
    >
      <div className="pointer-events-none absolute -top-20 right-0 h-72 w-72 rounded-full bg-blush-300/40 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <span className="text-sm font-semibold tracking-widest text-blush-500 uppercase">
              จองคิวออนไลน์
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-plum-900 sm:text-4xl">
              จองคิวล่วงหน้า ไม่ต้องรอคิว
            </h2>
            <p className="mt-4 max-w-md text-plum-700">
              กรอกข้อมูลให้ครบ แล้วร้านจะยืนยันทางโทรศัพท์หรือไลน์ภายใน 30 นาที
              ยกเลิกหรือเลื่อนคิวได้ฟรี ก่อนถึงเวลานัด 2 ชั่วโมง
            </p>

            <ul className="mt-8 space-y-4">
              {[
                { emoji: "🗓️", text: "จองล่วงหน้าได้สูงสุด 30 วัน" },
                { emoji: "⏰", text: "ถึงเวลาไม่ต้องรอ ลงมือทำเลยทันที" },
                { emoji: "💰", text: "ชำระเงินหน้าร้าน ถึงคิวแล้วค่อยจ่าย" },
                { emoji: "🔄", text: "เลื่อนหรือยกเลิกคิวได้ฟรี" },
                { emoji: "⛔", text: `วัน${settings?.closedDaysText ?? "อาทิตย์"}ร้านหยุด ไม่สามารถจองได้` },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-plum-100">
                    {item.emoji}
                  </span>
                  <span className="font-medium text-plum-800">{item.text}</span>
                </li>
              ))}
            </ul>

            <form
              onSubmit={handleLookup}
              className="mt-8 rounded-3xl bg-white/70 p-6 ring-1 ring-white/80 backdrop-blur"
            >
              <h3 className="font-display text-lg font-bold text-plum-900">
                🔍 เช็คคิวของฉัน
              </h3>
              <div className="mt-3 flex gap-2">
                <input
                  type="tel"
                  required
                  placeholder="กรอกเบอร์โทรที่ใช้จองคิว"
                  value={phoneCheck}
                  onChange={(e) => setPhoneCheck(e.target.value)}
                  className={inputClass}
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-2xl bg-gradient-to-r from-blush-500 to-plum-500 px-5 text-sm font-semibold text-white shadow-md transition hover:scale-105"
                >
                  เช็ค
                </button>
              </div>
              {checkMsg && <p className="mt-3 text-sm text-plum-700">{checkMsg}</p>}
              {myBookings && myBookings.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {myBookings.map((b) => (
                    <li
                      key={b.id}
                      className="flex items-center justify-between gap-2 rounded-2xl bg-white p-3 text-sm shadow-sm ring-1 ring-plum-100"
                    >
                      <span>
                        {b.icon} {b.service_name} · {b.date} {b.time} น.
                      </span>
                      <span className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            b.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-700"
                              : b.status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : b.status === "completed"
                                  ? "bg-blush-100 text-blush-700"
                                  : "bg-red-100 text-red-600"
                          }`}
                        >
                          {statusLabel[b.status]}
                        </span>
                        {b.status !== "completed" && b.status !== "cancelled" && (
                          <button
                            type="button"
                            onClick={() => handleCancel(b.ref)}
                            className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            ยกเลิก
                          </button>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-xs text-plum-500">
                รหัสคิว เช่น NS123456 ประกอบด้วย N + S + 6 หลัก
              </p>
            </form>
          </div>

          <div className="rounded-[2rem] bg-white p-7 shadow-2xl shadow-plum-400/20 ring-1 ring-plum-100 lg:p-9">
            {confirmed ? (
              <div className="flex flex-col items-center py-10 text-center">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-blush-400 to-plum-500 text-4xl text-white shadow-xl shadow-blush-400/40">
                  ✓
                </span>
                <h3 className="mt-6 font-display text-2xl font-bold text-plum-900">
                  จองคิวเรียบร้อย! 🎉
                </h3>
                <p className="mt-2 text-sm text-plum-700">
                  รหัสคิวของคุณคือ{" "}
                  <span className="rounded-lg bg-blush-100 px-2 py-0.5 text-lg font-bold text-blush-700">
                    {confirmed.ref}
                  </span>
                </p>
                <p className="mt-3 max-w-sm text-plum-700">
                  ขอบคุณคุณ{form.name} เราจะติดต่อกลับที่เบอร์{" "}
                  <span className="font-semibold">{form.phone}</span> เพื่อยืนยันคิว{" "}
                  <span className="font-semibold">{form.date}</span> เวลา{" "}
                  <span className="font-semibold">{form.time} น.</span>
                </p>
                <div className="mt-4 rounded-2xl bg-blush-50 px-5 py-3 text-sm text-blush-700">
                  {confirmed.service?.icon} {confirmed.service?.name} · ราคา{" "}
                  {fmtPrice(confirmed.service)}
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="mt-8 rounded-full border-2 border-blush-300 px-6 py-2.5 text-sm font-semibold text-blush-600 transition hover:bg-blush-500 hover:border-blush-500 hover:text-white"
                >
                  จองคิวใหม่
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold text-plum-900">
                    กรอกข้อมูลเพื่อจองคิว
                  </h3>
                  <span className="rounded-full bg-plum-50 px-3 py-1 text-xs font-semibold text-plum-600 ring-1 ring-plum-100">
                    3 ขั้นตอน
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {["เลือกบริการ", "เลือกวัน-เวลา", "ข้อมูลติดต่อ"].map((label, i) => {
                    const done =
                      (i === 0 && Boolean(form.service)) ||
                      (i === 1 && Boolean(form.time)) ||
                      (i === 2 && form.name.trim() && form.phone.trim());
                    return (
                      <div key={label} className="flex flex-1 items-center gap-1.5">
                        <div
                          className={`flex-1 rounded-full py-1 text-center text-[11px] font-semibold transition ${
                            done ? "bg-gradient-to-r from-blush-400 to-plum-500 text-white" : "bg-plum-50 text-plum-500"
                          }`}
                        >
                          {done ? "✓ " : `${i + 1}. `}
                          {label}
                        </div>
                        {i < 2 && <span className="text-plum-300">›</span>}
                      </div>
                    );
                  })}
                </div>

                {error && (
                  <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 ring-1 ring-red-100">
                    {error}
                  </p>
                )}

                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-blush-400 to-plum-500 text-xs font-bold text-white">
                      1
                    </span>
                    <label className="text-sm font-semibold text-plum-800">เลือกบริการ *</label>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-2">
                    {cats.map((cat) => {
                      const active = activeCat === cat;
                      const count = services.filter((s) => s.category === cat).length;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setActiveCat(cat)}
                          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                            active
                              ? "bg-plum-700 text-white shadow-lg shadow-plum-700/25"
                              : "bg-plum-50 text-plum-700 ring-1 ring-plum-100 hover:bg-plum-100"
                          }`}
                        >
                          {cat}
                          <span className={`ml-1.5 text-xs ${active ? "text-blush-200" : "text-plum-400"}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                    {cats.length === 0 && (
                      <p className="rounded-2xl bg-plum-50 p-4 text-center text-sm text-plum-500">
                        กำลังโหลดรายการบริการ...
                      </p>
                    )}
                    {services
                      .filter((s) => s.category === activeCat)
                      .map((s) => {
                        const active = form.service === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, service: s.id }))}
                            className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition ${
                              active
                                ? "border-blush-400 bg-blush-50 ring-4 ring-blush-200/40"
                                : "border-plum-100 bg-white hover:border-plum-200 hover:bg-plum-50/50"
                            }`}
                          >
                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-2xl shadow-sm ring-1 ring-plum-100">
                              {s.icon}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold text-plum-900">{s.name}</span>
                              {s.description && (
                                <span className="mt-0.5 block text-xs leading-snug text-plum-500">
                                  {s.description}
                                </span>
                              )}
                            </span>
                            <span className="shrink-0 text-right">
                              <span className="block text-sm font-bold text-blush-600">{fmtPrice(s)}</span>
                              <span className="block text-xs text-plum-400">
                                {s.duration || "60 นาที"}
                              </span>
                            </span>
                            <span
                              className={`ml-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-xs font-bold text-white transition ${
                                active ? "border-blush-500 bg-blush-500" : "border-plum-200 bg-transparent"
                              }`}
                            >
                              {active ? "✓" : ""}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="date" className="mb-1.5 block text-sm font-medium text-plum-800">
                      <span className="mr-1 inline-grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-blush-400 to-plum-500 text-[10px] font-bold text-white">
                        2
                      </span>
                      วันที่ *
                    </label>
                    <input
                      id="date"
                      type="date"
                      required
                      min={today}
                      value={form.date}
                      onChange={update("date")}
                      className={inputClass}
                    />
                    {isClosedDay(form.date) && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        วัน{closedDayName(form.date)}ร้านหยุด ไม่สามารถจองได้
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="time" className="mb-1.5 block text-sm font-medium text-plum-800">
                      เวลา *
                    </label>
                    <select
                      id="time"
                      required
                      disabled={slotsLoading || isClosedDay(form.date)}
                      value={form.time}
                      onChange={update("time")}
                      className={`${inputClass} disabled:cursor-not-allowed disabled:bg-plum-50`}
                    >
                      <option value="">
                        {isClosedDay(form.date)
                          ? "ร้านปิดในวันนี้"
                          : slotsLoading
                            ? "กำลังโหลด..."
                            : slots.length === 0
                              ? "คิวเต็มทั้งวัน"
                              : "-- เลือกเวลา --"}
                      </option>
                      {!isClosedDay(form.date) &&
                        slots.map((t) => (
                          <option key={t} value={t}>
                            {t} น.
                          </option>
                        ))}
                    </select>
                    {!slotsLoading && !isClosedDay(form.date) && slots.length > 0 && (
                      <p className="mt-1.5 text-xs text-plum-500">
                        เหลือ {slots.length} ช่วงเวลาว่างในวันนี้
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-plum-800">
                      <span className="mr-1 inline-grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-blush-400 to-plum-500 text-[10px] font-bold text-white">
                        3
                      </span>
                      ชื่อ-นามสกุล *
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="เช่น สมชาย ใจดี"
                      value={form.name}
                      onChange={update("name")}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-plum-800">
                      เบอร์โทรศัพท์ *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      pattern="[0-9+ -]{9,}"
                      placeholder="0XX-XXX-XXXX"
                      value={form.phone}
                      onChange={update("phone")}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="note" className="mb-1.5 block text-sm font-medium text-plum-800">
                    โน้ตเพิ่มเติม (ไม่บังคับ)
                  </label>
                  <textarea
                    id="note"
                    rows={3}
                    placeholder="เช่น อยากได้ทรงเล็บแบบนี้ สีไหน ..."
                    value={form.note}
                    onChange={update("note")}
                    className={inputClass}
                  />
                </div>

                {selectedSvc && form.time && (
                  <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blush-500 to-plum-500 p-4 text-white shadow-lg shadow-blush-500/25">
                    <span className="text-2xl">{selectedSvc.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{selectedSvc.name}</p>
                      <p className="text-xs text-white/85">
                        {form.date} · {form.time} น. · {selectedSvc.duration || "60 นาที"}
                      </p>
                    </div>
                    <span className="shrink-0 text-lg font-bold">{fmtPrice(selectedSvc)}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!validated || submitting || isClosedDay(form.date)}
                  className="w-full rounded-full bg-gradient-to-r from-blush-500 to-plum-500 py-3.5 font-semibold text-white shadow-xl shadow-blush-500/25 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "กำลังจอง..." : "ยืนยันการจองคิว"}
                </button>
                <p className="text-center text-xs text-plum-500">
                  กดยืนยัน = ตกลงให้ติดต่อกลับเพื่อยืนยันคิว
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}