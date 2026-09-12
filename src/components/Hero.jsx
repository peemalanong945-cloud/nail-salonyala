import { useEffect, useState } from "react";
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
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#booking"
              className="rounded-full bg-gradient-to-r from-blush-500 to-plum-500 px-7 py-3.5 font-semibold text-white shadow-xl shadow-blush-500/30 transition hover:scale-105 hover:shadow-blush-500/40"
            >
              จองคิวออนไลน์
            </a>
            <a
              href="#gallery"
              className="rounded-full border-2 border-plum-300 bg-white/60 px-7 py-3.5 font-semibold text-plum-800 backdrop-blur-sm transition hover:border-blush-400 hover:text-blush-600"
            >
              ดูผลงาน
            </a>
            <ShareButton />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
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

          <dl className="mt-10 flex gap-8">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="order-2 text-sm text-plum-600">{s.label}</dt>
                <dd className="font-display text-2xl font-bold text-blush-600 sm:text-3xl">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blush-300 via-blush-100 to-plum-200 shadow-2xl shadow-plum-400/30 ring-1 ring-white/60">
            <div className="absolute inset-0 animate-float">
              <div className="absolute top-10 right-10 grid h-20 w-20 place-items-center rounded-2xl bg-white/80 text-4xl shadow-lg backdrop-blur rotate-3">
                💅
              </div>
              <div className="absolute top-40 left-8 grid h-16 w-16 place-items-center rounded-2xl bg-white/80 text-3xl shadow-lg backdrop-blur -rotate-6">
                ✨
              </div>
              <div className="absolute bottom-16 right-6 grid h-24 w-24 place-items-center rounded-2xl bg-white/80 text-4xl shadow-lg backdrop-blur">
                🌷
              </div>
              <div className="absolute bottom-48 left-16 grid h-14 w-14 place-items-center rounded-full bg-white/80 text-2xl shadow-lg backdrop-blur">
                🎀
              </div>
            </div>
            <div className="absolute inset-x-8 bottom-8 rounded-3xl bg-white/85 p-5 shadow-xl backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blush-400 to-plum-500 text-xl text-white">
                  👑
                </span>
                <div>
                  <p className="font-semibold text-plum-900">ยินดีต้อนรับสู่ Nail & Salon</p>
                  <p className="text-sm text-plum-600">ร้านทำเล็บใจกลางเมืองยะลา</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}