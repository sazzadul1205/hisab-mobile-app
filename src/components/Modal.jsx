import { useEffect, useRef } from "react";

export function Modal({ isOpen, onClose, title, children, size = "md" }) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-[320px]",
    md: "max-w-[400px]",
    lg: "max-w-[520px]",
    full: "max-w-[90vw]",
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={contentRef}
        className={`relative w-full ${sizeClasses[size]} bg-(--card) rounded-[20px] shadow-[0_20px_40px_-20px_rgba(0,0,0,0.3)] overflow-hidden animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-(--line)">
          <h2 id="modal-title" className="m-0 text-[16px] font-bold tracking-[-0.15px]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-(--muted) hover:text-(--ink) hover:bg-(--app) transition-colors"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-2 [stroke-linecap:round] [stroke-linejoin:round]">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}