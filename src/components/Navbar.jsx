import { useEffect, useState } from "react";

const links = [
  { href: "#home", label: "หน้าหลัก" },
  { href: "#services", label: "บริการ" },
  { href: "#booking", label: "จองคิว" },
  { href: "#gallery", label: "ผลงาน" },
  { href: "#reviews", label: "รีวิว" },
  { href: "#about", label: "เกี่ยวกับเรา" },
  { href: "#contact", label: "ติดต่อ" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 py-3 shadow-[0_4px_20px_rgba(156,114,179,0.12)] backdrop-blur-md"
          : "bg-transparent py-5"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5">
        <a href="#home" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blush-400 to-plum-500 text-lg shadow-md">
            🌸
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-plum-900">
            Nail & Salon
          </span>
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-full px-3 py-2 text-sm font-medium text-plum-800 transition hover:bg-blush-100 hover:text-blush-600"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href="#booking"
            className="hidden rounded-full bg-gradient-to-r from-blush-500 to-plum-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blush-500/25 transition hover:scale-105 sm:inline-block"
          >
            จองคิวเลย
          </a>
          <button
            type="button"
            aria-label="เปิดเมนู"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-plum-800 shadow-md lg:hidden"
          >
            <span className="text-xl leading-none">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </nav>

      {open && (
        <ul className="mx-5 mt-3 space-y-1 rounded-3xl bg-white p-4 shadow-xl lg:hidden">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-4 py-3 font-medium text-plum-800 transition hover:bg-blush-100"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
