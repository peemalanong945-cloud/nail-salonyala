import { Link } from "react-router-dom";

const steps = [
  {
    num: "1",
    icon: "💅",
    title: "เลือกบริการ",
    text: "เลือกรายการที่ต้องการ พร้อมดูราคาและเวลาแบบชัดเจน",
  },
  {
    num: "2",
    icon: "📅",
    title: "เลือกวัน-เวลา",
    text: "ดูตารางคิวว่างแบบ realtime แล้วกดจองในวินาทีเดียว",
  },
  {
    num: "3",
    icon: "✅",
    title: "รับยืนยันทันที",
    text: "ระบบยืนยันการจองทันที สะดวก ไม่ต้องโทรหรือฝากข้อความ",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="rounded-[2.5rem] bg-white p-8 shadow-sm ring-1 ring-plum-100 sm:p-12">
          <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
            <div>
              <span className="text-sm font-semibold tracking-widest text-blush-500 uppercase">
                จองง่ายๆ แค่ 3 ขั้นตอน
              </span>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-plum-900 sm:text-3xl">
                พร้อมเมื่อไหร่ จองเมื่อนั้น
              </h2>
            </div>
            <Link
              to="/booking"
              className="shrink-0 rounded-full bg-plum-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-plum-900"
            >
              ไปหน้าจอง →
            </Link>
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.num} className="relative flex gap-4 sm:block">
                {i < steps.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute top-10 left-16 hidden h-px w-[calc(100%-4rem)] bg-gradient-to-r from-blush-200 to-plum-200 sm:block"
                  />
                )}
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blush-100 to-plum-100 text-3xl ring-1 ring-blush-200/60">
                  {step.icon}
                </span>
                <div className="mt-4">
                  <p className="text-xs font-bold tracking-widest text-blush-500 uppercase">
                    ขั้นตอนที่ {step.num}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold text-plum-900">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-plum-700">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}