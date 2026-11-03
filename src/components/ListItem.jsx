export function ListItem({ icon, title, subtitle, trailing, danger = false }) {
  return (
    <div
      className="flex items-center gap-3 px-[15px] py-[14px]
                 border-b border-[var(--line-2)] last:border-b-0 cursor-pointer"
    >
      {icon && (
        <span
          className={
            "w-8 h-8 rounded-[10px] flex-none grid place-items-center " +
            (danger
              ? "bg-[var(--danger-soft)] text-[var(--danger)]"
              : "bg-[var(--app)] text-[var(--ink-2)]")
          }
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 stroke-current fill-none stroke-[1.9]
                       [stroke-linecap:round] [stroke-linejoin:round]"
          >
            {icon}
          </svg>
        </span>
      )}
      <b
        className={
          "flex-1 text-[13.5px] font-semibold tracking-[-0.1px] " +
          (danger ? "text-[var(--danger)]" : "")
        }
      >
        {title}
      </b>
      {subtitle && (
        <small className="text-[12px] text-[var(--muted)] font-medium">
          {subtitle}
        </small>
      )}
      {trailing}
    </div>
  );
}
