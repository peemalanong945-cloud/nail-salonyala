import { reviews } from "../data";

function Stars({ count }) {
  return (
    <div className="flex gap-0.5 text-blush-500" aria-label={`${count} จาก 5 ดาว`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < count ? "" : "opacity-25"}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function Reviews() {
  return (
    <section
      id="reviews"
      className="bg-gradient-to-b from-plum-900 to-plum-800 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold tracking-widest text-blush-300 uppercase">
            ลูกค้าพูดถึงเรา
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            รีวิวจากลูกค้าจริง
          </h2>
          <p className="mt-4 text-plum-200">
            รับรองได้ด้วยความพึงพอใจของลูกค้าที่มากกว่า 1,200 คน
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {reviews.map((review) => (
            <figure
              key={review.id}
              className="flex flex-col rounded-3xl bg-white/10 p-7 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/15"
            >
              <Stars count={review.rating} />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-plum-100">
                “{review.text}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-blush-400 to-plum-500 font-bold text-white">
                  {review.initial}
                </span>
                <div>
                  <p className="font-semibold text-white">{review.name}</p>
                  <p className="text-xs text-plum-300">{review.service}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-md rounded-3xl bg-white/10 p-6 text-center ring-1 ring-white/10">
          <p className="text-4xl font-bold text-white">4.9</p>
          <div className="mt-1 flex justify-center">
            <Stars count={5} />
          </div>
          <p className="mt-2 text-sm text-plum-200">
            จากรีวิวมากกว่า 380 รีวิวบน Google
          </p>
        </div>
      </div>
    </section>
  );
}