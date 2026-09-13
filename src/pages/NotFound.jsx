import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  useEffect(() => {
    document.title = "ไม่พบหน้านี้ | Nail & Salon";
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blush-50 to-pink-100 px-6 text-center">
      <span className="text-6xl">💅</span>
      <h1 className="mt-6 font-display text-5xl font-bold text-plum-900">404</h1>
      <p className="mt-3 max-w-sm text-lg font-medium text-plum-700">
        ไม่พบหน้านี้ในเว็บของเรา กลับไปหน้าแรกหรือจองคิวได้เลย
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="rounded-full bg-plum-800 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-plum-900"
        >
          กลับหน้าหลัก
        </Link>
        <Link
          to="/booking"
          className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-plum-800 shadow-lg ring-1 ring-plum-200 transition hover:scale-105"
        >
          จองคิวเลย
        </Link>
      </div>
    </div>
  );
}