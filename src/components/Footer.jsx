import { useLocation, useNavigate } from "react-router-dom";

const quickLinks = [
  { href: "/", label: "หน้าหลัก" },
  { href: "/price", label: "ราคา" },
  { href: "/works", label: "ผลงาน" },
  { href: "/booking", label: "จองคิว" },
];

const contacts = [
  { label: "โทร", value: "063-981-9924", href: "tel:0639819924" },
  { label: "Line", value: "nd2627", href: "https://line.me/R/ti/p/~nd2627" },
];

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const go = (e, href) => {
    e.preventDefault();
    if (href.startsWith("/#")) {
      const id = href.slice(2);
      if (location.pathname === "/") {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/", { state: { scrollTo: id } });
      }
    } else {
      navigate(href);
    }
  };

  return (
    <footer className="bg-plum-900 py-10 text-sm text-plum-300">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-blush-400 to-plum-500 text-base shadow-md">
              🌸
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-white">
              Nail & Salon
            </span>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {quickLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => go(e, link.href)}
                className="transition hover:text-blush-400"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col items-center gap-1 text-plum-300 lg:items-end">
            {contacts.map((c) => (
              <a key={c.label} href={c.href} className="transition hover:text-blush-400">
                {c.label}: <span className="text-white/90">{c.value}</span>
              </a>
            ))}
            <p className="text-xs">📍 3/1 ต.สะเตง อ.เมืองยะลา 95000</p>
            <p className="text-xs">⏰ 09:00-20:00 (หยุด อา.)</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-5 text-xs text-plum-400 sm:flex-row">
          <p>© 2026 Nail & Salon</p>
          <a href="/admin" className="transition hover:text-white">
            🔐 เข้าสู่ระบบหลังร้าน
          </a>
        </div>
      </div>
    </footer>
  );
}