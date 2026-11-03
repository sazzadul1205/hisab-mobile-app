const ICO_BG = {
  in: "bg-[var(--brand-soft)] text-[var(--in)]",
  out: "bg-[var(--danger-soft)] text-[var(--out)]",
  tr: "bg-[var(--tr-soft)] text-[var(--tr)]",
};
const AMT_COLOR = {
  in: "text-[var(--in)]",
  out: "text-[var(--out)]",
  tr: "text-[var(--tr)]",
};

export function TransactionRow({
  title,
  meta,
  amount,
  tone = "out",
  icon,
  last = false,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={
        "flex items-center gap-3 py-2.75 cursor-pointer " +
        (last ? "" : "border-b border-(--line-2)")
      }
    >
      <div
        className={`w-9.5 h-9.5 rounded-xl flex-none grid place-items-center ${ICO_BG[tone]}`}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-4.25 h-4.25 stroke-current fill-none stroke-[1.9]
                     [stroke-linecap:round] [stroke-linejoin:round]"
        >
          {icon}
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <b className="block text-[13.5px] font-semibold tracking-[-0.1px] truncate">
          {title}
        </b>
        <small className="block text-[11.5px] text-(--muted) mt-0.5 truncate">
          {meta}
        </small>
      </div>
      <div
        className={`text-[13.5px] font-bold num whitespace-nowrap tracking-[-0.2px] ${AMT_COLOR[tone]}`}
      >
        {amount}
      </div>
    </div>
  );
}
