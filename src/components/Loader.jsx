export function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-blush-200/40 ${className}`} />
  );
}

export function Spinner({ className = "" }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-plum-300 border-t-blush-500 ${className}`}
      aria-hidden="true"
    />
  );
}