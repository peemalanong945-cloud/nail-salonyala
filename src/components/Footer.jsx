import { useLocation, useNavigate } from "react-router-dom";

const quickLinks = [
  { href: "/", label: "หน้าหลัก" },
  { href: "/booking", label: "จองคิว" },
  { href: "/#about", label: "เกี่ยวกับเรา" },
  { href: "/#contact", label: "ติดต่อ" },
];

const contacts = [
  { label: "โทร", value: "063-981-9924", href: "tel:0639819924", icon: "📞" },
  { label: "Line ID", value: "nd2627", href: "https://line.me/R/ti/p/~nd2627", icon: "💬" },
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
    <footer className="bg-plum-900 pt-16 pb-8 text-plum-200">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blush-400 to-plum-500 text-lg shadow-md">
                🌸
              </span>
              <span className="font-display text-xl font-bold tracking-tight text-white">
                Nail & Salon
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-plum-300">
              ร้านทำเล็บและต่อเล็บมืออาชีพ ครบทุกบริการเพื่อความสวยของมือและเท้า
              จองคิวง่ายๆ ได้ที่เว็บไซต์นี้
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href="tel:0639819924"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blush-500"
              >
                📞 063-981-9924
              </a>
              <a
                href="https://line.me/R/ti/p/~nd2627"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blush-500"
              >
                💬 Line: nd2627
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold text-white">เมนู</h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => go(e, link.href)}
                    className="text-plum-300 transition hover:text-blush-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold text-white">ติดต่อเรา</h3>
            <ul className="mt-4 space-y-2 text-sm text-plum-300">
              {contacts.map((c) => (
                <li key={c.label}>
                  <a href={c.href} className="transition hover:text-blush-400">
                    <span className="font-semibold text-plum-200">{c.icon} {c.label}:</span>{" "}
                    {c.value}
                  </a>
                </li>
              ))}
              <li>
                <span className="font-semibold text-plum-200">📍 ที่อยู่:</span> 3/1 ตำบลสะเตง
                อ.เมืองยะลา จ.ยะลา 95000
              </li>
              <li>
                <span className="font-semibold text-plum-200">⏰ เวลา:</span> ทุกวัน 09:00 - 20:00
                น. (หยุดวันอาทิตย์)
              </li>
              <li>📷 Instagram / TikTok เร็วๆ นี้</li>
            </ul>
            <a
              href="/admin"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-plum-300 ring-1 ring-white/10 transition hover:bg-white/20 hover:text-white"
            >
              🔐 เข้าสู่ระบบหลังร้าน
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-plum-400 sm:flex-row">
          <p>© 2026 Nail & Salon. สงวนลิขสิทธิ์</p>
          <p className="flex items-center gap-1">
            ทำด้วย <span className="text-blush-400">❤</span> เพื่อคนรักสวยทุกคน
          </p>
        </div>
      </div>
    </footer>
  );
}