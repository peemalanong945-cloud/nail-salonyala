import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gallery } from "../data";
import SectionHeading from "./SectionHeading";

export default function Gallery({ preview = false, limit = 4 }) {
  const navigate = useNavigate();
  const items = preview ? gallery.slice(0, limit) : gallery;
  const [openIndex, setOpenIndex] = useState(null);

  const open = (i) => {
    if (preview) {
      navigate("/works");
      return;
    }
    setOpenIndex(i);
  };

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight")
        setOpenIndex((i) => (i + 1) % items.length);
      if (e.key === "ArrowLeft")
        setOpenIndex((i) => (i - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, items.length]);

  return (
    <section
      id="gallery"
      className={
        preview
          ? "pb-6 pt-4 lg:pb-10"
          : "pb-20 pt-10 lg:pb-28 lg:pt-14"
      }
    >
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="ผลงานของเรา"
          title={preview ? "ผลงานบางส่วน" : "ไอเดียลายเล็บสวยๆ"}
          sub={
            preview
              ? undefined
              : "เลือกลายที่ชอบ แล้วแจ้งช่างได้เลย หรือให้ช่างออกแบบให้ใหม่ก็ได้"
          }
        />

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item, i) => (
            <GalleryCard key={item.id} item={item} index={i} onOpen={() => open(i)} />
          ))}
        </div>

        {preview && (
          <div className="mt-8 text-center">
            <Link
              to="/works"
              className="inline-flex items-center gap-2 rounded-full bg-plum-800 px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-plum-900"
            >
              ดูผลงานทั้งหมด ({gallery.length} รูป) →
            </Link>
          </div>
        )}

        {!preview && (
          <p className="mt-10 text-center text-sm text-plum-600">
            ผลงานจริงจากร้าน · แตะรูปเพื่อดูภาพใหญ่
          </p>
        )}

        {!preview && openIndex !== null && (
          <Lightbox
            item={items[openIndex]}
            index={openIndex}
            onClose={() => setOpenIndex(null)}
            onPrev={() => setOpenIndex((openIndex - 1 + items.length) % items.length)}
            onNext={() => setOpenIndex((openIndex + 1) % items.length)}
          />
        )}
      </div>
    </section>
  );
}

function GalleryCard({ item, index, onOpen }) {
  const [failed, setFailed] = useState(false);

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`ดูภาพ ${item.title} (ภาพที่ ${index + 1})`}
      className="group relative aspect-square w-full overflow-hidden rounded-3xl bg-gradient-to-br shadow-sm ring-1 ring-plum-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blush-400"
    >
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
        <span className="absolute inset-0 grid place-items-center text-6xl drop-shadow-lg transition duration-300 group-hover:scale-110">
          {item.emoji}
        </span>
      )}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-plum-900/75 to-transparent p-4 pt-16 text-left">
        <span className="block text-sm font-semibold text-white">{item.title}</span>
      </span>
      <span className="absolute inset-0 grid place-items-center bg-plum-900/0 text-3xl opacity-0 transition duration-300 group-hover:bg-plum-900/25 group-hover:opacity-100">
        🔍
      </span>
    </button>
  );
}

function Lightbox({ item, index, onClose, onPrev, onNext }) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-plum-900/90 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="ปิด"
        className="absolute top-4 right-4 grid h-12 w-12 place-items-center rounded-full bg-white/15 text-xl text-white transition hover:bg-white/30"
      >
        ✕
      </button>

      <div className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-white/20" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          {item.image && !failed ? (
            <img
              src={item.image}
              alt={item.title}
              className="max-h-[72vh] w-full object-cover"
              onError={() => setFailed(true)}
            />
          ) : (
            <div className="grid h-[60vh] place-items-center">
              <span className="text-8xl">{item.emoji}</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-plum-900/80 to-transparent p-5">
            <p className="font-display text-lg font-bold text-white">{item.title}</p>
            <p className="text-sm text-blush-100">
              ภาพที่ {index + 1} จาก {gallery.length}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-6 flex justify-center gap-3">
        <button
          type="button"
          aria-label="ภาพก่อนหน้า"
          onClick={(e) => {
            e.stopPropagation();
            setFailed(false);
            onPrev();
          }}
          className="grid h-12 w-12 place-items-center rounded-full bg-white/15 text-3xl text-white transition hover:bg-white/30"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="ภาพถัดไป"
          onClick={(e) => {
            e.stopPropagation();
            setFailed(false);
            onNext();
          }}
          className="grid h-12 w-12 place-items-center rounded-full bg-white/15 text-3xl text-white transition hover:bg-white/30"
        >
          ›
        </button>
      </div>
    </div>
  );
}