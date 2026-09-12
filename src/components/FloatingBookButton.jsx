import { Link, useLocation } from "react-router-dom";

export default function FloatingBookButton() {
  const location = useLocation();
  if (location.pathname === "/booking") return null;

  return (
    <Link
      to="/booking"
      className="fixed right-5 bottom-5 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-blush-500 to-plum-500 px-5 py-3.5 text-sm font-semibold text-white shadow-2xl shadow-blush-500/40 transition hover:scale-105 lg:right-8 lg:bottom-8"
    >
      📅 จองคิวเลย
    </Link>
  );
}