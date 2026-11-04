import { useNavigate } from "react-router-dom";

const ICONS = {
  "inc-salary": <path d="M12 4v16M8 8h6a3 3 0 0 1 0 6H8" />,
  "inc-freelance": <path d="M13 3 5 14h6l-1 7 8-11h-6z" />,
  "inc-business": (
    <>
      <path d="M4 5h16v14H4z" />
      <path d="M8 9h8M8 13h5" />
    </>
  ),
  "inc-gift": (
    <path d="M12 3l2.5 5.5L20 9.5l-4 4 1 6-5-2.8L7 19.5l1-6-4-4 5.5-1z" />
  ),
  "inc-side": <path d="M4 12h16M12 4v16" />,
  "inc-other": <path d="M4 12h16M12 4v16" />,
  "exp-groceries": (
    <>
      <path d="M6 7h12l-1 13H7z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </>
  ),
  "exp-bills": (
    <>
      <path d="M4 6h16v12H4z" />
      <path d="M4 11h16" />
    </>
  ),
  "exp-transport": (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  "exp-rent": (
    <>
      <path d="M4 20V9l8-5 8 5v11" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
  "exp-food": <path d="M12 4v16M8 8h6a3 3 0 0 1 0 6H8" />,
  "exp-health": (
    <>
      <path d="M4 5h16v14H4z" />
      <path d="M8 9h8M8 13h5" />
    </>
  ),
  "exp-other": (
    <path d="M12 3l2.5 5.5L20 9.5l-4 4 1 6-5-2.8L7 19.5l1-6-4-4 5.5-1z" />
  ),
  "exp-transfer-fees": (
    <>
      <path d="M4 8h13l-3-3M20 16H7l3 3" />
    </>
  ),
};

const DEFAULT_ICON = <path d="M4 12h16M12 4v16" />;

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
                {ICONS[c.id] ?? DEFAULT_ICON}
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
