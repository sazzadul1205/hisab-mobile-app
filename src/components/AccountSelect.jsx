export function AccountSelect({ initial, color, name }) {
  return (
    <button
      type="button"
      className="w-full flex items-center justify-between bg-white
                 border border-(--line)ded-[14px]
                 px-3.5 py-3.25 text-[14px] text-(--ink)
                 cursor-pointer font-[inherit] text-left"
    >
      <span className="flex items-center gap-2.5 min-w-0">
        <span
          className="w-6.5 h-6.5 rounded-lg text-white flex-none
                     grid place-items-center text-[11px] font-extrabold"
          style={{ background: color }}
        >
          {initial}
        </span>
        <span className="truncate">{name}</span>
      </span>
      <span className="text-(--muted) text-[16px] leading-none">›</span>
    </button>
  );
}
