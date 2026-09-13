import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ShareButton from "./ShareButton";
import { api } from "../api";

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
      className="relative overflow-hidden bg-gradient-to-b from-blush-100 via-blush-50 to-white pt-28 pb-20 lg:pt-36 lg:pb-28"
    >
      <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-blush-300/40 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -left-32 h-96 w-96 rounded-full bg-plum-300/30 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-semibold text-blush-600 shadow-sm ring-1 ring-blush-100 backdrop-blur">
            💅 ร้านทำเล็บน่ารัก · ยะลา
          </span>
          <h1 className="mt-6 font-display text-4xl leading-tight font-bold tracking-tight text-plum-900 sm:text-5xl lg:text-6xl">
            งามปลายนิ้ว
            <br />
            <span className="bg-gradient-to-r from-blush-500 to-plum-500 bg-clip-text text-transparent">
              สวยแบบคุณ
            </span>
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-plum-600">
            จองคิวไม่กี่คลิก แล้วมาพักผ่อนให้สวยได้ในแบบของคุณ
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

          <div className="mt-7">
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
          </div>
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
            <div className="absolute inset-0 bg-gradient-to-t from-plum-900/30 via-transparent to-transparent" />
            <span className="absolute top-5 right-5 grid h-14 w-14 rotate-6 place-items-center rounded-2xl bg-white/85 text-2xl shadow-lg backdrop-blur">
              💅
            </span>
            <span className="absolute -bottom-4 left-6 grid h-12 w-12 -rotate-6 place-items-center rounded-2xl bg-white/85 text-xl shadow-lg backdrop-blur">
              ✨
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}