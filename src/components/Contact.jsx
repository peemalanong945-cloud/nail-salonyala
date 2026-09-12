const branches = [
  {
    name: "สาขาเมืองยะลา",
    address: "3/1 ตำบลสะเตง อำเภอเมืองยะลา จังหวัดยะลา 95000",
    hours: "ทุกวัน 09:00 - 20:00 น. (หยุดวันอาทิตย์)",
    phone: "063-981-9924",
  },
];

const socials = [
  { label: "Line", emoji: "💬", href: "https://line.me/R/ti/p/~nd2627" },
  { label: "โทร", emoji: "📞", href: "tel:0639819924" },
];

export default function Contact() {
  return (
    <section id="contact" className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold tracking-widest text-blush-500 uppercase">
            ติดต่อเรา
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-plum-900 sm:text-4xl">
            ติดต่อหรือแวะมาทักทายได้เลย
          </h2>
          <p className="mt-4 text-plum-700">
            มีคำถามอะไรทักถามได้เลย เรายินดีตอบทุกข้อสงสัย
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {branches.map((branch) => (
            <article
              key={branch.name}
              className="flex flex-col rounded-3xl bg-white p-7 shadow-sm ring-1 ring-plum-100 transition hover:shadow-lg"
            >
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blush-100 to-plum-100 text-2xl">
                📍
              </span>
              <h3 className="mt-5 font-display text-xl font-bold text-plum-900">
                {branch.name}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-plum-700">
                {branch.address}
              </p>
              <dl className="mt-5 space-y-2 border-t border-plum-100 pt-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-plum-500">เวลา</dt>
                  <dd className="font-medium text-plum-800">{branch.hours}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-plum-500">โทร</dt>
                  <dd className="font-medium text-plum-800">{branch.phone}</dd>
                </div>
              </dl>
            </article>
          ))}

          <article className="flex flex-col rounded-3xl bg-gradient-to-br from-blush-500 to-plum-500 p-7 text-white shadow-xl shadow-blush-500/25">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 text-2xl backdrop-blur">
              💌
            </span>
            <h3 className="mt-5 font-display text-xl font-bold">สอบถามเพิ่มเติม</h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-white/90">
              ทักแชทได้เลยทุกช่องทาง หรือโทรหาเรา สำรองที่นั่งล่วงหน้าแล้วไม่พลาด
            </p>
            <div className="mt-5 space-y-2 border-t border-white/20 pt-5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-2.5 font-medium backdrop-blur transition hover:bg-white/25"
                >
                  <span>{s.emoji}</span>
                  <span className="flex-1">{s.label}</span>
                  <span aria-hidden>→</span>
                </a>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}