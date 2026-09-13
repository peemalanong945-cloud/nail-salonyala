import { Link } from "react-router-dom";

export default function CtaBanner() {
  return (
    <section className="py-10 lg:py-14">
      <div className="mx-auto max-w-6xl px-5">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blush-500 via-blush-400 to-plum-500 px-8 py-14 text-center text-white shadow-2xl shadow-blush-500/30 sm:px-14">
          <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 -bottom-24 h-72 w-72 rounded-full bg-plum-800/30 blur-3xl" />

          <span className="text-4xl">💖</span>
          <h2 className="mx-auto mt-4 max-w-xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
            พร้อมสวยแล้วหรือยัง?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-blush-50/95">
            คิวว่างวันนี้มีจำกัด จองล่วงหน้าเพื่อรับเวลาที่ตรงใจที่สุด ไม่ต้องรอคิว
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/booking"
              className="rounded-full bg-white px-8 py-4 font-semibold text-blush-600 shadow-lg transition hover:scale-105"
            >
              จองคิวเลย
            </Link>
            <Link
              to="/price"
              className="rounded-full border-2 border-white/60 px-7 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/15"
            >
              ดูราคาเต็ม
            </Link>
            <a
              href="tel:0639819924"
              className="rounded-full border-2 border-white/60 px-7 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/15"
            >
              📞 063-981-9924
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}