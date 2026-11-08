import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const TYPE_COLOR = {
  cash: "#0E7C5A",
  wallet: "#D6336C",
  bank: "#3355C4",
  other: "#7C8B85",
};

function initials(name) {
  const cleaned = (name ?? "").trim();
  if (!cleaned) return "?";
  if (cleaned.length <= 2) return cleaned.toUpperCase();
  return cleaned[0].toUpperCase();
}

export function AccountPicker({
  accounts,
  value,
  onChange,
  placeholder = "Select account",
  exclude = null,
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const [rect, setRect] = useState(null);
  const selected = accounts.find((a) => a.id === value) ?? null;
  const available = exclude
    ? accounts.filter((a) => a.id !== exclude)
    : accounts;

  useEffect(() => {
    if (open && btnRef.current) {
      setRect(btnRef.current.getBoundingClientRect());
    }
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between bg-(--card)
                   border border-(--line) rounded-[14px]
                   px-3.5 py-3.25 text-[14px] text-(--ink)
                   cursor-pointer font-[inherit] text-left
                   focus:border-(--brand) outline-none"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          {selected ? (
            <>
              <span
                className="w-6.5 h-6.5 rounded-lg text-white flex-none
                           grid place-items-center text-[11px] font-extrabold"
                style={{ background: TYPE_COLOR[selected.type] ?? "#7C8B85" }}
              >
                {initials(selected.name)}
              </span>
              <span className="truncate">{selected.name}</span>
            </>
          ) : (
            <span className="text-(--muted)">{placeholder}</span>
          )}
        </span>
        <span className="text-(--muted) text-[16px] leading-none">›</span>
      </button>

      {open &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setOpen(false)}
            />
            <div
              className="fixed z-[9999] bg-(--card) border border-(--line) rounded-[14px]
                         shadow-[0_10px_30px_-10px_rgba(14,26,22,0.25)]
                         overflow-hidden max-h-72 overflow-y-auto"
              style={
                rect
                  ? { top: rect.bottom + 4, left: rect.left, width: rect.width }
                  : { display: "none" }
              }
            >
              {available.length === 0 && (
                <div className="px-3.5 py-3 text-[13px] text-(--muted)">
                  No accounts available
                </div>
              )}
              {available.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    onChange(a.id);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-3
                             hover:bg-(--line-2) text-left font-[inherit]
                             text-[14px] text-(--ink) border-0 bg-transparent
                             cursor-pointer"
                >
                  <span
                    className="w-6.5 h-6.5 rounded-lg text-white flex-none
                               grid place-items-center text-[11px] font-extrabold"
                    style={{ background: TYPE_COLOR[a.type] ?? "#7C8B85" }}
                  >
                    {initials(a.name)}
                  </span>
                  <span className="truncate">{a.name}</span>
                  {a.id === value && (
                    <span className="ml-auto text-(--brand) text-[13px]">✓</span>
                  )}
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
