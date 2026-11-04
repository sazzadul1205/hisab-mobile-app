import { Link } from "react-router-dom";

export function SegmentedControl({ options, value, onChange }) {
  return (
    <div
      className="grid gap-1 bg-(--card) border border-(--line) rounded-[14px] p-1 mb-4.5"
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      {options.map((opt) => {
        const isOn = opt.value === value;
        const cls =
          "text-[12.5px] font-bold py-[9px] px-1 rounded-[10px] " +
          "cursor-pointer font-[inherit] transition-colors text-center no-underline " +
          (isOn
            ? "bg-(--brand-soft) text-(--brand-dk)"
            : "bg-transparent text-(--muted)");

        if (opt.to) {
          return (
            <Link key={opt.value} to={opt.to} className={cls}>
              {opt.label}
            </Link>
          );
        }
        return (
          <button
            key={opt.value}
            type="button"
            onClick={onChange ? () => onChange(opt.value) : undefined}
            className={cls}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
