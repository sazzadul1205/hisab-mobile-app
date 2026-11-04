export function IconButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-9.5 h-9.5 rounded-xl flex-none grid place-items-center
                 bg-(--card) border border-(--line) text-(--ink-2) cursor-pointer"
    >
      <svg
        viewBox="0 0 24 24"
        className="w-4.5 h-4.5 stroke-current fill-none stroke-[1.8]
                   [stroke-linecap:round] [stroke-linejoin:round]"
      >
        {icon}
      </svg>
    </button>
  );
}
