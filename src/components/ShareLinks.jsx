import { useState } from "react";

export default function ShareLinks({ title, path = "", className = "" }) {
  const url = `${window.location.origin}${path}`;
  const [copied, setCopied] = useState(false);

  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
      <a
        href={lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full bg-[#06C755] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:scale-105"
      >
        <span className="text-base leading-none">💬</span> แชร์ทาง LINE
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-plum-800 shadow-md ring-1 ring-plum-200 transition hover:scale-105"
      >
        🔗 {copied ? "คัดลอกแล้ว ✓" : "คัดลอกลิงก์"}
      </button>
    </div>
  );
}