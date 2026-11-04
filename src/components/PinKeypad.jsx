export function PinKeypad({ onDigit, onClear, onBackspace, disabled = false }) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
        <KeypadButton
          key={n}
          onClick={() => onDigit(String(n))}
          disabled={disabled}
          aria-label={`Digit ${n}`}
        >
          {n}
        </KeypadButton>
      ))}

      <KeypadButton
        ghost
        onClick={onClear}
        disabled={disabled}
        aria-label="Clear"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5.5 h-5.5 stroke-current fill-none stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M9 12h6" />
        </svg>
      </KeypadButton>

      <KeypadButton
        onClick={() => onDigit("0")}
        disabled={disabled}
        aria-label="Digit 0"
      >
        0
      </KeypadButton>

      <KeypadButton
        ghost
        onClick={onBackspace}
        disabled={disabled}
        aria-label="Backspace"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5.5 h-5.5 stroke-current fill-none stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
        >
          <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
          <path d="M18 9l-6 6M12 9l6 6" />
        </svg>
      </KeypadButton>
    </div>
  );
}

function KeypadButton({ children, ghost = false, disabled = false, ...props }) {
  // Added transition-all and duration-100 for the press effect
  const base =
    "h-[58px] rounded-[14px] font-semibold text-[21px] cursor-pointer border " +
    "flex items-center justify-center transition-all duration-100 active:scale-[0.94] font-[inherit] ";

  // Added active:bg to give a tactile color change when pressed
  const skin = ghost
    ? "bg-transparent border-transparent text-(--muted) hover:bg-(--line-2) active:bg-(--line-2)"
    : "bg-(--card) border-(--line) text-(--ink) hover:bg-(--line-2) active:bg-(--line)";

  // Disabled styles shouldn't animate or scale
  const disabledStyles = disabled
    ? " opacity-40 cursor-not-allowed active:scale-100 hover:bg-transparent active:bg-transparent"
    : "";

  return (
    <button
      type="button"
      className={`${base} ${skin}${disabledStyles}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
