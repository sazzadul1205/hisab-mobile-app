import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";

function PinDot({ filled }) {
  return (
    <i
      className={
        "block w-3.5 h-3.5 rounded-full border-[1.5px] " +
        (filled
          ? "bg-[var(--brand)] border-[var(--brand)]"
          : "bg-transparent border-[#C9D4CF]")
      }
    />
  );
}

function KeypadButton({ children, ghost = false, ...props }) {
  const base =
    "h-[58px] rounded-[14px] font-semibold text-[21px] cursor-pointer border " +
    "flex items-center justify-center transition-colors font-[inherit]";
  const skin = ghost
    ? "bg-transparent border-transparent text-[var(--muted)] hover:bg-[var(--line-2)]"
    : "bg-white border-[var(--line)] text-[var(--ink)] hover:bg-[var(--line-2)]";
  return (
    <button className={`${base} ${skin}`} {...props}>
      {children}
    </button>
  );
}

export default function Unlock() {
  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        {/* Hero */}
        <div className="text-center pt-[44px] pb-[22px]">
          <div
            className="w-16 h-16 rounded-[22px] mx-auto mb-[18px] grid place-items-center
                       bg-[var(--brand-soft)] text-[var(--brand-dk)]"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7 stroke-current fill-none stroke-[1.8]
                         [stroke-linecap:round] [stroke-linejoin:round]"
            >
              <rect x="4" y="10.5" width="16" height="10.5" rx="3" />
              <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
            </svg>
          </div>
          <h2 className="m-0 mb-2 text-[22px] font-bold tracking-[-0.5px]">
            Enter your PIN
          </h2>
          <p className="m-0 mx-auto text-[13px] leading-[1.6] text-[var(--muted)]">
            Hisab is locked
          </p>
        </div>

        {/* Dots — mid-entry mock (2 of 4) */}
        <div className="flex gap-[15px] justify-center">
          <PinDot filled />
          <PinDot filled />
          <PinDot />
          <PinDot />
        </div>

        {/* Throttle error message (mock state after a wrong attempt) */}
        <div className="text-center mt-4">
          <span className="text-[12px] font-semibold text-[var(--out)]">
            Incorrect PIN · try again in 0:12
          </span>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-[10px] mt-[34px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <KeypadButton key={n} aria-label={`Digit ${n}`}>
              {n}
            </KeypadButton>
          ))}

          <KeypadButton ghost aria-label="Clear last digit">
            <svg
              viewBox="0 0 24 24"
              className="w-[22px] h-[22px] stroke-current fill-none stroke-[1.8]
                         [stroke-linecap:round] [stroke-linejoin:round]"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M9 12h6" />
            </svg>
          </KeypadButton>

          <KeypadButton aria-label="Digit 0">0</KeypadButton>

          <KeypadButton ghost aria-label="Confirm PIN">
            <svg
              viewBox="0 0 24 24"
              className="w-[22px] h-[22px] stroke-current fill-none stroke-[1.8]
                         [stroke-linecap:round] [stroke-linejoin:round]"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </KeypadButton>
        </div>

        {/* Forgot PIN */}
        <div className="text-center mt-[22px] pb-2">
          <span className="text-[12px] font-semibold text-[var(--muted)]">
            Forgot PIN?
          </span>
        </div>
      </ScrollArea>
    </PhoneFrame>
  );
}
