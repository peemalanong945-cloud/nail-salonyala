import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ShareButton from "./ShareButton";
import { api } from "../api";

const stats = [
  { value: "8+", label: "ปีประสบการณ์" },
  { value: "1,200+", label: "ลูกค้าประจำ" },
  { value: "4.9", label: "คะแนนรีวิว" },
];

export default function Hero() {
  const [today, setToday] = useState(new Date().toISOString().split("T")[0]);
  const [live, setLive] = useState(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const [settings, slots] = await Promise.all([api.settings(), api.slots(today)]);
        if (ignore) return;
        setLive({
          closed: (settings.closedDays || []).includes(new Date(today + "T00:00:00").getDay()),
          free: Array.isArray(slots) ? slots.length : 0,
        });
      } catch {
        if (!ignore) setLive(null);
      }
    };
    load();
    const timer = setInterval(load, 45000);
    return () => {
      ignore = true;
      clearInterval(timer);
    };
  }, [today]);

  useEffect(() => {
    const onFocus = () => setToday(new Date().toISOString().split("T")[0]);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-b from-blush-100 via-blush-50 to-blush-50 pt-28 pb-16 lg:pt-36 lg:pb-24"
    >
      <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-blush-300/40 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -left-32 h-96 w-96 rounded-full bg-plum-300/30 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-blush-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-blush-500" />
            เปิดทุกวัน 09:00 - 20:00 น. (หยุดวันอาทิตย์)
          </span>
          <h1 className="mt-5 font-display text-4xl leading-tight font-bold tracking-tight text-plum-900 sm:text-5xl lg:text-6xl">
            งามปลายนิ้ว
            <br />
            <span className="bg-gradient-to-r from-blush-500 to-plum-500 bg-clip-text text-transparent">
              สวยแบบคุณ
            </span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-plum-700 sm:text-lg">
            ครบทุกความต้องการในเรื่องความสวยของมือและเท้า ทั้งทำเล็บเจล ต่อเล็บ
            เพ้นท์ลาย ใช้ผลิตภัณฑ์คุณภาพ จองคิวออนไลน์ได้ตลอด 24 ชั่วโมง
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/booking"
              className="rounded-full bg-gradient-to-r from-blush-500 to-plum-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blush-500/30 transition hover:scale-105 hover:shadow-blush-500/40"
            >
              จองคิวออนไลน์
            </Link>
            <Link
              to="/price"
              className="rounded-full border-2 border-plum-300 bg-white/70 px-7 py-3.5 font-semibold text-plum-800 backdrop-blur-sm transition hover:border-blush-400 hover:text-blush-600"
            >
              ดูราคา
            </Link>
            <ShareButton />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {live ? (
              live.closed ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-red-500 shadow-sm ring-1 ring-red-100">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  วันนี้ร้านปิด
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                  คิวว่างวันนี้ {live.free} ช่วงเวลา
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-plum-500 shadow-sm">
                กำลังโหลดคิวสด...
              </span>
            )}
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-plum-600 shadow-sm ring-1 ring-plum-100">
              🔄 อัปเดตอัตโนมัติทุก 45 วินาที
            </span>
          </div>

          <dl className="mt-10 flex gap-10 border-t border-blush-200/70 pt-6">
            {stats.map((s) => (
              <div key={s.label}>
                <dd className="font-display text-2xl font-bold text-blush-600 sm:text-3xl">
                  {s.value}
                </dd>
                <dt className="mt-0.5 text-sm text-plum-600">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.75rem] bg-gradient-to-br from-blush-300 via-blush-100 to-plum-200 shadow-2xl shadow-plum-400/30 ring-1 ring-white/70">
            <img
              src="/gallery/1.jpg"
              alt="ผลงานทำเล็บของร้าน Nail & Salon"
              loading="eager"
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-plum-900/50 via-transparent to-transparent" />

            <span className="absolute top-5 right-5 grid h-16 w-16 rotate-6 place-items-center rounded-2xl bg-white/85 text-3xl shadow-lg backdrop-blur">
              💅
            </span>
            <span className="absolute top-24 -left-3 grid h-12 w-12 -rotate-6 place-items-center rounded-2xl bg-white/85 text-2xl shadow-lg backdrop-blur">
              ✨
            </span>
            <span className="absolute top-40 -right-2 grid h-12 w-12 rotate-3 place-items-center rounded-2xl bg-white/85 text-2xl shadow-lg backdrop-blur">
              🌷
            </span>

            <div className="absolute inset-x-5 bottom-5 rounded-3xl bg-white/90 p-4 shadow-xl backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blush-400 to-plum-500 text-xl text-white">
                  👑
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-plum-900">
                    ยินดีต้อนรับสู่ Nail & Salon
                  </p>
                  <p className="truncate text-sm text-plum-600">
                    ร้านทำเล็บใจกลางเมืองยะลา · โทร 063-981-9924
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}