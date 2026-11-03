export function Note({ children, className = "" }) {
  return (
    <div
      className={
        "text-[11.5px] leading-[1.6] text-(--muted) " +
        "bg-(--app) border border-dashed border-(--line) " +
        "rounded-[14px] px-3.25 py-2.75 mt-3 " +
        className
      }
    >
      {children}
    </div>
  );
}
