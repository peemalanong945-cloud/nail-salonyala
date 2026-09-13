export const services = [
  {
    id: "classic",
    name: "ทำเล็บเจล",
    nameEn: "Gel Manicure",
    description: "ทำเล็บเจลติดทนนาน เงางาม อยู่ได้นาน 3-4 สัปดาห์",
    price: 590,
    duration: "60 นาที",
    icon: "💅",
    popular: true,
  },
  {
    id: "extension",
    name: "ต่อเล็บอะคริลิก",
    nameEn: "Acrylic Extension",
    description: "ต่อเล็บทรงสวยได้ทุกแบบ แข็งแรง อยู่ได้นาน 4-6 สัปดาห์",
    price: 890,
    duration: "90 นาที",
    icon: "✨",
  },
  {
    id: "art",
    name: "เพ้นท์เล็บลาย",
    nameEn: "Nail Art",
    description: "ออกแบบลายเล็บเฉพาะตัว ตามสไตล์ที่คุณต้องการ",
    price: 350,
    duration: "45 นาที",
    icon: "🎨",
    popular: true,
  },
  {
    id: "pedicure",
    name: "สปาเท้า + ทำเล็บเท้า",
    nameEn: "Spa Pedicure",
    description: "ดูแลเท้าอย่างล้ำลึก ขัดผิว แช่เท้าสมุนไพร และทำเล็บ",
    price: 690,
    duration: "75 นาที",
    icon: "🌿",
  },
  {
    id: "removal",
    name: "ถอดเล็บ + บำรุง",
    nameEn: "Removal & Care",
    description: "ถอดเล็บอย่างปลอดภัย พร้อมบำรุงผิวรอบเล็บ",
    price: 250,
    duration: "30 นาที",
    icon: "🧴",
  },
  {
    id: "bridal",
    name: "แพ็กเกจเจ้าสาว",
    nameEn: "Bridal Package",
    description: "ทำเล็บมือ-เท้า + ออกแบบลายพิเศษสำหรับวันสำคัญ",
    price: 1590,
    duration: "120 นาที",
    icon: "👰",
  },
];

export const categoryOrder = [
  "สีเจล",
  "ต่อขนตา",
  "ผม",
  "สปามือ/เท้า",
  "ขน/คิ้ว",
  "ป้ายกระดานดำ",
  "ดีไซน์",
  "ต่อเล็บ",
  "สปา 7 ขั้นตอน",
  "ล้าง/ถอด",
];

const galleryGradients = [
  "from-blush-200 to-plum-200",
  "from-blush-300 to-blush-100",
  "from-plum-200 to-blush-100",
  "from-blush-400 to-blush-200",
];

export const gallery = Array.from({ length: 66 }, (_, i) => ({
  id: i + 1,
  title: `ผลงานชิ้นที่ ${i + 1}`,
  emoji: "💅",
  gradient: galleryGradients[i % galleryGradients.length],
  image: `/gallery/${i + 1}.jpg`,
}));

export const reviews = [
  {
    id: 1,
    name: "คุณมีน",
    service: "ทำเล็บเจล",
    rating: 5,
    text: "ร้านสวยมาก พี่ๆ น่ารัก ทำเล็บละเอียดมาก อยู่มา 4 สัปดาห์ยังเงาอยู่เลยค่ะ",
    initial: "M",
  },
  {
    id: 2,
    name: "คุณแพร",
    service: "ต่อเล็บอะคริลิก",
    rating: 5,
    text: "ต่อเล็บทรงสวยตรงตามที่ขอเลย แข็งแรงมาก ราคาไม่แพง คุ้มค่าเกินราคา",
    initial: "P",
  },
  {
    id: 3,
    name: "คุณนุ่น",
    service: "เพ้นท์เล็บลาย",
    rating: 5,
    text: "ช่างออกแบบลายให้ตามที่ต้องการเลย สวยถูกใจมาก บรรยากาศร้านผ่อนคลายสุดๆ",
    initial: "N",
  },
];
