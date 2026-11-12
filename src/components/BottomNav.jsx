import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const NAV_ITEMS = [
  {
    id: "home",
    label: "Home",
    to: "/dashboard",
    icon: (
      <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
    ),
  },
  {
    id: "activity",
    label: "Activity",
    to: "/transactions",
    icon: (
      <>
        <path d="M6 3.5h12v17l-3-1.8-3 1.8-3-1.8-3 1.8z" />
        <path d="M9 8h6M9 12h6" />
      </>
    ),
  },
  {
    id: "budgets",
    label: "Budgets",
    to: "/budgets",
    icon: <path d="M12 5v14M5 12h14" />,
  },
  {
    id: "accounts",
    label: "Accounts",
    to: "/accounts",
    icon: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="3" />
        <path d="M3 10h18" />
        <circle cx="17" cy="14" r="1" />
      </>
    ),
  },
  {
    id: "reports",
    label: "Reports",
    to: "/reports",
    icon: <path d="M5 19V11M11 19V5M17 19v-9" />,
  },
  {
    id: "settings",
    label: "Settings",
    to: "/settings",
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
      </>
    ),
  },
];

const VISIBLE_COUNT = 4; // 3 tabs + "More"
const CLOSE_THRESHOLD = 60; // px dragged down before the sheet closes

export function BottomNav({ active = "home" }) {
  const [expanded, setExpanded] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = useRef(null);

  const visibleItems = NAV_ITEMS.slice(0, VISIBLE_COUNT - 1);
  const moreItems = NAV_ITEMS.slice(VISIBLE_COUNT - 1);
  const moreIsActive = moreItems.some((it) => it.id === active);

  const close = () => {
    setExpanded(false);
    setDragY(0);
  };

  // Close on Escape
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  // Drag-down-to-close on the handle
  const onPointerDown = (e) => {
    startY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (startY.current === null) return;
    setDragY(Math.max(0, e.clientY - startY.current)); // only downward
  };
  const onPointerUp = () => {
    if (dragY > CLOSE_THRESHOLD) close();
    else setDragY(0);
    startY.current = null;
  };

  const iconCls = (isOn, size) =>
    `${size} stroke-current fill-none [stroke-linecap:round] [stroke-linejoin:round] ` +
    (isOn ? "stroke-[2.1]" : "stroke-[1.7]");

  return (
    <nav className="flex-none relative z-50">
      {/* Backdrop (sibling of the bar, so it never covers the bar) */}
      <div
        onClick={close}
        className={`fixed inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ${
          expanded ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sheet: sits directly above the bar, slides up from behind it */}
      <div
        className={`absolute bottom-full left-0 right-0 mx-2 mb-2 rounded-3xl
          bg-(--card) border border-(--line) shadow-2xl
          ${dragY ? "" : "transition-all duration-300 ease-out"}
          ${expanded ? "opacity-100" : "opacity-0 pointer-events-none translate-y-full"}`}
        style={
          expanded && dragY
            ? { transform: `translateY(${dragY}px)` }
            : undefined
        }
        aria-hidden={!expanded}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center pt-2.5 pb-1 cursor-grab touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <span className="h-1 w-10 rounded-full bg-(--line)" />
        </div>

        <div className="grid grid-cols-3 gap-3 p-4 pt-2">
          {moreItems.map((it) => {
            const isOn = it.id === active;
            return (
              <Link
                key={it.id}
                to={it.to}
                onClick={close}
                className="flex flex-col items-center gap-2 no-underline group"
              >
                <span
                  className={`grid place-items-center w-14 h-14 rounded-2xl transition-transform group-active:scale-95 ${
                    isOn
                      ? "bg-(--brand-soft) text-(--brand-dk)"
                      : "bg-(--app) text-(--ink-2)"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className={iconCls(isOn, "w-6 h-6")}>
                    {it.icon}
                  </svg>
                </span>
                <span
                  className={`text-[11px] font-semibold ${
                    isOn ? "text-(--brand-dk)" : "text-(--ink-2)"
                  }`}
                >
                  {it.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* The actual bar: fixed height, never changes */}
      <div className="relative bg-(--card)/90 backdrop-blur-[14px] border-t border-(--line)">
        <div className="grid grid-cols-4 px-1.5 pt-2.5 pb-[calc(8px+env(safe-area-inset-bottom))]">
          {visibleItems.map((it) => {
            const isOn = it.id === active;
            return (
              <Link
                key={it.id}
                to={it.to}
                onClick={close}
                className={
                  "flex flex-col items-center gap-1 py-1 no-underline text-[10px] font-semibold " +
                  (isOn ? "text-(--brand)" : "text-(--muted)")
                }
              >
                <svg
                  viewBox="0 0 24 24"
                  className={iconCls(isOn, "w-5.25 h-5.25")}
                >
                  {it.icon}
                </svg>
                {it.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => (expanded ? close() : setExpanded(true))}
            aria-label={expanded ? "Close menu" : "More"}
            aria-expanded={expanded}
            className={
              "flex flex-col items-center gap-1 py-1 text-[10px] font-semibold " +
              (expanded || moreIsActive ? "text-(--brand)" : "text-(--muted)")
            }
          >
            <svg
              viewBox="0 0 24 24"
              className={
                iconCls(expanded, "w-5.25 h-5.25") +
                " transition-transform duration-300 " +
                (expanded ? "rotate-90" : "")
              }
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
            More
          </button>
        </div>
      </div>
    </nav>
  );
}
