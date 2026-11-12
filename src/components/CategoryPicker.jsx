import { getCategoryIcon } from "../constants/categoryIcons";

export function CategoryPicker({ categories, value, selected, onChange, placeholder, includeEmpty }) {
  const currentValue = value ?? selected;

  return (
    <div className="grid grid-cols-4 gap-2">
      {includeEmpty && (
        <button
          type="button"
          className={
            "flex flex-col items-center gap-1.5 py-2.75 px-0.5 " +
            "rounded-[14px] border border-[var(--line)] bg-(--card) text-[10px] font-semibold font-[inherit] " +
            "cursor-pointer text-(--ink-2)"
          }
          onClick={() => onChange?.("")}
        >
          <span className="w-7.5 h-7.5 rounded-[9px] grid place-items-center bg-[var(--app)] text-[var(--ink-2)]">
            <svg viewBox="0 0 24 24" className="w-3.75 h-3.75 stroke-current fill-none stroke-[1.9] [stroke-linecap:round] [stroke-linejoin:round]">
              <path d="M5 12h14M12 5v14" />
            </svg>
          </span>
          {placeholder ?? "All"}
        </button>
      )}
      {categories.map((c) => {
        const isOn = c.id === currentValue;
        const border = c.dashed
          ? "border-dashed border-[var(--line)]"
          : isOn
            ? "border-[var(--brand)]"
            : "border-[var(--line)]";
        const bg = isOn ? "bg-[var(--brand-soft)]" : "bg-(--card)";
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
            onClick={() => onChange?.(c.id)}
          >
            <span
              className={
                "w-7.5 h-7.5 rounded-[9px] grid place-items-center " + icoBg
              }
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3.75 h-3.75 stroke-current fill-none stroke-[1.9]
                           [stroke-linecap:round] [stroke-linejoin:round]"
              >
                {getCategoryIcon(c.id)}
              </svg>
            </span>
            {c.name}
          </button>
        );
      })}
    </div>
  );
}