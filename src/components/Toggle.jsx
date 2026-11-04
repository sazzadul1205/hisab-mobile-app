export function Toggle({ on = false }) {
  return (
    <div
      role="switch"
      aria-checked={on}
      className={
        "w-[44px] h-[26px] rounded-full relative flex-none cursor-pointer transition-colors " +
        (on ? "bg-[var(--brand)]" : "bg-[var(--line)]")
      }
    >
      <span
        className={
          "absolute top-[3px] left-[3px] w-5 h-5 rounded-full bg-(--card) " +
          "shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-transform " +
          (on ? "translate-x-[18px]" : "")
        }
      />
    </div>
  );
}
