import SectionHeading from "./SectionHeading";

const info = [
  {
    label: "เวลาเปิด",
    value: "09:00 - 20:00 น.",
    icon: "⏰",
    note: "หยุดวันอาทิตย์",
  },
  {
    label: "โทรศัพท์",
    value: "063-981-9924",
    icon: "📞",
    href: "tel:0639819924",
  },
  {
    label: "Line",
    value: "nd2627",
    icon: "💬",
    href: "https://line.me/R/ti/p/~nd2627",
  },
  {
    label: "ที่อยู่",
    value: "3/1 ตำบลสะเตง อำเภอเมืองยะลา ยะลา 95000",
    icon: "📍",
  },
];

export default function Contact() {
  return (
    <section id="contact" className="py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading eyebrow="ติดต่อเรา" title="แวะมาทักทายกันได้" />

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-2">
          <div className="grid content-start gap-3 sm:grid-cols-2">
            {info.map((i) => {
              const inner = (
                <>
                  <span className="text-xl">{i.icon}</span>
                  <p className="mt-2 text-[11px] font-semibold tracking-widest text-plum-400 uppercase">
                    {i.label}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-plum-800">
                    {i.value}
                    {i.note && (
                      <span className="ml-1 text-xs font-normal text-plum-400">({i.note})</span>
                    )}
                  </p>
                </>
              );
              return i.href ? (
                <a
                  key={i.label}
                  href={i.href}
                  target={i.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="block rounded-3xl bg-white p-5 shadow-sm ring-1 ring-plum-100 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {inner}
                </a>
              ) : (
                <div
                  key={i.label}
                  className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-plum-100"
                >
                  {inner}
                </div>
              );
            })}
          </div>

          <div className="min-h-[280px] overflow-hidden rounded-3xl bg-white p-2 shadow-sm ring-1 ring-plum-100">
            <iframe
              title="แผนที่ร้าน Nail & Salon"
              src="https://maps.google.com/maps?q=3%2F1%20%E0%B8%95%E0%B8%B3%E0%B8%9A%E0%B8%A5%E0%B8%AA%E0%B8%B0%E0%B9%80%E0%B8%95%E0%B8%87%20%E0%B8%AD%E0%B8%B3%E0%B9%80%E0%B8%A0%E0%B8%AD%E0%B9%80%E0%B8%A1%E0%B8%B7%E0%B8%AD%E0%B8%87%E0%B8%A2%E0%B8%B0%E0%B8%A5%E0%B8%B2%20%E0%B8%88%E0%B8%B1%E0%B8%87%E0%B8%AB%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%A2%E0%B8%B0%E0%B8%A5%E0%B8%B2%2095000&t=m&z=16&ie=UTF8&output=embed"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full min-h-[280px] w-full rounded-2xl border-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}