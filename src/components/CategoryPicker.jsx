export function CategoryPicker({ categories, selected }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {categories.map((c) => {
        const isOn = c.id === selected;
        const border = c.dashed
          ? "border-dashed border-[var(--line)]"
          : isOn
            ? "border-[var(--brand)]"
            : "border-[var(--line)]";
        const bg = isOn ? "bg-[var(--brand-soft)]" : "bg-white";
        const text = isOn ? "text-[var(--brand-dk)]" : "text-[var(--ink-2)]";
        const icoBg = isOn
          ? "bg-[var(--brand)] text-white"
          : "bg-[var(--app)] text-[var(--ink-2)]";

        return (
          <button
            key={c.id}
            type="button"
            className={
              "flex flex-col items-center gap-1.5 py-2.75 px-0.5 " +
              "rounded-[14px] border text-[10px] font-semibold font-[inherit] " +
              "cursor-pointer " +
              `${border} ${bg} ${text}`
            }
          >
            <span
              className={
                "w-7.5 h-7.5 rounded-[9px] grid place-items-center " +
                icoBg
              }
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3.75 h-3.75 stroke-current fill-none stroke-[1.9]
                           [stroke-linecap:round] [stroke-linejoin:round]"
              >
                {c.icon}
              </svg>
            </span>
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
