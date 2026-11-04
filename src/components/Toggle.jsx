export function Toggle({ on = false, onClick }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={
        "w-11 h-6.5 rounded-full relative flex-none cursor-pointer " +
        "border-0 bg-transparent p-0 transition-colors " +
        (on ? "bg-(--brand)" : "bg-(--line)")
      }
    >
      <span
        className={
          "absolute top-0.75 left-0.75 w-5 h-5 rounded-full bg-(--card) " +
          "shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-transform " +
          (on ? "translate-x-4.5" : "")
        }
      />
    </button>
  );
}
