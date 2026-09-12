export default function SectionHeading({ eyebrow, title, sub, tone = "light" }) {
  const dark = tone === "dark";
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span
        className={`text-sm font-semibold tracking-widest uppercase ${
          dark ? "text-blush-300" : "text-blush-500"
        }`}
      >
        {eyebrow}
      </span>
      <h2
        className={`mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl ${
          dark ? "text-white" : "text-plum-900"
        }`}
      >
        {title}
      </h2>
      {sub && (
        <p className={`mt-4 ${dark ? "text-plum-200" : "text-plum-700"}`}>{sub}</p>
      )}
    </div>
  );
}