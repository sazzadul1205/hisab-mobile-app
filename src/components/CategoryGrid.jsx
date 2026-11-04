import { useNavigate } from "react-router-dom";
import { getCategoryIcon } from "../constants/categoryIcons";

export function CategoryGrid({ categories, selected, onSelect }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-4 gap-2">
      {categories.map((c) => {
        const isOn = c.id === selected;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className={
              "flex flex-col items-center gap-1.5 py-2.75 px-0.5 rounded-[14px] " +
              "border text-[10px] font-semibold font-[inherit] cursor-pointer " +
              (isOn
                ? "bg-(--brand-soft) border-(--brand) text-(--brand-dk)"
                : "bg-white border-(--line) text-(--ink-2)")
            }
          >
            <span
              className={
                "w-7.5 h-7.5 rounded-[9px] grid place-items-center " +
                (isOn ? "bg-(--brand) text-white" : "bg-(--app) text-(--ink-2)")
              }
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3.75 h-3.75 stroke-current fill-none stroke-[1.9] [stroke-linecap:round] [stroke-linejoin:round]"
              >
                {getCategoryIcon(c.id)}
              </svg>
            </span>
            <span className="leading-tight text-center wrap-break-word w-full px-0.5">
              {c.name}
            </span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => navigate("/categories")}
        className="flex flex-col items-center gap-1.5 py-2.75 px-0.5 rounded-[14px]
                   border border-dashed border-(--line) text-[10px] font-semibold
                   font-[inherit] cursor-pointer bg-white text-(--ink-2)"
      >
        <span className="w-7.5 h-7.5 rounded-[9px] grid place-items-center bg-(--app) text-(--ink-2)">
          <svg
            viewBox="0 0 24 24"
            className="w-3.75 h-3.75 stroke-current fill-none stroke-[1.9] [stroke-linecap:round] [stroke-linejoin:round]"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
        Manage
      </button>
    </div>
  );
}
