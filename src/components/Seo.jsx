import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const base = {
  title: "Nail & Salon | ร้านทำเล็บ จองคิวออนไลน์ ยะลา",
  desc: "ร้านทำเล็บและต่อเล็บมืออาชีพในตัวเมืองยะลา จองคิวออนไลน์ได้เลย ไม่ต้องโทรหา",
  image: "/gallery/1.jpg",
};

const metas = {
  "/": base,
  "/booking": {
    ...base,
    title: "จองคิว | Nail & Salon",
    desc: "จองคิวร้านทำเล็บออนไลน์ ง่ายๆ 2 นาที เลือกบริการและวันเวลาที่สะดวกได้เลย",
  },
  "/price": {
    ...base,
    title: "ราคา | Nail & Salon",
    desc: "ดูรายการบริการและราคา ตั้งแต่สีเจล ต่อขนตา ทำผม สปามือเท้า ครบทุกราคา",
  },
  "/works": {
    ...base,
    title: "ผลงาน | Nail & Salon",
    desc: "ชมผลงานจริงจากร้าน 66 ชิ้น ไอเดียลายเล็บครบ สีเจล ตกแต่ง แบบฝรั่งเศส",
  },
  "/admin": {
    ...base,
    title: "ระบบหลังร้าน | Nail & Salon",
    desc: "สำหรับทีมงาน Nail & Salon",
  },
};

export default function Seo() {
  const { pathname } = useLocation();
  const meta = metas[pathname] ?? base;

  useEffect(() => {
    document.title = meta.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", meta.desc);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", meta.title);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", meta.desc);
  }, [meta.title, meta.desc]);

  return null;
}