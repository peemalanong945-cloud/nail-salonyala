import { Link } from "react-router-dom";
import SectionHeading from "./SectionHeading";

export default function About() {
  return (
    <section id="about" className="py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative order-2 lg:order-1">
            <div className="aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blush-200 to-plum-300 shadow-xl ring-1 ring-white/60">
              <img
                src="/gallery/6.jpg"
                alt="บรรยากาศในร้าน"
                loading="lazy"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <span className="absolute -bottom-5 left-1/2 w-[85%] -translate-x-1/2 rounded-full bg-gradient-to-r from-blush-500 to-plum-500 px-6 py-3 text-center text-sm font-semibold text-white shadow-xl">
              ✨ มาแล้ว ไม่ได้แค่สวย — ได้ผ่อนคลายด้วย
            </span>
          </div>

          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow="เกี่ยวกับเรา"
              title="Nail & Salon"
              sub="ร้านทำเล็บน่ารักใจกลางเมืองยะลา ที่มาถึงแล้วได้พักผ่อน กลับไปพร้อมกับเล็บสวยในแบบของตัวเอง"
            />
            <p className="mt-5 max-w-lg leading-relaxed text-plum-600">
              เปิดบริการทุกวัน 09:00 - 20:00 น. (หยุดวันอาทิตย์)
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/booking"
                className="rounded-full bg-gradient-to-r from-blush-500 to-plum-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blush-500/25 transition hover:scale-105"
              >
                จองคิวเลย
              </Link>
              <a
                href="tel:0639819924"
                className="rounded-full border-2 border-plum-200 bg-white px-6 py-2.5 text-sm font-semibold text-plum-700 transition hover:border-blush-400 hover:text-blush-600"
              >
                📞 โทรหาร้าน
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}