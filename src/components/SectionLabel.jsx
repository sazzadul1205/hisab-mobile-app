export function SectionLabel({ children, className = "" }) {
  return (
    <div
      className={
        "text-[11px] font-bold tracking-[0.09em] uppercase " +
        "text-(--muted) mb-2 " +
        className
      }
    >
      {children}
    </div>
  );
}
