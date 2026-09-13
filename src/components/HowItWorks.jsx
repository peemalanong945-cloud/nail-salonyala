import { Link } from "react-router-dom";

const steps = [
  { icon: "💅", label: "เลือกบริการ" },
  { icon: "📅", label: "เลือกวัน-เวลา" },
  { icon: "✅", label: "รับยืนยันทันที" },
];

export default function HowItWorks() {
  return (
    <section className="py-14 lg:py-16">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-col justify-center gap-4 rounded-[2rem] bg-white px-8 py-5 shadow-sm ring-1 ring-plum-100 sm:flex-row sm:items-center lg:justify-evenly lg:px-14">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center justify-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blush-100 to-plum-100 text-lg ring-1 ring-blush-200/60">
                {s.icon}
              </span>
              <span className="font-semibold text-plum-800">{s.label}</span>
              {i < steps.length - 1 && <span className="ml-1 hidden text-2xl text-plum-300 sm:inline">›</span>}
            </div>
          ))}
          <Link
            to="/booking"
            className="shrink-0 rounded-full bg-plum-800 px-6 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-plum-900"
          >
            ไปหน้าจอง →
          </Link>
        </div>
      </div>
    </section>
  );
}