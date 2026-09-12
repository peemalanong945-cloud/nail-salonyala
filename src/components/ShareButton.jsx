import { useState } from "react";

export default function ShareButton({ text = "แบ่งปัน", className = "" }) {
  const [msg, setMsg] = useState("");

  const share = async () => {
    const data = {
      title: "Nail & Salon",
      text: "จองคิวทำเล็บออนไลน์ได้เลย ไม่ต้องรอคิว ✨",
      url: window.location.origin,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(data.url);
      setMsg("คัดลอกลิงก์แล้ว ✓");
      setTimeout(() => setMsg(""), 2500);
    } catch (err) {
      if (err.name !== "AbortError") setMsg("แชร์ไม่สำเร็จ");
    }
  };

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={share}
        className={`inline-flex items-center gap-2 rounded-full border-2 border-plum-300 bg-white/60 px-5 py-3 font-semibold text-plum-800 backdrop-blur-sm transition hover:border-blush-400 hover:text-blush-600 ${className}`}
      >
        🎁 {text}
      </button>
      {msg && <span className="text-xs font-medium text-emerald-600">{msg}</span>}
    </span>
  );
}