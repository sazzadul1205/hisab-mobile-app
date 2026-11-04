export function Chip({ children, on = false, ghost = false, onClick }) {
  const base =
    "flex-none text-[12px] font-semibold px-[13px] py-[7px] rounded-full " +
    "cursor-pointer whitespace-nowrap font-[inherit] transition-colors ";

  let skin = "bg-(--card) border border-(--line) text-(--ink-2)";
  if (on) skin = "bg-(--brand) border border-(--brand) text-white";
  else if (ghost)
    skin = "bg-transparent border border-dashed border-(--line) text-(--muted)";

  return (
    <button type="button" onClick={onClick} className={`${base} ${skin}`}>
      {children}
    </button>
  );
}

export function ChipStrip({ children, className = "" }) {
  return (
    <div
      className={
        "flex gap-1.75 overflow-x-auto pt-0.5 pb-1 " +
        "scrollbar-none [&::-webkit-scrollbar]:hidden " +
        className
      }
    >
      {children}
    </div>
  );
}
