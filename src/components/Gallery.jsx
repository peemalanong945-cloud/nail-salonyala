import { useState } from "react";
import { gallery } from "../data";

export default function Gallery() {
  return (
    <section id="gallery" className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold tracking-widest text-blush-500 uppercase">
            ผลงานของเรา
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-plum-900 sm:text-4xl">
            ไอเดียลายเล็บสวยๆ
          </h2>
          <p className="mt-4 text-plum-700">
            เลือกลายที่ชอบ แล้วแจ้งช่างได้เลย หรือให้ช่างออกแบบให้ใหม่ก็ได้
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {gallery.map((item) => (
            <GalleryCard key={item.id} item={item} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-plum-600">
          ตัวอย่างผลงานจริงของร้าน ดูได้จริงที่สาขาทั้ง 2 แห่ง · เปลี่ยนรูปได้โดยวางไฟล์ลง{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-xs text-blush-600 ring-1 ring-blush-100">
            public/gallery/
          </code>
        </p>
      </div>
    </section>
  );
}

function GalleryCard({ item }) {
  const [failed, setFailed] = useState(false);

  return (
    <figure className="group relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br shadow-sm transition duration-300 hover:scale-[1.03] hover:shadow-xl">
      <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} transition duration-300 group-hover:scale-110`} />
      {item.image && !failed ? (
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <span className="text-6xl drop-shadow-lg transition duration-300 group-hover:scale-110">
            {item.emoji}
          </span>
        </div>
      )}
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-plum-900/70 to-transparent p-4 pt-10">
        <p className="text-sm font-semibold text-white">{item.title}</p>
      </figcaption>
    </figure>
  );
}