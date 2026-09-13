import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SectionHeading from "../components/SectionHeading";
import { Skeleton } from "../components/Loader";
import ShareLinks from "../components/ShareLinks";
import { api } from "../api";
import { categoryOrder } from "../data";

function fmt(price, range) {
  if (range) return range;
  if (!price) return "ฟรี";
  return `${price.toLocaleString("th-TH")}`;
}

export default function PriceListPage() {
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.services().then(setServices).catch((e) => setError(e.message));
  }, []);

  const cats = [...new Set(services.map((s) => s.category).filter(Boolean))].sort(
    (a, b) => (categoryOrder.indexOf(a) === -1 ? 99 : categoryOrder.indexOf(a)) - (categoryOrder.indexOf(b) === -1 ? 99 : categoryOrder.indexOf(b))
  );

  return (
    <>
      <Navbar />
      <main className="pt-24">
        <section className="mx-auto max-w-6xl px-5">
          <SectionHeading
            eyebrow="ราคาบริการ"
            title="ราคามิตรภาพ ใสสะอาด"
            sub="ราคานี้คิดตามบริการแต่ละรายการ สอบถามรายละเอียดเพิ่มเติมได้ที่ร้าน"
          />

          <ShareLinks
            title="Nail & Salon ราคาทำเล็บ จองออนไลน์ได้เลย"
            path="/price"
            className="mt-6"
          />

          {error && (
            <p className="mt-8 rounded-3xl bg-red-50 p-5 text-center text-sm font-medium text-red-600 ring-1 ring-red-100">
              โหลดราคาไม่สำเร็จ: {error}
            </p>
          )}

          {services.length === 0 && !error && (
            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-plum-100"
                >
                  <Skeleton className="h-6 w-32" />
                  <div className="mt-4 space-y-4">
                    {Array.from({ length: 4 }).map((__, j) => (
                      <div key={j} className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-xl" />
                          <div className="space-y-1.5">
                            <Skeleton className="h-3.5 w-36" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-14 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {services.length > 0 && (
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {cats.map((cat) => {
              const items = services.filter((s) => s.category === cat);
              return (
                <div
                  key={cat}
                  className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-plum-100"
                >
                  <h2 className="font-display text-xl font-bold text-plum-900">{cat}</h2>
                  <ul className="mt-4 divide-y divide-plum-100">
                    {items.map((s) => (
                      <li key={s.id} className="flex items-start justify-between gap-3 py-3">
                        <div className="flex min-w-0 items-start gap-2">
                          <span className="mt-0.5 text-lg">{s.icon}</span>
                          <div>
                            <p className="text-sm font-semibold text-plum-900">{s.name}</p>
                            {s.description && (
                              <p className="mt-0.5 text-xs leading-relaxed text-plum-500">
                                {s.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="shrink-0 whitespace-nowrap text-sm font-bold text-blush-600">
                          {fmt(s.price, s.price_range)}<span className="font-medium text-plum-500"> บาท</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          )}

          <div className="mt-12 text-center">
            <Link
              to="/booking"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blush-500 to-plum-500 px-8 py-4 font-semibold text-white shadow-xl shadow-blush-500/30 transition hover:scale-105"
            >
              จองคิวตามรายการนี้เลย →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}