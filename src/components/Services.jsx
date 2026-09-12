import { services } from "../data";

export default function Services() {
  return (
    <section id="services" className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold tracking-widest text-blush-500 uppercase">
            จองคิวออนไลน์
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-plum-900 sm:text-4xl">
            บริการทั้งหมดของเรา
          </h2>
          <p className="mt-4 text-plum-700">
            เลือกบริการที่ใช่ แล้วจองคิวได้เลย เรามีทีมงานมืออาชีพพร้อมดูแล
            ความสวยของคุณในทุกวัน
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.id}
              className="group relative flex flex-col rounded-3xl bg-white p-7 shadow-sm ring-1 ring-plum-200/50 transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blush-200"
            >
              {service.popular && (
                <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-blush-500 to-plum-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                  🔥 ขายดี
                </span>
              )}
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blush-100 to-plum-100 text-3xl ring-1 ring-blush-200/60 transition group-hover:scale-110">
                {service.icon}
              </span>
              <h3 className="mt-5 font-display text-xl font-bold text-plum-900">
                {service.name}
                <span className="mt-0.5 block text-sm font-medium text-plum-500">
                  {service.nameEn}
                </span>
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-plum-700">
                {service.description}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-plum-100 pt-5">
                <div className="flex items-end gap-1">
                  <span className="text-lg font-bold text-blush-600">
                    {service.price.toLocaleString("th-TH")}
                  </span>
                  <span className="pb-0.5 text-sm text-plum-500">บาท</span>
                </div>
                <span className="text-sm text-plum-500">{service.duration}</span>
              </div>
              <a
                href="#booking"
                className="mt-4 rounded-full border-2 border-blush-300 py-2.5 text-center text-sm font-semibold text-blush-600 transition hover:bg-blush-500 hover:border-blush-500 hover:text-white"
              >
                จองบริการนี้
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}