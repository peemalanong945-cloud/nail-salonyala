const highlights = [
  {
    emoji: "🧑‍🎨",
    title: "ช่างมืออาชีพ",
    text: "ทีมช่างผ่านการอบรมมาตรฐาน มีประสบการณ์กว่า 8 ปี ดูแลคุณอย่างใส่ใจ",
  },
  {
    emoji: "🧴",
    title: "ผลิตภัณฑ์พรีเมียม",
    text: "ใช้เจลและสีแบรนด์คุณภาพ ปลอดภัย ไม่ทำลายเล็บ อ่อนโยนต่อผิว",
  },
  {
    emoji: "🏆",
    title: "ได้มาตรฐาน",
    text: "เครื่องมือผ่านการฆ่าเชื้อทุกครั้ง ทำเล็บอย่างถูกสุขอนามัย",
  },
  {
    emoji: "🤝",
    title: "บริการเป็นกันเอง",
    text: "บรรยากาศอบอุ่นเหมือนมาพักผ่อน พร้อมบริการน้ำดื่มและเครื่องดื่มฟรี",
  },
];

import SectionHeading from "./SectionHeading";

export default function About() {
  return (
    <section id="about" className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blush-200 to-plum-300 shadow-xl ring-1 ring-white/60">
              <img
                src="/gallery/6.jpg"
                alt="บรรยากาศและผลงานในร้าน"
                loading="lazy"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <span className="absolute top-8 left-8 grid h-20 w-20 animate-float place-items-center rounded-3xl bg-white text-4xl shadow-lg">
              💖
            </span>
            <span className="absolute bottom-10 right-8 grid h-16 w-16 animate-float place-items-center rounded-2xl bg-white text-3xl shadow-lg [animation-delay:1.5s]">
              🌸
            </span>
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blush-500 to-plum-500 px-6 py-3 text-center text-sm font-semibold text-white shadow-xl">
              ✨ เปิดให้บริการมาแล้ว 8 ปี
            </span>
          </div>

          <div>
            <SectionHeading
              eyebrow="เกี่ยวกับเรา"
              title="ขอต้อนรับสู่ Nail & Salon"
              sub="เราเริ่มต้นจากความรักในงานเล็บและความฝันที่จะสร้างร้านที่อบอุ่นเหมือนบ้าน จุดมุ่งหมายของเราคือทำให้ทุกคนที่มาได้ผ่อนคลาย และกลับไปพร้อมกับรอยยิ้มและเล็บที่สวยงามที่สุด"
              />
            <p className="mt-3 leading-relaxed text-plum-700">
              ทุกบริการเลือกสรรมาเพื่อคุณอย่างพิถีพิถัน เรามุ่งมั่นพัฒนาฝีมืออยู่เสมอ
              เพื่อให้ทุกครั้งที่มาใช้บริการ คุณมั่นใจได้ว่าออกจากร้านไปพร้อมกับความสวย
              ในแบบของคุณเอง
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-plum-100 transition hover:shadow-md"
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <h3 className="mt-3 font-display text-lg font-bold text-plum-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-plum-700">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}