import { useNavigate } from "react-router-dom";

export function AppBar({ title, subtitle, showBack = true, right = null }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 pb-3.5">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="w-[38px] h-[38px] rounded-[12px] flex-none grid place-items-center
                     bg-(--card) border border-[var(--line)] cursor-pointer"
          aria-label="Back"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-[18px] h-[18px] stroke-[var(--ink-2)] fill-none stroke-2
                       [stroke-linecap:round] [stroke-linejoin:round]"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h2 className="m-0 text-[23px] font-bold tracking-[-0.5px] leading-tight">
          {title}
        </h2>
        {subtitle && (
          <div className="text-[12.5px] text-[var(--muted)] mt-[3px]">
            {subtitle}
          </div>
        )}
      </div>
      {right}
    </div>
  );
}
